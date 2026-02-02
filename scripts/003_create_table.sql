CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza total de tablas existentes
DROP TABLE IF EXISTS public.user_permission_overrides CASCADE;
DROP TABLE IF EXISTS public.survey_votes CASCADE;
DROP TABLE IF EXISTS public.survey_options CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.server_staff CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.article_categories CASCADE;
DROP TABLE IF EXISTS public.shop_products CASCADE;
DROP TABLE IF EXISTS public.product_types CASCADE;
DROP TABLE IF EXISTS public.server_roadmaps CASCADE;
DROP TABLE IF EXISTS public.game_servers CASCADE;
DROP TABLE IF EXISTS public.stream_schedules CASCADE;
DROP TABLE IF EXISTS public.streamer_socials CASCADE;
DROP TABLE IF EXISTS public.streamers CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.profile_follows;
DROP TABLE IF EXISTS public.article_favorites CASCADE;
DROP TABLE IF EXISTS public.article_comments CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Quién hizo la acción
  actor_id UUID REFERENCES auth.users(id), 
  -- Sobre quién recayó la acción (ej: el usuario baneado)
  target_user_id UUID, 
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  table_name TEXT NOT NULL,
  record_pk JSONB NOT NULL, -- Solo guardaremos el ID del registro
  old_data JSONB, -- Estado anterior
  new_data JSONB, -- Estado nuevo
  -- Metadatos de red (Opcional, Supabase los provee en el contexto)
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para que tu panel de Admin vuele
CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_target ON public.audit_logs(target_user_id);
CREATE INDEX idx_audit_table ON public.audit_logs(table_name);
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.user_game_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL, -- 'minecraft', 'steam', etc.
  game_identifier TEXT NOT NULL,
  -- Control
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, game_key)
);

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  role_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_assignable BOOLEAN DEFAULT true, -- Para control de lo que un admin puede delegar
  weight INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.user_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, role_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

-- NUEVA: Excepciones de Permisos por Usuario
CREATE TABLE public.user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, permission_id, deleted_at)
);

CREATE TABLE public.streamers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  donation_link TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.stream_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streamer_id UUID REFERENCES public.streamers(id) ON DELETE CASCADE,
  start_slot SMALLINT NOT NULL CHECK (start_slot BETWEEN 0 AND 335),
  end_slot SMALLINT NOT NULL CHECK (end_slot BETWEEN 1 AND 336),
  game_name TEXT DEFAULT 'Minecraft',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_range CHECK (start_slot < end_slot)
);

CREATE TABLE public.streamer_socials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streamer_id UUID REFERENCES public.streamers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, 
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  UNIQUE(streamer_id, platform)
);

CREATE TABLE public.game_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_type TEXT NOT NULL, 
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  server_ip TEXT,
  version TEXT,
  max_players INTEGER,
  current_players INTEGER DEFAULT 0,
  image_url TEXT,
  features JSONB,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.server_staff (
  server_id UUID REFERENCES public.game_servers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_server TEXT DEFAULT 'mod',
  PRIMARY KEY (server_id, user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.server_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES public.game_servers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  priority TEXT DEFAULT 'medium',
  estimated_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES public.game_servers(id) ON DELETE CASCADE,
  streamer_id UUID REFERENCES public.streamers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_credits INTEGER NOT NULL,
  product_type TEXT NOT NULL,
  game_commands TEXT[],
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
  amount_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'credits',
  status TEXT NOT NULL DEFAULT 'pending',
  game_command_executed BOOLEAN DEFAULT false,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color_code TEXT DEFAULT '#ffffff',
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_subscription BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.survey_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.survey_votes (
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.survey_options(id) ON DELETE CASCADE,
  PRIMARY KEY (survey_id, user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

-- 1. SEGUIDORES (Relación Perfil a Perfil)
CREATE TABLE public.profile_follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- 2. FAVORITOS (Artículos que le gustan al usuario)
CREATE TABLE public.article_favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, article_id)
);

-- 3. COMENTARIOS (Con soporte para respuestas/hilos)
CREATE TABLE public.article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE, -- Para hilos
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance_credits INTEGER DEFAULT 0 CHECK (balance_credits >= 0),
  -- Control
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ  
);

-- Índices para mejorar velocidad de búsqueda y filtrado de eliminados
CREATE UNIQUE INDEX idx_profiles_username_active ON public.profiles (username) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON public.shop_products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_schedules_streamer ON public.stream_schedules(streamer_id);