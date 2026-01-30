-- Seed Streamers
INSERT INTO public.streamers (name, slug, description, avatar_url, stream_schedule, social_links, donation_link) VALUES
('ElGamerPro', 'elgamerpro', 'Streamer profesional especializado en survival y construcción. Más de 5 años de experiencia en Minecraft y juegos de estrategia.', '/placeholder.svg?height=200&width=200', 
  '{"lunes": "20:00-23:00", "miércoles": "19:00-22:00", "viernes": "21:00-00:00"}',
  '{"twitch": "https://twitch.tv/elgamerpro", "youtube": "https://youtube.com/@elgamerpro", "twitter": "https://twitter.com/elgamerpro"}',
  'https://example.com/donate/elgamerpro'),
  
('TechWarrior', 'techwarrior', 'Experta en shooters y juegos competitivos. Co-op expert en L4D2 y moderadora de la comunidad Streamears.', '/placeholder.svg?height=200&width=200', 
  '{"martes": "18:00-21:00", "jueves": "18:00-21:00", "sábado": "15:00-19:00"}',
  '{"twitch": "https://twitch.tv/techwarrior", "youtube": "https://youtube.com/@techwarrior", "discord": "TechWarrior#1234"}',
  'https://example.com/donate/techwarrior'),
  
('NordicViking', 'nordicviking', 'El rey de Valheim. Constructor de fortalezas épicas y cazador de trolls. Streams relajados y educativos.', '/placeholder.svg?height=200&width=200', 
  '{"lunes": "22:00-01:00", "miércoles": "22:00-01:00", "domingo": "20:00-23:00"}',
  '{"twitch": "https://twitch.tv/nordicviking", "youtube": "https://youtube.com/@nordicviking"}',
  'https://example.com/donate/nordicviking');

-- Seed Game Servers
INSERT INTO public.game_servers (name, game_type, status, description, server_ip, version, max_players, image_url, features) VALUES
('Streamears Survival', 'minecraft', 'active', 'Servidor de supervivencia vanilla con protección de terrenos y economía. ¡Únete a nuestra comunidad y construye tu imperio!', 'mc.streamears.com:25565', '1.20.4', 100, '/placeholder.svg?height=400&width=600', 
  '["Protección de Terrenos", "Economía", "Tiendas de Jugadores", "Eventos Semanales", "Keep Inventory", "Anti-Grief"]'),
  
('Valhalla Awaits', 'valheim', 'coming_soon', 'Próximamente: Servidor de Valheim con mods personalizados. Explora, construye y conquista junto a la comunidad Streamears.', 'valheim.streamears.com:2456', 'Próximamente', 50, '/placeholder.svg?height=400&width=600', 
  '["Mods de Construcción", "Dificultad Aumentada", "Eventos de Boss", "Sistema de Clanes"]'),
  
('Zombie Apocalypse', 'l4d2', 'coming_soon', 'Servidor dedicado de Left 4 Dead 2 con campañas custom y mods. ¡Sobrevive al apocalipsis zombie con tus amigos!', 'l4d2.streamears.com:27015', 'Próximamente', 8, '/placeholder.svg?height=400&width=600', 
  '["Campañas Custom", "Versus Mode", "Mods de Armas", "Estadísticas Avanzadas"]');

-- Seed Server Roadmaps for Minecraft
INSERT INTO public.server_roadmaps (server_id, title, description, status, priority, estimated_date) 
SELECT id, 'Sistema de Clanes', 'Implementación de clanes con territorios propios y guerras entre clanes', 'in_progress', 'high', '2025-02-15'
FROM public.game_servers WHERE game_type = 'minecraft';

INSERT INTO public.server_roadmaps (server_id, title, description, status, priority, estimated_date)
SELECT id, 'Dungeons Personalizadas', 'Nuevas dungeons con jefes únicos y recompensas exclusivas', 'planned', 'high', '2025-03-01'
FROM public.game_servers WHERE game_type = 'minecraft';

INSERT INTO public.server_roadmaps (server_id, title, description, status, priority, estimated_date)
SELECT id, 'Sistema de Misiones', 'Misiones diarias y semanales con recompensas especiales', 'planned', 'medium', '2025-04-01'
FROM public.game_servers WHERE game_type = 'minecraft';

-- Seed Shop Products for Minecraft
INSERT INTO public.shop_products (server_id, name, description, price_in_cents, product_type, game_command, image_url, metadata)
SELECT id, 'Membresía VIP (30 días)', 'Acceso a comandos exclusivos, prefijo VIP, y beneficios especiales durante 30 días', 999, 'membership', '/give {username} minecraft:diamond 10', '/placeholder.svg?height=300&width=300',
  '{"duration_days": 30, "perks": ["Prefijo VIP", "10 Homes", "Kit VIP diario", "Acceso a área VIP"]}'
