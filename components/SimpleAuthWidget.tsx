'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function SimpleAuthWidget() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [msg, setMsg] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    return (
      <div className="flex items-center gap-2">
        <a href="/login" className="rounded px-3 py-1 bg-black text-white text-sm">Sign In</a>
        <a href="/signup" className="rounded px-3 py-1 bg-blue-600 text-white text-sm">Sign Up</a>
      </div>
    );
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setIsSignedIn(true);
        setUserEmail(data.user.email || '');
      }
    };
    checkSession();

    const { data: sub } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setIsSignedIn(true);
        setUserEmail(session.user.email || '');
        if (event === 'SIGNED_IN') {
          window.location.assign('/app');
        }
      } else {
        setIsSignedIn(false);
        setUserEmail('');
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      setMsg('All fields are required');
      return;
    }

    setMsg('Creating account...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/app`
      }
    });

    if (error) {
      console.error('Signup error:', error.message);
      setMsg(`Signup failed: ${error.message}`);
    } else {
      setMsg('Signup successful! Check your email for confirmation.');
      setEmail('');
      setPassword('');
      setFullName('');
      setShowSignup(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setMsg('Email and password required');
      return;
    }

    setMsg('Signing in...');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMsg(`Sign in failed: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    setUserEmail('');
    setMsg('');
  };

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-700">Signed in: {userEmail}</span>
        <a href="/app" className="text-sm underline">Open Beta</a>
        <button onClick={handleSignOut} className="rounded-lg px-3 py-1 bg-neutral-200">Sign out</button>
      </div>
    );
  }

  if (showSignup) {
    return (
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button 
          onClick={handleSignup}
          className="rounded px-3 py-1 bg-green-600 text-white text-sm"
        >
          Sign Up
        </button>
        <button 
          onClick={() => setShowSignup(false)}
          className="rounded px-3 py-1 bg-gray-300 text-sm"
        >
          Cancel
        </button>
        {msg && <span className="text-xs text-red-600">{msg}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href="/login" className="rounded px-3 py-1 bg-black text-white text-sm">
        Sign In
      </a>
      <a href="/signup" className="rounded px-3 py-1 bg-blue-600 text-white text-sm">
        Sign Up
      </a>
    </div>
  );
}
