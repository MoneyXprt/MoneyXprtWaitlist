'use client';

import { useState } from 'react';
import { sbBrowser } from '../../lib/supabase';

export default function LoginPage() {
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = sbBrowser();

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error.message);
      setMsg(`Sign in failed: ${error.message}`);
      setIsLoading(false);
    } else {
      // Redirect will happen automatically via auth state change
      setMsg('Signing in...');
      window.location.assign('/app');
    }
  };

  return (
    <main className="max-w-md mx-auto mt-16">
      <div className="bg-white p-8 rounded-xl shadow-lg border">
        <h1 className="text-2xl font-bold mb-2">Sign In</h1>
        <p className="text-neutral-600 mb-6">
          Access your MoneyXprt dashboard
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setMsg('');
            
            const formData = e.target as any;
            const email = formData.email.value;
            const password = formData.password.value;
            
            await handleSignIn(email, password);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="you@work.com" 
              required 
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            msg.includes('Signing in') 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account? 
          <a href="/signup" className="text-black font-medium underline ml-1">Sign Up</a>
        </div>
      </div>
    </main>
  );
}