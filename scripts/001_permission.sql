-- =============================================================================
-- 1. ACTUALIZACIÓN DE TABLA PERMISSIONS (Asegurar columnas)
-- =============================================================================
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 10;

-- =============================================================================
-- 2. INSERCIÓN DE PERMISOS CON PESOS Y ASIGNABILIDAD
-- =============================================================================
INSERT INTO public.permissions (slug, description, weight, is_assignable) VALUES

  -- NÚCLEO Y PERFIL (Nivel 10)
  ('profile:view:all', 'Ver perfiles de otros usuarios', 10, true),
  ('profile:edit:self', 'Editar información propia', 10, true),
  ('identity:manage:self', 'Vincular cuentas de Minecraft, Steam, etc.', 10, true),

  -- ECONOMÍA
  ('wallet:view:self', 'Ver saldo propio y transacciones', 10, true),
  ('wallet:transfer:self', 'Enviar créditos a otros usuarios', 10, true),
  ('wallet:manage:all', 'Ajustar saldos de cualquier usuario', 100, false),

  -- BLOG
  ('blog:read', 'Leer artículos publicados', 10, true),
  ('blog:create:self', 'Crear artículos propios', 30, true),
  ('blog:create:all', 'Crear artículos a nombre de otros', 50, true),
  ('blog:edit:self', 'Editar artículos propios', 30, true),
  ('blog:edit:all', 'Editar cualquier artículo', 50, true),
  ('blog:delete:all', 'Borrado de cualquier artículo', 80, true),
  ('blog:comment:create', 'Comentar en artículos', 10, true),
  ('blog:comment:moderate', 'Borrar comentarios de otros', 50, true),

  -- TIENDA
  ('shop:purchase', 'Comprar productos con créditos', 10, true),
  ('shop:item:manage:self', 'Gestionar sus propios productos', 30, true),
  ('shop:item:manage:all', 'Gestionar todos los productos de la tienda', 80, true),
  ('shop:item:approve', 'Aprobar productos pendientes de streamers', 50, true),
  ('shop:stats:view:self', 'Ver ingresos propios de sus ventas', 30, true),
  ('shop:stats:view:all', 'Ver ingresos globales de la plataforma', 80, true),
  ('shop:purchase:all', 'Ver historial de compras global', 80, true),
  ('shop:refund:all', 'Gestionar devoluciones y estados de pago', 80, true),
  ('shop:coupon:manage', 'Gestionar cupones de descuento', 80, true),
  ('shop:support:manage', 'Gestionar tickets de soporte y disputas', 50, true),

  -- SERVIDORES & STAFF
  ('server:view', 'Ver lista y estado de servidores', 10, true),
  ('server:manage:self', 'Gestionar servidores donde es Staff', 50, true),
  ('server:manage:all', 'Gestionar cualquier servidor/roadmap', 80, true),
  ('server:staff:assign:all', 'Asignar personal a cualquier servidor', 80, true),

  -- ENCUESTAS
  ('survey:vote:self', 'Votar en encuestas de tu streamer favorito', 10, true),
  ('survey:vote:subs', 'Votar en encuestas exclusivas para suscriptores', 20, true),
  ('survey:manage:all', 'Crear o borrar cualquier encuesta', 50, true),
  ('survey:manage:self', 'Crear o borrar tu propia encuesta', 30, true),

  -- STREAMS
  ('stream:manage:self', 'Gestionar su propio perfil y slots', 30, true),
  ('stream:manage:all', 'Gestionar slots de cualquier streamer', 80, true),

  -- SOCIAL
  ('social:follow:self', 'Seguir o dejar de seguir perfiles', 10, true),
  ('social:comment:self', 'Comentar en artículos', 10, true),
  ('social:comment:all', 'Moderar comentarios de otros', 50, true),
  ('social:favorite:self', 'Guardar artículos en favoritos', 20, true),

  -- INTEGRACIÓN DE JUEGOS
  ('game:command:execute', 'Ejecutar comandos de consola', 80, true),
  ('game:whitelist:manage', 'Administrar acceso a la whitelist', 80, true),

  -- ADMINISTRACIÓN Y SEGURIDAD (Niveles 80-100)
  ('admin:users:manage', 'Gestionar roles y datos de usuarios', 80, true),
  ('admin:user:ban', 'Suspender o banear acceso', 50, true), -- Permitimos que Mods baneen, pero el permiso es peso 50
  ('admin:audit:view', 'Ver logs de auditoría', 80, true),
  ('admin:restore', 'Restaurar registros eliminados', 80, true),
  ('admin:system:config', 'Configurar API Keys y parámetros globales', 100, false),
  ('storage:manage:all', 'Gestionar archivos físicos', 100, false),
  ('perm:manage:assign', 'Vincular permisos existentes a roles', 100, true),
  ('perm:manage:system', 'Crear nuevos permisos en el sistema', 100, false)

ON CONFLICT (slug) DO UPDATE SET 
  weight = EXCLUDED.weight,
  is_assignable = EXCLUDED.is_assignable,
  description = EXCLUDED.description;

-- =============================================================================
-- 3. ASIGNACIÓN DE PERMISOS A ROLES
-- =============================================================================
TRUNCATE public.role_permissions CASCADE;

-- VIEWER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'viewer' AND p.slug IN (
  'profile:edit:self', 'profile:view:all', 'identity:manage:self', 'wallet:view:self',
  'blog:read', 'blog:comment:create', 'shop:purchase', 'server:view', 
  'social:follow:self', 'social:comment:self', 'survey:vote:self'
);

-- SUBSCRIBER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'subscriber' AND (
  p.slug IN ('survey:vote:subs', 'social:favorite:self')
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'viewer')
);

-- STREAMER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'streamer' AND (
  p.slug IN ('blog:create:self', 'blog:edit:self', 'shop:item:manage:self', 'shop:stats:view:self', 'stream:manage:self', 'survey:manage:self', 'server:manage:self')
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'viewer')
);

-- MOD
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'mod' AND (
  p.slug IN ('blog:create:all', 'blog:edit:all', 'blog:delete:all', 'blog:comment:moderate', 'social:comment:all', 'shop:item:approve', 'shop:support:manage', 'survey:manage:all', 'admin:user:ban')
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'viewer')
);

-- ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND (
  p.slug IN ('admin:users:manage', 'admin:restore', 'server:manage:all', 'server:staff:assign:all', 'shop:item:manage:all', 'shop:refund:all', 'shop:coupon:manage', 'shop:stats:view:all', 'shop:purchase:all', 'game:command:execute', 'game:whitelist:manage', 'stream:manage:all', 'wallet:transfer:self', 'admin:audit:view')
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'mod')
);

-- SUPER ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin' AND (
  p.slug IN ('wallet:manage:all', 'admin:system:config', 'storage:manage:all', 'perm:manage:assign', 'perm:manage:system')
  OR p.id IN (SELECT permission_id FROM public.role_permissions rp JOIN public.roles r2 ON rp.role_id = r2.id WHERE r2.name = 'admin')
);