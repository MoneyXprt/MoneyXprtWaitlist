'use client';

import { useState } from 'react';

export default function FallbackAuth() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleFallbackAuth = async () => {
    setMsg('Sending...');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMsg('Added to waitlist! We\'ll email you beta access.');
        setEmail('');
      } else {
        setMsg(`Error: ${result.error || 'Failed to join waitlist'}`);
      }
    } catch (err) {
      setMsg('Network error. Please try again.');
      console.error('Fallback auth error:', err);
    }
  };

  return (
    <div className="p-4 border rounded bg-blue-50">
      <h3 className="font-semibold mb-2">Alternative: Join Waitlist</h3>
      <p className="text-sm text-gray-600 mb-3">
        If magic link isn't working, join our waitlist and we'll email you direct access.
      </p>
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="your@email.com"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFallbackAuth()}
        />
        <button 
          onClick={handleFallbackAuth}
          disabled={!email.trim() || !email.includes('@')}
          className="rounded px-3 py-1 bg-green-600 text-white disabled:bg-gray-400"
        >
          Join Waitlist
        </button>
      </div>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}