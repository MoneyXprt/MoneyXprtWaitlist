'use client';

import { useState } from 'react';

export default function SimpleAuthWidget() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleEmailSignup = async () => {
    setMsg('Sending...');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMsg('✅ Added to waitlist! Check your email for beta access.');
        setEmail('');
        // Simulate sign-in for demo purposes
        setIsSignedIn(true);
        setUserEmail(email.trim());
      } else {
        setMsg(result.message || result.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setMsg('Network error. Please try again.');
      console.error('Signup error:', err);
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserEmail('');
    setMsg('');
  };

  return (
    <div className="flex items-center gap-3">
      {isSignedIn ? (
        <>
          <span className="text-sm text-neutral-700">Beta Access: {userEmail}</span>
          <a href="/app" className="text-sm underline">Open Beta</a>
          <button onClick={handleSignOut} className="rounded-lg px-3 py-1 bg-neutral-200">Sign out</button>
        </>
      ) : (
        <>
          <input
            className="border rounded px-2 py-1"
            placeholder="you@work.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailSignup()}
          />
          <button 
            onClick={handleEmailSignup} 
            disabled={!email.trim() || !email.includes('@')}
            className="rounded-lg px-3 py-1 bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Get Beta Access
          </button>
          {msg && <span className="text-sm text-green-600">{msg}</span>}
        </>
      )}
    </div>
  );
}