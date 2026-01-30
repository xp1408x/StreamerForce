-- 1. Seed de Categorías de Blog
INSERT INTO public.article_categories (name, slug, color_code) VALUES
('Tutorial', 'tutorial', '#4ADE80'),
('Noticias', 'news', '#60A5FA'),
('Opinión', 'opinion', '#F472B6'),
('Review', 'review', '#FB923C');

-- 2. Seed de Streamers (Incluyendo SrGato)
-- Nota: En un entorno real, profile_id vendría de auth.users
INSERT INTO public.streamers (name, slug, description, avatar_url, banner_url, donation_link) VALUES
('SrGato', 'srgato', 'Especialista en crónicas y aventuras narrativas en Minecraft. ¡Bienvenidos a las crónicas!', '/placeholder.svg?height=200&width=200', '/placeholder.svg?height=400&width=1200', 'https://example.com/donate/srgato'),
('ElGamerPro', 'elgamerpro', 'Streamer profesional especializado en survival y construcción.', '/placeholder.svg?height=200&width=200', '/placeholder.svg?height=400&width=1200', 'https://example.com/donate/elgamerpro');

-- 3. Seed de Horarios (Sistema de Slots 0-335)
-- SrGato: Lunes de 18:00 (Slot 36) a 21:00 (Slot 42) -> (1*48)+(18*2) = 36
INSERT INTO public.stream_schedules (streamer_id, start_slot, end_slot)
SELECT id, 36, 42 FROM public.streamers WHERE slug = 'srgato';

-- ElGamerPro: Miércoles de 20:00 (Slot 136) a 23:00 (Slot 142) -> (2*48)+(20*2) = 136
INSERT INTO public.stream_schedules (streamer_id, start_slot, end_slot)
SELECT id, 136, 142 FROM public.streamers WHERE slug = 'elgamerpro';

-- 4. Seed de Redes Sociales (Normalizada)
INSERT INTO public.streamer_socials (streamer_id, platform, url)
SELECT id, 'youtube', 'https://www.youtube.com/@CrónicasDelSrGato' FROM public.streamers WHERE slug = 'srgato';

-- 5. Seed de Game Servers (Con tu IP de Minecraft 1.20.1)
INSERT INTO public.game_servers (name, game_type, status, description, server_ip, version, max_players, features) VALUES
('Survival Crónico', 'minecraft', 'active', 'Servidor principal con la comunidad de SrGato y ElGamerPro. Survival técnico y narrativo.', 'right-letters.gl.joinmc.link', '1.20.1', 150, 
 '["Vanish para Staff", "Sistema de Crónicas", "Economía Real", "Protección de Cofres"]');

-- 6. Seed de Server Roadmaps (Usando el nuevo servidor)
INSERT INTO public.server_roadmaps (server_id, title, description, status, priority, estimated_date)
SELECT id, 'Actualización 1.21', 'Migración planificada del servidor a la última versión estable.', 'planned', 'high', '2025-06-01'
FROM public.game_servers WHERE server_ip = 'right-letters.gl.joinmc.link';

INSERT INTO public.server_roadmaps (server_id, title, description, status, priority, estimated_date)
SELECT id, 'Evento de Apertura', 'Gran evento narrativo con SrGato para inaugurar la temporada.', 'in_progress', 'high', '2025-02-10'
FROM public.game_servers WHERE server_ip = 'right-letters.gl.joinmc.link';

-- 7. Seed de Productos de la Tienda
INSERT INTO public.shop_products (server_id, name, description, price_in_cents, product_type, game_command)
SELECT id, 'Rango Gato Legendario', 'Acceso a la zona secreta de las crónicas y cosméticos de gato.', 1500, 'membership', '/lp user {username} parent add legendary_cat'
FROM public.game_servers WHERE server_ip = 'right-letters.gl.joinmc.link';

-- 8. Seed de Artículos de Blog (Relacionados con SrGato)
INSERT INTO public.articles (author_id, category_id, title, slug, excerpt, content, tags, published, published_at)
SELECT 
  NULL, -- author_id se llenaría con un profile_id real
  (SELECT id FROM public.article_categories WHERE slug = 'news'),
  'SrGato se une a la Red de Servidores', 
  'bienvenida-srgato-2025', 
  'Estamos emocionados de anunciar que SrGato traerá sus crónicas a nuestro servidor 1.20.1.',
  '# ¡Bienvenidos a las Crónicas!\n\nEl servidor ya está disponible en **right-letters.gl.joinmc.link** para todos los seguidores...',
  ARRAY['srgato', 'minecraft', 'servidor', 'noticias'],
  true,
  NOW();

-- 9. Seed de Encuestas (Ejemplo de survey:create:self)
INSERT INTO public.surveys (creator_id, title, description, requires_subscription)
SELECT 
  NULL, -- creator_id de SrGato
  '¿Qué temática debería tener el próximo evento?',
  'Vota por el rumbo de la historia en el servidor.',
  true -- Solo para subs
FROM public.streamers WHERE slug = 'srgato' LIMIT 1;

-- Opciones para la encuesta
INSERT INTO public.survey_options (survey_id, option_text)
SELECT id, 'Guerra de Clanes' FROM public.surveys WHERE title ILIKE '%temática%' LIMIT 1;
INSERT INTO public.survey_options (survey_id, option_text)
SELECT id, 'Búsqueda del Tesoro' FROM public.surveys WHERE title ILIKE '%temática%' LIMIT 1;