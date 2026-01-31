CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS TABLE (permission_slug TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios elevados para leer tablas de permisos
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_perms AS (
    -- 1. Obtener permisos a través de los ROLES activos
    SELECT p.slug
    FROM public.permissions p
    JOIN public.role_permissions rp ON rp.permission_id = p.id
    JOIN public.user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = auth.uid()
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND ur.deleted_at IS NULL

    UNION

    -- 2. Sumar permisos habilitados manualmente (Overrides positivos)
    SELECT p.slug
    FROM public.permissions p
    JOIN public.user_permission_overrides upo ON upo.permission_id = p.id
    WHERE upo.user_id = auth.uid()
      AND upo.is_enabled = true
      AND upo.deleted_at IS NULL
  )
  -- 3. Restar permisos deshabilitados manualmente (Overrides negativos)
  SELECT slug FROM user_perms
  WHERE slug NOT IN (
    SELECT p.slug
    FROM public.permissions p
    JOIN public.user_permission_overrides upo ON upo.permission_id = p.id
    WHERE upo.user_id = auth.uid()
      AND upo.is_enabled = false
      AND upo.deleted_at IS NULL
  );
END;
$$;