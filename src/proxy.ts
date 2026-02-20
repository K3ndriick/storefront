/**
 * proxy.ts
 *
 * TYPE: Next.js Proxy (Edge Runtime)
 * RUNS: On the server, before every matching request - before the page renders
 *
 * Renamed from middleware.ts in Next.js 16. The new name "proxy" better reflects
 * that this runs as a network-level interceptor in front of the app, not as
 * in-process middleware like Express.js.
 *
 * Two jobs:
 *   1. Session refresh  - keeps the Supabase auth token alive on every request
 *   2. Route protection - redirects unauthenticated users away from private pages
 *
 * --- Where it fits in the system ---
 *
 *   Browser request
 *     -> proxy.ts runs first               (this file)
 *       -> session refreshed if needed
 *         -> route protection check
 *           -> page or API route renders
 *
 * --- Why here for session refresh? ---
 *   Supabase access tokens expire after 1 hour.
 *   The server Supabase client refreshes them when it calls getUser(),
 *   but only if something actually calls getUser() on each request.
 *   This proxy is the ideal place: it runs on EVERY request automatically,
 *   ensuring tokens never silently expire mid-session.
 *
 * --- Why getUser() instead of getSession()? ---
 *   getSession() reads the session from cookies only - it does NOT verify
 *   the token with Supabase's servers. It can return stale or tampered data.
 *   getUser() sends the token to Supabase for verification every time.
 *   Always use getUser() in proxy/server components for security.
 *
 * --- Cookie handling: why getAll/setAll here vs get/set/remove in server.ts? ---
 *   In proxy, cookies must be written to BOTH the request AND the response:
 *     - Request cookies: so downstream pages can read the refreshed token
 *     - Response cookies: so the browser stores the refreshed token for next time
 *   The getAll/setAll pattern handles both in one operation.
 *   server.ts only needs to write to the response (simpler), so it uses individual handlers.
 *
 * --- Protected routes (require login) ---
 *   /checkout  - payment flow
 *   /profile   - user account page
 *   /orders    - order history
 *
 * --- Auth routes (redirect away if already logged in) ---
 *   /login
 *   /signup
 *   /forgot-password
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require the user to be authenticated.
// Any path that STARTS WITH one of these will be protected.
// startsWith means /profile/edit is also protected, not just /profile exactly.
const protectedRoutes = ['/checkout', '/profile', '/orders'];

// Routes that authenticated users shouldn't visit (e.g. no point showing /login to someone logged in).
// Visiting these while logged in redirects to home.
const authRoutes = ['/login', '/signup', '/forgot-password'];

export async function proxy(request: NextRequest) {

  // --- Supabase client setup ---
  //
  // We build a mutable response object first so the cookie setAll handler
  // can update it when Supabase writes refreshed tokens.
  //
  // Why `let` not `const`?
  //   setAll() reassigns supabaseResponse to include the updated cookies.
  //   `const` would prevent reassignment and the cookies would be lost.
  //
  // DO NOT add logic between createServerClient and supabase.auth.getUser().
  // The cookie handlers must run uninterrupted for session refresh to work correctly.

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies from the incoming request
        getAll() {
          return request.cookies.getAll();
        },

        // Write refreshed cookies to both request and response.
        // Request: so downstream code can read the new values.
        // Response: so the browser stores the refreshed tokens for the next visit.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // --- Session refresh ---
  // Calling getUser() verifies the token with Supabase and refreshes it if needed.
  // The refreshed token is written to cookies via the setAll handler above.
  // `user` is null if no valid session exists (logged out or expired).
  const { data: { user } } = await supabase.auth.getUser();

  // --- Route protection ---
  //
  // Read the current path from the request URL.
  // pathname is just the path segment, e.g. '/checkout' or '/profile/edit'
  const { pathname } = request.nextUrl;

  // Protect private routes
  // If the user is NOT logged in AND they're trying to visit a protected route:
  // redirect to /login with a ?next= param so we can return them here after login.
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages.
  // No point showing a login form to someone already logged in.
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.nextUrl.origin));
  }

  // All checks passed - return the supabaseResponse (may contain refreshed cookies)
  // IMPORTANT: return supabaseResponse, not NextResponse.next()
  // NextResponse.next() would discard the refreshed cookies written by setAll above.
  return supabaseResponse;
}

// --- Matcher config ---
// Tells Next.js which requests this proxy should run on.
// Without a matcher, it runs on EVERY request including images, fonts, etc.
//
// This pattern means: run on everything EXCEPT:
//   _next/static  - compiled JS/CSS bundles
//   _next/image   - Next.js image optimisation responses
//   favicon.ico   - browser favicon request
//   image files   - .svg, .png, .jpg, .jpeg, .gif, .webp
//
// The (?!...) syntax is a negative lookahead in regex:
// "match paths that do NOT start with any of these patterns"
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
