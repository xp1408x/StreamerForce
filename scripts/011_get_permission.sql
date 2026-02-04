CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (slug TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_perms AS (
    -- 1. Permisos por ROLES
    SELECT p.slug
    FROM public.permissions p
    JOIN public.role_permissions rp ON rp.permission_id = p.id
    JOIN public.user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = p_user_id
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND ur.deleted_at IS NULL

    UNION

    -- 2. Overrides positivos
    SELECT p.slug
    FROM public.permissions p
    JOIN public.user_permission_overrides upo ON upo.permission_id = p.id
    WHERE upo.user_id = p_user_id
      AND upo.is_enabled = true
      AND upo.deleted_at IS NULL
  )
  -- 3. Menos Overrides negativos
  SELECT up.slug FROM user_perms up
  WHERE up.slug NOT IN (
    SELECT p.slug
    FROM public.permissions p
    JOIN public.user_permission_overrides upo ON upo.permission_id = p.id
    WHERE upo.user_id = p_user_id
      AND upo.is_enabled = false
      AND upo.deleted_at IS NULL
  );
END;
$$;