-- =============================================================================
-- 1. EXTENDER TABLA permissions
-- =============================================================================
ALTER TABLE public.permissions
ADD COLUMN IF NOT EXISTS short_description VARCHAR(32);

-- =============================================================================
-- 2. PERMISOS
-- =============================================================================
INSERT INTO public.permissions (
  slug,
  description,
  short_description,
  weight,
  is_assignable
) VALUES

-- NÚCLEO Y PERFIL
('profile:view:all', 'Ver perfiles de otros usuarios', 'Ver perfiles', 10, true),
('profile:edit:self', 'Editar información propia', 'Editar perfil', 10, true),
('identity:manage:self', 'Vincular cuentas de Minecraft, Steam, etc.', 'Vincular cuentas', 10, true),

-- ECONOMÍA
('wallet:view:self', 'Ver saldo propio y transacciones', 'Ver saldo', 10, true),
('wallet:transfer:self', 'Enviar créditos a otros usuarios', 'Transferir', 10, true),
('wallet:manage:all', 'Ajustar saldos de cualquier usuario', 'Ajustar saldo', 100, false),

-- BLOG
('blog:read', 'Leer artículos publicados', 'Leer artículos', 10, true),
('blog:create:self', 'Crear artículos propios', 'Crear artículo', 30, true),
('blog:create:all', 'Crear artículos a nombre de otros', 'Crear artículos', 50, true),
('blog:edit:self', 'Editar artículos propios', 'Editar artículo', 30, true),
('blog:edit:all', 'Editar cualquier artículo', 'Editar artículos', 50, true),
('blog:delete:all', 'Borrado de cualquier artículo', 'Eliminar artículo', 80, true),
('blog:comment:create', 'Comentar en artículos', 'Comentar', 10, true),
('blog:comment:moderate', 'Borrar comentarios de otros', 'Moderar', 50, true),

-- TIENDA
('shop:purchase', 'Comprar productos con créditos', 'Comprar', 10, true),
('shop:item:manage:self', 'Gestionar sus propios productos', 'Mis productos', 30, true),
('shop:item:manage:all', 'Gestionar todos los productos de la tienda', 'Gestionar productos', 80, true),
('shop:item:approve', 'Aprobar productos pendientes de streamers', 'Aprobar productos', 50, true),
('shop:stats:view:self', 'Ver ingresos propios de sus ventas', 'Mis ingresos', 30, true),
('shop:stats:view:all', 'Ver ingresos globales de la plataforma', 'Ingresos globales', 80, true),
('shop:purchase:all', 'Ver historial de compras global', 'Historial compras', 80, true),
('shop:refund:all', 'Gestionar devoluciones y estados de pago', 'Devoluciones', 80, true),
('shop:coupon:manage', 'Gestionar cupones de descuento', 'Cupones', 80, true),
('shop:support:manage', 'Gestionar tickets de soporte y disputas', 'Soporte', 50, true),

-- SERVIDORES & STAFF
('server:view', 'Ver lista y estado de servidores', 'Ver servidores', 10, true),
('server:manage:self', 'Gestionar servidores donde es Staff', 'Gestionar servidor', 50, true),
('server:manage:all', 'Gestionar cualquier servidor/roadmap', 'Gestionar Servidores', 80, true),
('server:staff:assign:all', 'Asignar personal a cualquier servidor', 'Asignar staff', 80, true),

-- ENCUESTAS
('survey:vote:self', 'Votar en encuestas de tu streamer favorito', 'Votar', 10, true),
('survey:vote:subs', 'Votar en encuestas exclusivas para suscriptores', 'Votar subs', 20, true),
('survey:manage:all', 'Crear o borrar cualquier encuesta', 'Gestionar encuestas', 50, true),
('survey:manage:self', 'Crear o borrar tu propia encuesta', 'Gestionar encuesta', 30, true),

-- STREAMS
('stream:manage:self', 'Gestionar su propio perfil y slots', 'Gestionar stream', 30, true),
('stream:manage:all', 'Gestionar slots de cualquier streamer', 'Gestionar todos', 80, true),

-- SOCIAL
('social:follow:self', 'Seguir o dejar de seguir perfiles', 'Seguir perfil', 10, true),
('social:comment:all', 'Moderar comentarios de otros', 'Moderar comentarios', 50, true),
('social:favorite:self', 'Guardar artículos en favoritos', 'Guardar favoritos', 20, true),

