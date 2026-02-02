// app/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // El middleware se encargará si esto falla en Server Components
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Supabase exchangeCodeForSession error:", error);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Authenticated user:", user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falla, regresa al login con un error
  return NextResponse.redirect(`${origin}/auth/login?error=auth-code-error`);
}