/**
 * auth/callback/route.ts
 *
 * TYPE: Next.js Route Handler (server-side HTTP endpoint)
 * URL:  /auth/callback
 * METHOD: GET
 *
 * This is NOT a traditional REST API - it does not return JSON for frontend use.
 * It is a server-side redirect handler: it receives an external redirect,
 * performs server work, then redirects the browser onward. No component ever
 * calls this directly - it is triggered solely by Supabase email links.
 *
 * --- Where it fits in the system ---
 *
 *   1. User triggers an email action (sign up, password reset)
 *   2. Supabase sends an email with a link pointing to this route:
 *        https://yoursite.com/auth/callback?code=abc123&next=/forgot-password/confirm
 *   3. User clicks the link -> browser hits GET /auth/callback
 *   4. This handler runs on the server:
 *        a. Exchanges the one-time code for a real session (PKCE flow)
 *        b. Session is written into cookies by the server Supabase client
 *        c. Browser is redirected to the `next` destination
 *   5. User lands on the target page (e.g. /forgot-password/confirm) already authenticated
 *
 * --- Callers ---
 *   - Supabase email confirmation links  (after sign up)
 *   - Supabase password reset links      (after resetPassword() is called)
 *   - Any future magic link flows
 *
 * --- PKCE (Proof Key for Code Exchange) ---
 *   A security enhancement for OAuth-style flows.
 *   The `code` in the URL is single-use and short-lived (cannot be reused or guessed).
 *   exchangeCodeForSession() sends it to Supabase's servers, which validate it and
 *   return a real access token + refresh token stored securely in cookies.
 *   This is why we can't read the session directly from the URL - exchange is required.
 *
 * --- Why a Route Handler (not a Server Component)? ---
 *   Route Handlers (route.ts) handle raw HTTP and can return NextResponse.redirect()
 *   before any HTML is rendered - exactly what a callback/redirect flow needs.
 *   Server Components render HTML and cannot issue a clean server-side redirect
 *   as the first response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // NextRequest gives us access to the incoming URL and its search params.
  // request.nextUrl is a URL object - it has .searchParams, .origin, .pathname, etc.
  const { searchParams, origin } = request.nextUrl;

  // --- Step 1: URL parameters ---
  //
  // `code`  - the single-use PKCE code Supabase embedded in the email link
  //           Example: searchParams.get('code') → 'pkce_abc123xyz'
  //           This is what we exchange for a real session.
  //
  // `next`  - where to send the user after the exchange succeeds
  //           Example: searchParams.get('next') → '/forgot-password/confirm'
  //           Falls back to '/' if not present (nullish coalescing ?? operator)
  //
  // searchParams.get('key') returns the value or null
  // Use ?? '/' for next so it defaults to home if missing

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // --- Step 2: Exchange the code for a session ---
  //
  // If we have a code, create a server Supabase client and call:
  //   supabase.auth.exchangeCodeForSession(code)
  //
  // This verifies the code with Supabase's servers and:
  //   - Creates a session (access token + refresh token)
  //   - Writes the session into cookies (handled by the server client's cookie handlers)
  //
  // On success: redirect the user to `next`
  // On failure: redirect to `${origin}/auth/error` (a fallback error page)
  //
  // If there is no code at all: also redirect to error
  //
  // Code exchange implementation
  //   1. Check if code exists
  //   2. If yes: create supabase client (await createClient())
  //   3. Call exchangeCodeForSession(code) and destructure { error }
  //   4. If no error: return NextResponse.redirect(new URL(next, origin))
  //   5. If error or no code: return NextResponse.redirect(new URL('/auth/error', origin))

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[auth/callback] exchangeCodeForSession error:', error);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL('/auth/error', origin));
}
