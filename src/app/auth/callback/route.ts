import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Exchange the code for a session server-side
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the app — the session cookie is now set
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('Auth callback error:', error.message);
  }

  // Something went wrong — redirect home with an error flag
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
}
