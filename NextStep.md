🛡️ Guía de Implementación: Roles y Permisos (RBAC)
Este documento detalla la reestructuración de la base de datos y la estrategia de visualización para los paneles de administración en la web.

1. Estrategia de Interfaz (Frontend)
Para responder a tu duda sobre si editar dentro del post o en un panel:

A. Edición Inline (Contextual)
Cuándo usarlo: Para acciones rápidas (Editar texto, borrar un comentario).

Lógica: Si el usuario está viendo un post de su autoría y tiene blog:edit:self, o si es mod/admin y tiene blog:edit:all, muestra un botón de "Editar" sobre el contenido.

Beneficio: No sacas al usuario de la navegación.

B. El Panel (Dashboard)
Cuándo usarlo: Para gestión de datos masivos.

Rutas recomendadas:

/dashboard/streamer: Ver ventas totales, subir nuevos productos.

/dashboard/mod: Ver lista de reportes, usuarios baneados.

/dashboard/admin: Ver logs de auditoría, cambiar roles de usuarios.

Implementación en Next.js (Frontend)
Ahora, puedes llamar a esta función desde un Hook o una página. Esto te devolverá un array de strings, que es mucho más fácil de manejar que andar haciendo joins en el cliente.

// hooks/usePermissions.ts
import { createClient } from '@/utils/supabase/client'; // Tu config de supabase
import { useEffect, useState } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPermissions() {
      const { data, error } = await supabase.rpc('get_my_permissions');

      if (error) {
        console.error("Error cargando permisos:", error);
      } else {
        // Transformamos el formato de tabla a un array simple de strings
        setPermissions(data.map((p: any) => p.permission_slug));
      }
      setLoading(false);
    }

    fetchPermissions();
  }, []);

  const hasPermission = (slug: string) => permissions.includes(slug);

  return { permissions, hasPermission, loading };
}

Ejemplo componenets:

// hooks/usePermissions.ts
import { createClient } from '@/utils/supabase/client'; // Tu config de supabase
import { useEffect, useState } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPermissions() {
      const { data, error } = await supabase.rpc('get_my_permissions');

      if (error) {
        console.error("Error cargando permisos:", error);
      } else {
        // Transformamos el formato de tabla a un array simple de strings
        setPermissions(data.map((p: any) => p.permission_slug));
      }
      setLoading(false);
    }

    fetchPermissions();
  }, []);

  const hasPermission = (slug: string) => permissions.includes(slug);

  return { permissions, hasPermission, loading };
}

2. Próximos Pasos Técnicos
Crear una Vista en Postgres: Crea una vista llamada user_permissions que una user_roles con role_permissions para consultar fácilmente qué puede hacer un usuario desde Next.js. (esto ya fue creado y ejecutado en scripts/011_get_permission.sql0)

Middleware de Seguridad: Configura el middleware de Next.js para que si alguien intenta entrar a /dashboard/admin, verifique que en Supabase tenga el rol necesario.

Un Middleware es, en términos sencillos, un "interceptor" o un "portero". Es un código que se ejecuta después de que el usuario hace clic en un enlace o escribe una URL, pero antes de que la página termine de cargarse o la API responda.


¿Para qué sirve un Middleware?
Seguridad (Tu caso principal): Verificar si el usuario está logueado antes de dejarlo entrar al /dashboard. Si no tiene sesión, lo mandas de patitas a la calle (al /login).

Protección de Roles: Evitar que un viewer entre a /dashboard/admin simplemente escribiendo la URL.

Redirecciones: Si tu sitio está en mantenimiento o si quieres mover a los usuarios de una página vieja a una nueva.

Rendimiento y Rate Limit: Como mencionaste que te preocupa la factura de Vercel/Hostinger, el middleware puede bloquear ataques básicos o demasiadas peticiones de una sola IP antes de que lleguen a gastar recursos de tu base de datos.

Configuración del middleware.ts para Supabase y Next.js
Como estás en Hostinger, el middleware de Next.js es vital porque protege tus rutas a nivel de servidor Node.js. Aquí tienes una estructura base para gestionar tus roles:

// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 1. Inicializar Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
      },
    }
  )

  // 2. Obtener la sesión del usuario
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 3. PROTEGER RUTAS POR ROL
  // Si intenta entrar al dashboard de admin
  if (url.pathname.startsWith('/dashboard/admin')) {
    // Aquí puedes chequear el role en el user_metadata de Supabase
    // (Asegúrate de guardar el rol en la metadata al crear el usuario o sincronizarlo)
    const userRole = user?.app_metadata?.role; 

    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Si intenta entrar a cualquier parte del dashboard sin estar logueado
  if (url.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// 4. CONFIGURAR QUÉ RUTAS ACTIVAN EL MIDDLEWARE
export const config = {
  matcher: [
    '/dashboard/:path*', // Protege todo lo que empiece con /dashboard
    '/profile/:path*',   // Protege el perfil
  ],
}

Audit Logs: Asegúrate de que cada vez que un Admin use blog:delete:all, se guarde en la tabla audit_logs quién lo hizo y por qué.