/**
 * Supabase Browser Client
 *
 * For use in Client Components only.
 * Includes automatic retry logic for network resilience.
 */
import { createBrowserClient } from '@supabase/ssr'
import fetchRetry from 'fetch-retry'

const retryingFetch = fetchRetry(fetch, {
  retries: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // 1s, 2s, 4s capped at 30s
  retryOn: [520, 521, 522, 503], // Cloudflare errors + service unavailable
})

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: retryingFetch,
      },
    }
  )
}
