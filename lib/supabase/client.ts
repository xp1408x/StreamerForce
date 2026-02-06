import { createBrowserClient } from "@supabase/ssr"

// Wrap global fetch to log outgoing Supabase requests (client-side)
function ensureSupabaseFetchLogger() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return

    const marker = '__supabase_fetch_logger_v1__'
    if ((globalThis as any)[marker]) return
    (globalThis as any)[marker] = true

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
          try { console.info(JSON.stringify(payload)) } catch (e) { /* ignore */ }
        }
      } catch (e) {
        // ignore logging errors
      }
      return originalFetch.call(globalThis, input, init)
    }
  } catch (e) {
    // ignore
  }
}

export function createClient() {
  // ensure fetch logger is attached before creating the client
  ensureSupabaseFetchLogger()
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
