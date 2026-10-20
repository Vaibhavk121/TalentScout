import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler for Supabase PKCE flow.
 *
 * Supabase redirects here with ?code=... after Google consent.
 * We simply forward the user to the home page — the Supabase
 * client-side JS (detectSessionInUrl + PKCE exchange) will pick
 * up the code from the URL and establish the session automatically.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Pass the code to the client page so the browser-side Supabase
    // client can exchange it for a session via PKCE.
    const redirectUrl = new URL(next, origin);
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl.toString());
  }

  return NextResponse.redirect(`${origin}/`);
}
