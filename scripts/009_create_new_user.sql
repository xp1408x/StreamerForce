CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
DECLARE
    viewer_role_id UUID;
    v_username TEXT;
BEGIN
    -- 1. Lógica de Username (El trigger de auditoría no hace esto)
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username', 
        NEW.raw_user_meta_data->>'name', 
        split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
    );

    -- 2. Perfil (Solo insertamos datos de perfil, los campos _by y _at los pone tu trigger)
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        v_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', v_username),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- 3. Wallet
    INSERT INTO public.wallets (user_id, balance_credits)
    VALUES (NEW.id, 0);

    -- 4. Rol inicial
    SELECT id INTO viewer_role_id FROM public.roles WHERE name = 'viewer';
    IF viewer_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.id, viewer_role_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- El trigger que dispara la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_setup();

  -- Ejecuta esto una sola vez para ti mismo
INSERT INTO public.user_roles (user_id, role_id) 
VALUES ('TU-UUID-AQUÍ', (SELECT id FROM public.roles WHERE name = 'super_admin'));

CREATE OR REPLACE FUNCTION public.manage_user_role(
    p_target_user_id UUID,
    p_role_name TEXT,
    p_action TEXT DEFAULT 'assign' -- 'assign' o 'remove'
)
RETURNS JSONB AS $$
DECLARE
    v_role_id UUID;
    v_admin_id UUID := auth.uid();
BEGIN
    -- 1. VALIDACIÓN DE SEGURIDAD BÁSICA
    -- Para asignar cualquier rol de staff, mínimo se necesita este permiso
    IF NOT has_permission('admin:users:manage') THEN
        RAISE EXCEPTION 'Acceso denegado: No tienes permisos para gestionar usuarios.';
    END IF;

    -- 2. PROTECCIÓN DE RANGOS ALTOS
    -- Si el rol objetivo es admin o super_admin, se requiere el permiso de sistema
    IF (p_role_name IN ('admin', 'super_admin')) AND NOT has_permission('perm:manage:system') THEN
        RAISE EXCEPTION 'Acceso denegado: Solo un administrador de sistema puede asignar rangos de alto nivel.';
    END IF;

    -- 3. OBTENER EL ID DEL ROL
    SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'El rol % no existe en el sistema.', p_role_name;
    END IF;

    -- 4. EJECUTAR ACCIÓN
    IF p_action = 'assign' THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (p_target_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
    ELSIF p_action = 'remove' THEN
        -- No permitimos que alguien se borre a sí mismo su rol de admin por accidente
        IF p_target_user_id = v_admin_id AND p_role_name = 'admin' THEN
            RAISE EXCEPTION 'No puedes quitarte tu propio rol de administrador.';
        END IF;

        DELETE FROM public.user_roles 
        WHERE user_id = p_target_user_id AND role_id = v_role_id;
    ELSE
        RAISE EXCEPTION 'Acción no reconocida. Usa assign o remove.';
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'message', format('Rol %s %s correctamente', p_role_name, 
        CASE WHEN p_action = 'assign' THEN 'asignado' ELSE 'removido' END)
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;