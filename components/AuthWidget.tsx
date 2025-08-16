'use client';

import { useEffect, useState } from 'react';
import { sbBrowser } from '../lib/supabase';

export default function AuthWidget() {
  const supabase = sbBrowser();
  const [email, setEmail] = useState('');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setSessionEmail(data.user?.email ?? null);
    };
    getSession();
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === 'SIGNED_IN') window.location.assign('/app');
      getSession();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function emailRedirect() {
    return `${window.location.origin}/`; // or '/app'
  }

  const handleEmail = async () => {
    setMsg('');
    const redirectTo = await emailRedirect();

    // First try signInWithOtp (works for both new and existing users)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: redirectTo,
        shouldCreateUser: true  // This allows creating new users with magic links
      }
    });

    if (error) {
      setMsg(`Authentication failed: ${error.message}`);
      console.error('Supabase auth error:', error);
    } else {
      setMsg('Check your email for the login link.');
      setEmail(''); // Clear the input on success
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSessionEmail(null);
  };

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
            disabled={!email.trim() || !email.includes('@')}
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