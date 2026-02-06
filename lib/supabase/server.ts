import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createBrowserClient } from '@supabase/supabase-js'

export async function createClient() {
  const cookieStore = await cookies()

  // Attach a fetch logger for server-side requests to Supabase to help detect duplicates.
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const marker = '__supabase_fetch_logger_v1_server__'
    if (supabaseUrl && !(globalThis as any)[marker]) {
      ;(globalThis as any)[marker] = true
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (input: RequestInfo, init?: RequestInit) => {
        try {
          const url = typeof input === 'string' ? input : (input as Request).url
          if (url && supabaseUrl && url.includes(new URL(supabaseUrl).host)) {
            const payload = {
              event: 'supabase_request',
              method: init?.method || (typeof input === 'string' ? 'GET' : (input as Request).method),
              url,
              timestamp: new Date().toISOString(),
              stack: (new Error().stack || '').split('\n').slice(2,6),
            }
            try { console.info(JSON.stringify(payload)) } catch (e) { }
          }
        } catch (e) {}
        return originalFetch.call(globalThis, input, init)
      }
    }
  } catch (e) {
    // ignore logging setup errors
  }

  // Note: Using NEXT_PUBLIC_* vars is safe here because Supabase's anon key is limited by RLS policies.
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
