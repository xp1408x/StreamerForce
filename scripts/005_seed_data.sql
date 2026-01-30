-- DATOS INICIALES PARA STREAMEARS
-- Este archivo contiene todos los datos de seed necesarios para el funcionamiento básico del sistema

-- =============================================================================
-- ROLES DEL SISTEMA
-- =============================================================================

INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Acceso total: infraestructura, finanzas y permisos del sistema'),
  ('admin', 'Administrador: gestión de usuarios, servidores y tienda'),
  ('mod', 'Moderador: control de contenido, comentarios y baneos'),
  ('streamer', 'Creador: gestión de su propia tienda, artículos y streams'),
  ('subscriber', 'VIP: acceso a encuestas exclusivas y funciones premium'),
  ('viewer', 'Usuario: lectura, comentarios y compras básicas')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- PERMISOS DEL SISTEMA
-- =============================================================================

INSERT INTO public.permissions (slug, description) VALUES

  -- NÚCLEO Y PERFIL
  ('profile:view:all', 'Ver perfiles de otros usuarios'),
  ('profile:edit:self', 'Editar información propia'),
  ('identity:manage:self', 'Vincular cuentas de Minecraft, Steam, etc.'),

  -- ECONOMÍA (NUEVO)
  ('wallet:view:self', 'Ver saldo propio y transacciones'),
  ('wallet:transfer:self', 'Enviar créditos a otros usuarios'),
  ('wallet:manage:all', 'Ajustar saldos de cualquier usuario (Admin)'),

-- BLOG (Sección:Acción:Alcance)
  ('blog:read', 'Leer artículos publicados'),
  ('blog:create:self', 'Crear artículos propios'),
  ('blog:create:all', 'Crear artículos a nombre de otros'),
  ('blog:edit:self', 'Editar artículos propios'),
  ('blog:edit:all', 'Editar cualquier artículo'),
  ('blog:delete:all', 'Borrado de cualquier artículo'),
  ('blog:comment:create', 'Comentar en artículos'),
  ('blog:comment:moderate', 'Borrar comentarios de otros'),

  -- TIENDA
  ('shop:purchase', 'Comprar productos con créditos'),
  ('shop:item:manage:self', 'Gestionar sus propios productos (Streamer)'),
  ('shop:item:manage:all', 'Gestionar todos los productos de la tienda'),
  ('shop:item:approve', 'Aprobar productos pendientes de streamers'),
  ('shop:stats:view:self', 'Ver ingresos propios de sus ventas'),
  ('shop:stats:view:all', 'Ver ingresos globales de la plataforma'),
  
  ('shop:purchase:all', 'Ver historial de compras global'),
  ('shop:refund:all', 'Gestionar devoluciones y estados de pago'),

  ('shop:coupon:manage', 'Gestionar cupones de descuento'),
  ('shop:support:manage', 'Gestionar tickets de soporte y disputas'),

  -- SERVIDORES & STAFF
  ('server:view', 'Ver lista y estado de servidores'),
  ('server:manage:self', 'Gestionar servidores donde es Staff'),
  ('server:manage:all', 'Gestionar cualquier servidor/roadmap'),
  ('server:staff:assign:all', 'Asignar personal a cualquier servidor'),

  -- ENCUESTAS
  ('survey:vote:self', 'Votar en encuestas de tu streamer favorito'),
  ('survey:vote:subs', 'Votar en encuestas exclusivas para suscriptores'),
  ('survey:manage:all', 'Crear o borrar cualquier encuesta'),
  ('survey:manage:self', 'Crear o borrar tu propia encuesta'),

  -- STREAMS
  ('stream:manage:self', 'Gestionar su propio perfil y slots'),
  ('stream:manage:all', 'Gestionar slots de cualquier streamer'),

  -- Social
  ('social:follow:self', 'Seguir o dejar de seguir perfiles'),
  ('social:comment:self', 'Comentar en artículos'),
  ('social:comment:all', 'Moderar comentarios de otros'),
  ('social:favorite:self', 'Guardar artículos en favoritos'),

  -- INTEGRACIÓN DE JUEGOS (COMANDOS)
  ('game:command:execute', 'Ejecutar comandos de consola directamente al servidor'),
  ('game:whitelist:manage', 'Administrar acceso a la whitelist del servidor'),

  -- ADMINISTRACIÓN Y SEGURIDAD
  ('admin:users:manage', 'Gestionar roles y datos de usuarios'),
  ('admin:user:ban', 'Suspender o banear acceso a la plataforma'),
  ('admin:audit:view', 'Ver logs de auditoría (quién hizo qué)'),
  ('admin:restore', 'Restaurar registros marcados como eliminados (soft delete)'),
  ('admin:system:config', 'Configurar API Keys y parámetros globales'),
  ('storage:manage:all', 'Gestionar archivos físicos en el almacenamiento'),
  ('perm:manage:assign', 'Vincular permisos existentes a roles'),
  ('perm:manage:system', 'Crear nuevos permisos en el sistema')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- ASIGNACIÓN DE PERMISOS A ROLES
