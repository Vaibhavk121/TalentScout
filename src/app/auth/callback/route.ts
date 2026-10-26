import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler for Supabase PKCE flow.
 *
 * Supabase redirects here after Google consent. Forward the PKCE code
 * or authorization error to the home page for client-side handling.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error_description') ?? searchParams.get('error');

  if (error) {
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('auth_error', error.slice(0, 500));
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    // Pass the code to the client page so the browser-side Supabase
    // client can exchange it for a session via PKCE.
    const redirectUrl = new URL(next, origin);
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl.toString());
  }

  return NextResponse.redirect(`${origin}/`);
}
