CREATE OR REPLACE VIEW public.view_audit_summary AS
SELECT 
    a.created_at as fecha,
    actor.username as administrador,
    a.action as accion,
    a.table_name as tabla,
    target.username as afectado,
    a.old_data,
    a.new_data
FROM public.audit_logs a
LEFT JOIN public.profiles actor ON a.actor_id = actor.id
LEFT JOIN public.profiles target ON a.target_user_id = target.id
ORDER BY a.created_at DESC;

CREATE OR REPLACE FUNCTION public.get_my_max_level()
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(r.role_level), 0)
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND ur.deleted_at IS NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Eliminamos la función por si hay conflicto de tipos
DROP FUNCTION IF EXISTS public.active_permission_slugs(public.profiles);

-- 2. La recreamos con un tipado ultra-explícito
CREATE OR REPLACE FUNCTION public.active_permission_slugs(p public.profiles)
RETURNS text[] 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    ARRAY(SELECT slug FROM public.get_user_permissions(p.id)), 
    '{}'::text[]
  );
$$;

-- 3. IMPORTANTE: PostgREST necesita ver que la función pertenece al esquema público
ALTER FUNCTION public.active_permission_slugs(public.profiles) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.active_permission_slugs(public.profiles) TO authenticated;
GRANT EXECUTE ON FUNCTION public.active_permission_slugs(public.profiles) TO anon;

-- 4. Notificar a PostgREST que recargue el esquema (esto limpia el error 400)
NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION public.get_moderation_data(p_user_id UUID)
RETURNS TABLE (
  slug TEXT,
  is_override BOOLEAN,
  is_enabled BOOLEAN,
  weight INTEGER,
  short_description TEXT
) 
LANGUAGE sql
STABLE
SECURITY INVOKER -- Importante: Respeta tus RLS
AS $$
  SELECT 
    p.slug,
    (upo.id IS NOT NULL) as is_override,
    (CASE WHEN upo.id IS NOT NULL THEN upo.is_enabled ELSE true END) as is_enabled,
    p.weight,
    p.short_description
  FROM public.get_user_permissions(p_user_id) gup
  JOIN public.permissions p ON p.slug = gup.slug
  LEFT JOIN public.user_permission_overrides upo ON upo.permission_id = p.id 
    AND upo.user_id = p_user_id 
    AND upo.deleted_at IS NULL;
$$;