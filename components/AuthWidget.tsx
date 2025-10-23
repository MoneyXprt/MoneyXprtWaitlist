'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { AuthChangeEvent } from '@supabase/supabase-js';

export default function AuthWidget() {
  const [supabase, setSupabase] = useState<any>(null);
  const [initError, setInitError] = useState('');
  const [email, setEmail] = useState('');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      const client = getSupabaseBrowser();
      if (!client) {
        setInitError('Supabase disabled: missing env');
        return;
      }
      setSupabase(client);
    } catch (err: any) {
      setInitError(err.message);
      console.error('Supabase initialization failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setSessionEmail(data.user?.email ?? null);
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    
    getSession();
    
    const { data: sub } = supabase.auth.onAuthStateChange((evt: AuthChangeEvent) => {
      if (evt === 'SIGNED_IN') window.location.assign('/app');
      getSession();
    });
    
    return () => { sub.subscription.unsubscribe(); };
  }, [supabase]);

  async function emailRedirect() {
    return `${window.location.origin}/`; // or '/app'
  }

  const handleEmail = async () => {
    if (!supabase) {
      setMsg('Authentication system not ready. Please try the waitlist instead.');
      return;
    }
    
    setMsg('Sending...');
    
    try {
      const redirectTo = await emailRedirect();

      console.log('Attempting Supabase auth with:', { email, redirectTo });
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { 
          emailRedirectTo: redirectTo,
          shouldCreateUser: true
        }
      });

      if (error) {
        console.error('Supabase auth error:', error);
        setMsg(`Error: ${error.message || 'Connection failed'}`);
      } else {
        setMsg('Check your email for the login link.');
        setEmail('');
      }
    } catch (err) {
      console.error('Network error:', err);
      setMsg('Connection failed. Please use the waitlist option below.');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSessionEmail(null);
  };

  if (initError) {
    return (
      <div className="text-sm text-red-600">
        Auth system error. Please use waitlist below.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {sessionEmail ? (
        <>
          <span className="text-sm text-neutral-700">Signed in: {sessionEmail}</span>
          <a href="/app" className="text-sm underline">Open Beta</a>
          <button onClick={signOut} className="rounded-lg px-3 py-1 bg-neutral-200">Sign out</button>
        </>
      ) : (
        <>
          <input
            className="border rounded px-2 py-1"
            placeholder="you@work.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
          />
          <button 
            onClick={handleEmail} 
            disabled={!email.trim() || !email.includes('@') || !supabase}
            className="rounded-lg px-3 py-1 bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Email me a link
          </button>
          {msg && <span className="text-sm text-red-600">{msg}</span>}
        </>
      )}
    </div>
  );
}
