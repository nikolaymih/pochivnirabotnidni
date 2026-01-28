/**
 * OAuth Callback Route
 *
 * Handles PKCE code exchange after Google OAuth redirect.
 * Exchanges authorization code for session and redirects to app.
 */
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Success - redirect to requested page
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error or no code - redirect to home
  return NextResponse.redirect(`${origin}/`)
}
