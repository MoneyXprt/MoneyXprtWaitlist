'use client';

import { useState, useEffect } from 'react';
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
    const { data: sub } = supabase.auth.onAuthStateChange(() => getSession());
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const signIn = async () => {
    setMsg('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin }});
    setMsg(error ? error.message : 'Check your email for the login link.');
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
          <button onClick={signOut} className="rounded-lg px-3 py-1 bg-neutral-200">Sign out</button>
        </>
      ) : (
        <>
          <input
            className="border rounded px-2 py-1"
            placeholder="you@work.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button onClick={signIn} className="rounded-lg px-3 py-1 bg-black text-white">Email me a magic link</button>
          {msg && <span className="text-sm text-neutral-600">{msg}</span>}
        </>
      )}
    </div>
  );
}