-- INTEGRACIÓN DE JUEGOS
('game:command:execute', 'Ejecutar comandos de consola', 'Ejecutar comandos', 80, true),
('game:whitelist:manage', 'Administrar acceso a la whitelist', 'Administrar whitelist', 80, true),

-- ADMINISTRACIÓN Y SEGURIDAD
('admin:users:manage', 'Gestionar roles y datos de usuarios', 'Asignar roles', 80, true),
('admin:user:ban', 'Suspender o banear acceso', 'Gestionar Ban', 50, true),
('admin:audit:view', 'Ver logs de auditoría', 'Ver auditoría', 80, true),
('admin:restore', 'Restaurar registros eliminados', 'Restaurar Registro', 80, true),
('admin:system:config', 'Configurar API Keys y parámetros globales', 'Configurar sistema', 100, false),
('storage:manage:all', 'Gestionar archivos físicos', 'Gestionar archivos', 100, false),
('perm:manage:assign', 'Vincular permisos existentes a roles', 'Asignar permiso', 100, true),
('perm:manage:system', 'Crear nuevos permisos en el sistema', 'Crear permiso', 100, false)

ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  weight = EXCLUDED.weight,
  is_assignable = EXCLUDED.is_assignable;

-- =============================================================================
-- 3. ASIGNACIÓN DE PERMISOS A ROLES
-- =============================================================================
TRUNCATE public.role_permissions CASCADE;

-- VIEWER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'viewer' AND p.slug IN (
  'profile:edit:self',
  'profile:view:all',
  'identity:manage:self',
  'wallet:view:self',
  'blog:read',
  'blog:comment:create',
  'shop:purchase',
  'server:view',
  'social:follow:self',
  'survey:vote:self'
);

-- SUBSCRIBER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'subscriber' AND (
  p.slug IN ('survey:vote:subs', 'social:favorite:self')
  OR p.id IN (
    SELECT permission_id
    FROM public.role_permissions rp
    JOIN public.roles r2 ON rp.role_id = r2.id
    WHERE r2.name = 'viewer'
  )
);

-- STREAMER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'streamer' AND (
  p.slug IN (
    'blog:create:self',
    'blog:edit:self',
    'shop:item:manage:self',
    'shop:stats:view:self',
    'stream:manage:self',
    'survey:manage:self',
    'server:manage:self'
  )
  OR p.id IN (
    SELECT permission_id
    FROM public.role_permissions rp
    JOIN public.roles r2 ON rp.role_id = r2.id
    WHERE r2.name = 'viewer'
  )
);

-- MOD
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'mod' AND (
  p.slug IN (
    'blog:create:all',
    'blog:edit:all',
    'blog:delete:all',
    'blog:comment:moderate',
    'social:comment:all',
    'shop:item:approve',
    'shop:support:manage',
    'survey:manage:all',
    'admin:user:ban'
  )
  OR p.id IN (
    SELECT permission_id
    FROM public.role_permissions rp
    JOIN public.roles r2 ON rp.role_id = r2.id
    WHERE r2.name = 'viewer'
  )
);

-- ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND (
  p.slug IN (
    'admin:users:manage',
    'admin:restore',
    'server:manage:all',
    'server:staff:assign:all',
    'shop:item:manage:all',
    'shop:refund:all',
    'shop:coupon:manage',
    'shop:stats:view:all',
    'shop:purchase:all',
    'game:command:execute',
    'game:whitelist:manage',
    'stream:manage:all',
    'wallet:transfer:self',
    'admin:audit:view'
  )
  OR p.id IN (
    SELECT permission_id
    FROM public.role_permissions rp
    JOIN public.roles r2 ON rp.role_id = r2.id
    WHERE r2.name = 'mod'
  )
);

-- SUPER ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin' AND (
  p.slug IN (
    'wallet:manage:all',
    'admin:system:config',
    'storage:manage:all',
    'perm:manage:assign',
    'perm:manage:system'
  )
  OR p.id IN (
    SELECT permission_id
    FROM public.role_permissions rp
    JOIN public.roles r2 ON rp.role_id = r2.id
    WHERE r2.name = 'admin'
  )
);
