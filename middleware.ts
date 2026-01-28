/**
 * Next.js Middleware
 *
 * Refreshes Supabase auth session on every request to prevent stale sessions.
 * Matcher excludes static assets for performance.
 */
import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
}