-- =============================================================================
-- ==========================================
-- VIEWER (El nivel más bajo)
-- ==========================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'viewer' 
AND p.slug IN (
  'profile:edit:self', 'profile:view:all', 'identity:manage:self', 'wallet:view:self',
  'blog:read', 'blog:comment:create', 'shop:purchase', 
  'server:view', 'social:follow:self', 'social:comment:self', 
  'social:favorite:self', 'survey:vote:self'
);

-- ==========================================
-- SUBSCRIBER (Viewer + Ventajas VIP)
-- ==========================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'subscriber' 
AND (
  p.slug IN ('survey:vote:subs')
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'viewer')
);

-- ==========================================
-- STREAMER (Subscriber + Gestión de su marca)
-- ==========================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'streamer' 
AND (
  p.slug IN (
    'blog:create:self', 'blog:edit:self', 'shop:item:manage:self', 
    'shop:stats:view:self', 'stream:manage:self', 'survey:manage:self', 'server:manage:self'
  )
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'subscriber')
);

-- ==========================================
-- MOD (Moderación de comunidad)
-- ==========================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'mod' 
AND (
  p.slug IN (
    'blog:create:all', 'blog:edit:all', 'blog:delete:all', 'blog:comment:moderate', 'social:comment:all',
    'shop:item:approve', 'shop:support:manage', 'survey:manage:all', 'admin:user:ban'
  )
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'viewer')
);

-- ==========================================
-- ADMIN (Gestión operativa del negocio)
-- ==========================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin' 
AND (
  p.slug IN (
    'admin:users:manage', 'admin:restore', 'server:manage:all', 
    'server:staff:assign:all', 'shop:item:manage:all', 'shop:refund:all', 'shop:coupon:manage', 'shop:stats:view:all', 'shop:purchase:all',
    'game:command:execute', 'game:whitelist:manage', 'stream:manage:all', 'wallet:transfer:self', 'admin:audit:view'
  )
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'mod')
);

-- ==========================================
-- SUPER ADMIN (Todo, incluyendo sistema y dinero)
-- ==========================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin' 
AND (
  p.slug IN (
    'wallet:manage:all', 'admin:system:config', 'storage:manage:all', 
    'perm:manage:assign', 'perm:manage:system'
  )
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'admin')
);

-- =============================================================================
-- DATOS DE EJEMPLO (OPCIONALES)
-- =============================================================================

-- Ejemplo de servidor de Minecraft
INSERT INTO public.game_servers (name, game_type, status, description, server_ip, version, max_players, features) VALUES
  ('Streamears SMP', 'minecraft', 'active', 'Servidor Survival Multiplayer oficial de Streamears', 'mc.streamears.com', '1.20.1', 100, '["survival", "economy", "claims", "shops"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Ejemplo de categorías de artículos
INSERT INTO public.article_categories (name, slug, color_code, icon_url) VALUES
  ('Noticias', 'noticias', '#3b82f6', '/icons/news.svg'),
  ('Reviews', 'reviews', '#10b981', '/icons/review.svg'),
  ('Tutoriales', 'tutoriales', '#f59e0b', '/icons/tutorial.svg'),
  ('Opinión', 'opinion', '#ef4444', '/icons/opinion.svg')
ON CONFLICT (slug) DO NOTHING;

-- Ejemplo de tipos de productos
INSERT INTO public.product_types (name) VALUES
  ('membership'),
  ('item'),
  ('cosmetic')
ON CONFLICT (name) DO NOTHING;
END $$;