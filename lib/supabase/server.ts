import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createBrowserClient } from '@supabase/supabase-js'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `cookies` API only works in a Server Component or Route Handler. You might want to consider doing this on the client side. 
          // But if you are certain this is intended for a Server Component, then you must call it from a Server Component or Route Handler.
        }
      },
    },
  })
}

export function createStaticClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