FROM public.game_servers WHERE game_type = 'minecraft';

INSERT INTO public.shop_products (server_id, name, description, price_in_cents, product_type, game_command, image_url, metadata)
SELECT id, 'Protección de Terreno Grande', 'Reclama un terreno de 100x100 bloques permanentemente', 1499, 'land_claim', '/lands claim {username} 100', '/placeholder.svg?height=300&width=300',
  '{"size": "100x100", "permanent": true}'
FROM public.game_servers WHERE game_type = 'minecraft';

INSERT INTO public.shop_products (server_id, name, description, price_in_cents, product_type, game_command, image_url, metadata)
SELECT id, 'Kit Armadura de Diamante', 'Set completo de armadura de diamante encantada (Protección IV)', 2999, 'item', '/kit diamond_armor {username}', '/placeholder.svg?height=300&width=300',
  '{"enchantments": ["Protección IV", "Irrompibilidad III"]}'
FROM public.game_servers WHERE game_type = 'minecraft';

INSERT INTO public.shop_products (server_id, name, description, price_in_cents, product_type, game_command, image_url, metadata)
SELECT id, 'Elytra Personalizada', 'Elytra con tu nombre y efectos de partículas personalizados', 4999, 'cosmetic', '/give {username} minecraft:elytra 1 {CustomName}', '/placeholder.svg?height=300&width=300',
  '{"customizable": true, "particle_effects": true}'
FROM public.game_servers WHERE game_type = 'minecraft';

-- Seed Blog Articles
INSERT INTO public.articles (title, slug, excerpt, content, cover_image, author_name, author_avatar, category, tags, published, published_at) VALUES
('Guía Definitiva para Sobrevivir en Minecraft 2025', 'guia-minecraft-survival-2025', 'Todo lo que necesitas saber para dominar el survival en Minecraft, desde el primer día hasta derrotar al Ender Dragon.', 
'# Introducción\n\nMinecraft sigue siendo uno de los juegos más populares en 2025...\n\n## Día 1: Los Básicos\n\nLo primero que debes hacer es reunir madera...\n\n## Construyendo tu Base\n\nElige un buen lugar para tu base inicial...\n\n## El Nether y Más Allá\n\nPreparación es clave antes de entrar al Nether...', 
'/placeholder.svg?height=600&width=1200', 'ElGamerPro', '/placeholder.svg?height=100&width=100', 'tutorial', 
ARRAY['minecraft', 'tutorial', 'survival', 'guía'], true, NOW() - INTERVAL '2 days'),

('Las Mejores Construcciones de Valheim que Hemos Visto', 'mejores-construcciones-valheim', 'Una selección de las construcciones más impresionantes creadas por la comunidad de Valheim.', 
'# Construcciones Épicas\n\nLa comunidad de Valheim nunca deja de sorprendernos...\n\n## Fortaleza Vikinga Monumental\n\nEsta construcción llevó más de 100 horas...\n\n## Pueblo Costero Realista\n\nAtención al detalle increíble...', 
'/placeholder.svg?height=600&width=1200', 'NordicViking', '/placeholder.svg?height=100&width=100', 'opinion', 
ARRAY['valheim', 'construcción', 'comunidad'], true, NOW() - INTERVAL '5 days'),

('Left 4 Dead 2 en 2025: Por Qué Sigue Siendo Relevante', 'l4d2-relevancia-2025', 'Análisis de por qué Left 4 Dead 2 continúa siendo uno de los mejores juegos cooperativos después de más de 15 años.', 
'# Un Clásico Atemporal\n\nLeft 4 Dead 2 fue lanzado en 2009, pero sigue siendo...\n\n## Jugabilidad Perfecta\n\nLa mecánica de IA Director es revolucionaria...\n\n## Comunidad Activa\n\nMods, campañas custom y servidores dedicados...', 
'/placeholder.svg?height=600&width=1200', 'TechWarrior', '/placeholder.svg?height=100&width=100', 'review', 
ARRAY['l4d2', 'review', 'cooperative'], true, NOW() - INTERVAL '1 day'),

('Noticias: Nuevo Update de Minecraft Cambia Todo', 'minecraft-update-noticias', 'Mojang anuncia características revolucionarias que cambiarán la forma en que jugamos Minecraft.', 
'# Update Revolucionario\n\nMojang acaba de anunciar el próximo gran update...\n\n## Nuevas Dimensiones\n\nSe añaden dos nuevas dimensiones explorables...\n\n## Sistema de Magia\n\nPor fin, un sistema de magia oficial...', 
'/placeholder.svg?height=600&width=1200', 'ElGamerPro', '/placeholder.svg?height=100&width=100', 'news', 
ARRAY['minecraft', 'noticias', 'update'], true, NOW());
