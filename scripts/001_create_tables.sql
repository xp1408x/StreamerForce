-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Streamers table
CREATE TABLE IF NOT EXISTS public.streamers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  stream_schedule JSONB, -- {"monday": "20:00-23:00", "wednesday": "19:00-22:00"}
  social_links JSONB, -- {"twitch": "url", "youtube": "url", "twitter": "url"}
  donation_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game servers table
CREATE TABLE IF NOT EXISTS public.game_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_type TEXT NOT NULL, -- 'minecraft', 'valheim', 'l4d2'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'coming_soon', 'maintenance'
  description TEXT,
  server_ip TEXT,
  version TEXT,
  max_players INTEGER,
  current_players INTEGER DEFAULT 0,
  image_url TEXT,
  features JSONB, -- ["PvP", "Creative Mode", "Custom Plugins"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Server roadmap items
CREATE TABLE IF NOT EXISTS public.server_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES public.game_servers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  estimated_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop products table
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES public.game_servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_in_cents INTEGER NOT NULL,
  product_type TEXT NOT NULL, -- 'membership', 'item', 'land_claim', 'cosmetic'
  game_command TEXT, -- Command to execute in-game
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB, -- Extra data like {"armor_type": "diamond", "duration_days": 30}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  category TEXT, -- 'review', 'news', 'tutorial', 'opinion'
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table (tracks all purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount_paid INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  minecraft_username TEXT, -- For in-game delivery
  game_command_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (optional, for registered users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  minecraft_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.streamers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access for most tables
CREATE POLICY "Public can view streamers" ON public.streamers FOR SELECT USING (true);
CREATE POLICY "Public can view game servers" ON public.game_servers FOR SELECT USING (true);
CREATE POLICY "Public can view roadmaps" ON public.server_roadmaps FOR SELECT USING (true);
CREATE POLICY "Public can view active products" ON public.shop_products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published articles" ON public.articles FOR SELECT USING (published = true);

-- Profiles - Users can read all profiles but only update their own
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Purchases - Users can only see their own purchases
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streamers_slug ON public.streamers(slug);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_server_roadmaps_server ON public.server_roadmaps(server_id, status);
CREATE INDEX IF NOT EXISTS idx_shop_products_server ON public.shop_products(server_id, is_active);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON public.purchases(stripe_session_id);
