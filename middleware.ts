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
  if (url.pathname.startsWith("/dashboard/admin")) {
    // Aquí puedes chequear el role en el user_metadata de Supabase
    // (Asegúrate de guardar el rol en la metadata al crear el usuario o sincronizarlo)
    const userRole = user?.app_metadata?.role; 

    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Si intenta entrar a cualquier parte del dashboard sin estar logueado
  if (url.pathname.startsWith("/dashboard") && !user) {
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