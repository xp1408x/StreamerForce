-- Perfiles: Búsqueda por nombre de usuario (Solo activos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_active ON public.profiles (username) WHERE deleted_at IS NULL;

-- Blog: Búsqueda por Slug para SEO
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug) WHERE deleted_at IS NULL;

-- Tienda/Streamers: Búsqueda por Slugs
CREATE INDEX IF NOT EXISTS idx_streamers_slug ON public.streamers(slug) WHERE deleted_at IS NULL;

-- Relaciones de Usuario (RLS de Ownership)
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_identities_user_id ON public.user_game_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_streamers_profile_id ON public.streamers(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_servers_owner_id ON public.game_servers(owner_id);

-- Relaciones de Social y Seguimiento
CREATE INDEX IF NOT EXISTS idx_profile_follows_follower ON public.profile_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_profile_follows_following ON public.profile_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_article_favorites_user ON public.article_favorites(user_id);

-- Relaciones de Tienda y Compras
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_streamer ON public.shop_products(streamer_id);
CREATE INDEX IF NOT EXISTS idx_stream_schedules_streamer ON public.stream_schedules(streamer_id);

-- Filtrado masivo de registros eliminados (ISO Compliance)
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON public.articles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shop_products_deleted_at ON public.shop_products(deleted_at) WHERE deleted_at IS NULL;

-- Filtrado por estados de visibilidad (RLS Select)
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published) WHERE published = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shop_products_active_status ON public.shop_products(status) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_surveys_active ON public.surveys(is_active) WHERE is_active = true AND deleted_at IS NULL;

-- Auditoría: Orden cronológico inverso (lo más reciente primero)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Permisos Overrides: Búsqueda rápida por usuario
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user ON public.user_permission_overrides(user_id) WHERE deleted_at IS NULL;

