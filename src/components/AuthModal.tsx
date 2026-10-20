'use client';

import React, { useState } from 'react';
import { Copy, Check, Lock, Mail, LogOut, User, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { getSupabaseClient } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  onSignInSuccess: (email: string) => void;
  onSignOut: () => void;
}

const SAMPLE_SQL = `CREATE TABLE IF NOT EXISTS public.saved_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  linkedin_url TEXT NOT NULL,
  source_url TEXT,
  snippet TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pattern_matched',
  confidence_score INTEGER NOT NULL DEFAULT 85,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'not_contacted',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_linkedin UNIQUE (user_id, linkedin_url)
);
ALTER TABLE public.saved_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contacts"
  ON public.saved_contacts FOR ALL
  USING (auth.uid() = user_id);`;

// Google "G" SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthModal({
  isOpen,
  onClose,
  userEmail,
  onSignInSuccess,
  onSignOut,
}: AuthModalProps) {
  const [tab, setTab] = useState<'auth' | 'sql'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMsg('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user?.email) {
          onSignInSuccess(data.user.email);
          onClose();
        } else {
          setErrorMsg('Check your inbox to confirm your email, then sign in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user?.email) {
          onSignInSuccess(data.user.email);
          onClose();
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMsg('Supabase is not configured.');
      return;
    }
    setGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setGoogleLoading(false);
    }
    // On success Supabase redirects the browser — no further action needed
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    onSignOut();
    onClose();
  };

  const copySql = () => {
    navigator.clipboard.writeText(SAMPLE_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userEmail ? 'Your Account' : 'Sign in to TalentScout'}
      description={
        userEmail
          ? 'Manage your session and cloud sync settings.'
          : 'Sign in to save contacts and sync your pipeline across devices.'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div
          className="flex rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['auth', 'sql'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[0.8125rem] font-semibold rounded-lg transition-colors cursor-pointer ${
                tab === t ? 'bg-white/8 text-[#f0f4ff]' : 'text-[#505870] hover:text-[#8892aa]'
              }`}
            >
              {t === 'auth' ? 'Account' : 'Database SQL'}
            </button>
          ))}
        </div>

        {tab === 'auth' ? (
          userEmail ? (
            /* ── Signed-in state ── */
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.2)' }}
                >
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[0.8125rem] font-semibold text-[#f0f4ff]">{userEmail}</p>
                  <p className="text-[11px] text-[#505870]">Active session · Cloud synced</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            /* ── Sign-in / Sign-up form ── */
            <div className="space-y-4">
              {errorMsg && (
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[0.8125rem] text-red-400"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-[0.8125rem] font-semibold text-[#f0f4ff] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
              >
                {googleLoading ? (
                  <svg className="animate-spin w-4 h-4 text-[#8892aa]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <GoogleIcon />
                )}
                <span>{googleLoading ? 'Redirecting…' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span className="text-[11px] font-medium text-[#505870] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Email / Password form */}
              <form onSubmit={handleAuth} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-1.5">
                    Email
                  </label>
                  {/* Icon sits outside the input so it never overlaps placeholder text */}
                  <div
                    className="flex items-center gap-2.5 rounded-xl px-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,142,247,0.5)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(79,142,247,0.1)'; }}
                    onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    <Mail className="w-4 h-4 text-[#505870] shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="flex-1 bg-transparent py-2.5 text-[0.8125rem] text-[#f0f4ff] placeholder-[#505870] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-1.5">
                    Password
                  </label>
                  <div
                    className="flex items-center gap-2.5 rounded-xl px-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,142,247,0.5)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(79,142,247,0.1)'; }}
                    onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    <Lock className="w-4 h-4 text-[#505870] shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="flex-1 bg-transparent py-2.5 text-[0.8125rem] text-[#f0f4ff] placeholder-[#505870] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrorMsg(null); }}
                    className="w-full text-center text-[0.8125rem] text-[#505870] hover:text-blue-400 transition-colors py-1 cursor-pointer"
                  >
                    {mode === 'signin'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          /* ── Database SQL tab ── */
          <div className="space-y-3">
            <p className="text-[0.8125rem] text-[#505870] leading-relaxed">
              Run this once in your Supabase SQL Editor to enable cloud sync:
            </p>
            <div className="relative">
              <pre
                className="p-4 rounded-xl text-[11px] font-mono text-[#8892aa] overflow-x-auto max-h-52 leading-relaxed whitespace-pre-wrap"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {SAMPLE_SQL}
              </pre>
              <button
                onClick={copySql}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-all text-[#8892aa] hover:text-[#f0f4ff]"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {sqlCopied
                  ? <><Check className="w-3 h-3 text-emerald-400" /><span>Copied</span></>
                  : <><Copy className="w-3 h-3" /><span>Copy</span></>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
