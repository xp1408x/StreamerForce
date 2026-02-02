// middleware.ts (DEBE llamarse así y estar en la raíz)
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // 🛡️ REGLAS DE ACCESO

  // 1. Si no hay usuario y trata de entrar al dashboard
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // 2. Si el usuario está logueado pero intenta entrar a login/register
  if (user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 3. Protección de nivel Admin
  if (pathname.startsWith("/dashboard/admin")) {
    // IMPORTANTE: El rol debe estar en app_metadata
    const userRole = user?.app_metadata?.role
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - archivos con extensiones (svg, png, jpg, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}