-- Función para verificar si un usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION public.has_permission(requested_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    override_status BOOLEAN;
BEGIN
    -- 1. Verificar si existe un Override (prioridad absoluta)
    SELECT is_enabled INTO override_status
    FROM public.user_permission_overrides upo
    JOIN public.permissions p ON upo.permission_id = p.id
    WHERE upo.user_id = auth.uid() 
      AND p.slug = requested_permission
      AND upo.deleted_at IS NULL
      AND (upo.expires_at IS NULL OR upo.expires_at > NOW());
    -- Si hay override, retornamos su estado
    IF override_status IS NOT NULL THEN
        RETURN override_status;
    END IF;

    -- 2. Si no hay override, verificar permisos por Rol
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid() 
          AND p.slug = requested_permission
          AND ur.deleted_at IS NULL
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Función para obtener el slot actual basado en la hora del servidor
CREATE OR REPLACE FUNCTION public.get_current_slot()
RETURNS SMALLINT AS $$
DECLARE
    now_ts TIMESTAMP WITH TIME ZONE := NOW() AT TIME ZONE 'UTC'; -- O tu zona horaria
    day_offset INTEGER := EXTRACT(DOW FROM now_ts); -- 0 (Dom) a 6 (Sab)
    hour_val INTEGER := EXTRACT(HOUR FROM now_ts);
    minute_val INTEGER := EXTRACT(MINUTE FROM now_ts);
BEGIN
    -- Ajustamos Lunes=0 para tu lógica (DOW suele ser Dom=0)
    -- Si tu 0 es Lunes, restamos 1 y manejamos el negativo
    day_offset := (day_offset + 6) % 7; 
    RETURN (day_offset * 48) + (hour_val * 2) + (CASE WHEN minute_val >= 30 THEN 1 ELSE 0 END);
END;
$$ LANGUAGE plpgsql;

-- Consulta: ¿Qué streamers están en horario ahora?
SELECT s.name 
FROM public.streamers s
JOIN public.stream_schedules sch ON s.id = sch.streamer_id
WHERE sch.start_slot <= get_current_slot() 
  AND sch.end_slot > get_current_slot()
  AND sch.is_active = true;

  -- Función para manejo completo de auditoría (Creación y Actualización)
CREATE OR REPLACE FUNCTION public.handle_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = now();
        NEW.updated_at = now();
        NEW.created_by = COALESCE(auth.uid(), NEW.created_by);
        NEW.updated_by = COALESCE(auth.uid(), NEW.updated_by);
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = now();
        NEW.updated_by = COALESCE(auth.uid(), NEW.updated_by);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

ALTER TABLE public.permissions ADD COLUMN is_assignable BOOLEAN DEFAULT true;

-- Marcamos permisos críticos como NO asignables por moderadores
UPDATE public.permissions 
SET is_assignable = false 
WHERE slug IN ('wallet:manage:all', 'admin:system:config', 'storage:manage:all', 
    'perm:manage:assign', 'perm:manage:system', 'admin:users:manage', 'admin:restore', 'server:manage:all', 
    'server:staff:assign:all', 'shop:item:manage:all', 'shop:refund:all', 'shop:coupon:manage', 'shop:stats:view:all', 'shop:purchase:all',
    'game:command:execute', 'game:whitelist:manage', 'stream:manage:all', 'wallet:transfer:self', 'admin:audit:view');


-- 2. Registrar cada cambio en la tabla de auditoría
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_target_user UUID := NULL;
BEGIN
  -- Intentamos capturar el usuario afectado de forma dinámica
  IF (TG_OP = 'DELETE') THEN
    -- En delete, buscamos en OLD
    IF (to_jsonb(OLD) ? 'user_id') THEN v_target_user := OLD.user_id; END IF;
  ELSE
    -- En insert/update, buscamos en NEW
    IF (to_jsonb(NEW) ? 'user_id') THEN v_target_user := NEW.user_id; END IF;
  END IF;

  INSERT INTO public.audit_logs (
    actor_id, 
    target_user_id, 
    action, 
    table_name, 
    record_pk, 
    old_data, 
    new_data
  )
  VALUES (
    auth.uid(), 
    v_target_user,
    TG_OP, 
    TG_TABLE_NAME, 
    jsonb_build_object('id', COALESCE(NEW.id, OLD.id)), 
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  IF (TG_OP = 'DELETE') THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Permitir que usuarios logueados ejecuten funciones
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.purchase_product_with_credits(UUID) TO authenticated;
-- Esto asegura que nadie pueda hacer nada que no permitas explícitamente en tus POLICY
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;