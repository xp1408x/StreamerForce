DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'roles', 'permissions', 'role_permissions', 'profiles', 'user_roles', 
        'streamers', 'stream_schedules', 'game_servers', 'server_roadmaps', 
        'shop_products', 'article_categories', 'articles', 'purchases', 
        'server_staff', 'surveys', 'survey_options', 'survey_votes', 
        'product_types', 'streamer_socials'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Añadir created_by si no existe
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL', t);
                -- Añadir created_at (asegurar que exista)
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()', t);
        -- Añadir updated_by
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL', t);
        -- Añadir updated_at (asegurar que exista)
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', t);
        -- Añadir deleted_at para Soft Deletes
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', t);
    END LOOP;
END $$;

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'roles', 'permissions', 'role_permissions', 'profiles', 'user_roles', 
        'streamers', 'stream_schedules', 'game_servers', 'server_roadmaps', 
        'shop_products', 'article_categories', 'articles', 'purchases', 
        'server_staff', 'surveys', 'survey_options', 'survey_votes', 
        'product_types', 'streamer_socials'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Eliminar trigger si ya existe para evitar duplicados
        EXECUTE format('DROP TRIGGER IF EXISTS %I_audit_trigger ON public.%I', t, t);
        -- Crear el nuevo trigger
        EXECUTE format('CREATE TRIGGER %I_audit_trigger 
                        BEFORE INSERT OR UPDATE ON public.%I 
                        FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields()', t, t);
    END LOOP;
END $$;