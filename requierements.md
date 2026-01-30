# 🎮 StreamForce - Especificaciones Técnicas
**URL de Desarrollo:** [http://localhost:3000](http://localhost:3000)

## 📋 Descripción General
Plataforma integral para gestión de comunidades de streamers, servidores de juegos y monetización, construida sobre una arquitectura de permisos de grano fino (RBAC) y un sistema de horarios optimizado por bloques.

## 🏗️ Requisitos de Arquitectura
### 1. Base de Datos (PostgreSQL + Supabase)
- **Sistema de Slots (30 min):** Representación del tiempo semanal en 336 bloques (0-335) para alto rendimiento en consultas de "En Vivo".
- **Esquema de Seguridad (RLS):** - Políticas de acceso público para lectura (`_select_policy`).
  - Control de inserción/edición basado en permisos (`seccion:accion:alcance`).
- **Normalización ISO-Ready:**
  - Implementación de campos de auditoría (`created_at`, `updated_at`, `deleted_at`).
  - Gestión de Staff multi-usuario por servidor.

### 2. Módulos del Sistema
- **Streamer Hub:** Gestión de perfiles, redes sociales y horarios dinámicos.
- **Server Management:** Monitoreo de IPs (ej: `right-letters.gl.joinmc.link`), versiones (1.20.1) y roadmaps de desarrollo.
- **E-commerce:** Tienda con integración de Stripe, manejo de productos (membresías, ítems, cosméticos) y ejecución de comandos in-game vía metadata.
- **Blog & News:** Sistema de artículos con categorías normalizadas y gestión de autoría.
- **Surveys:** Sistema de encuestas exclusivo para suscriptores o abierto al público con protección de doble voto.

### 3. Roles y Permisos (RBAC)
- **Admin:** Control total, gestión de roles y configuración de seguridad.
- **Mod:** Gestión global de contenido y supervisión de servidores.
- **Streamer:** Gestión de su propia sección (`:self`), creación de encuestas y artículos.
- **Subscriber:** Acceso a funciones VIP y votaciones exclusivas.
- **Viewer:** Acceso público y participación base.

## 🛠️ Tecnologías Utilizadas
- **Frontend:** Next.js / React (Puerto 3000).
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Pagos:** Stripe API.
- **Seguridad:** Row Level Security (RLS) y JSON Web Tokens (JWT).

## 🚀 Próximos Pasos (Audit Trail)
- [x] Implementar páginas de autenticación (sign in / sign up) con Supabase Auth
- [x] Crear componentes de formulario para login y registro
- [x] Integrar creación de perfiles y asignación de roles por defecto
- [x] Actualizar navbar con estado de autenticación dinámico
- [x] Implementar Triggers para llenar `updated_at` automáticamente.
- [x] Crear tabla de `audit_logs` para registrar cambios de estado en `purchases` y `user_roles`.
- [x] Configurar Soft Deletes en la tabla de `streamers` y `game_servers`.
- [x] Implementar protección de rutas client-side (debido a static export)
- [x] Implementar gestión de perfiles de usuario
- [x] Agregar funcionalidad de recuperación de contraseña
- [x] Agregar datos iniciales (roles y permisos) al script SQL