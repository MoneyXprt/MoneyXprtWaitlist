'use client';

import { useState } from 'react';
import { sbBrowser } from '../../lib/supabase';

export default function SignupPage() {
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = sbBrowser();

  const handleSignup = async (email: string, password: string, fullName: string) => {
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
      setIsLoading(false);
    } else {
      setMsg('Signup successful! Check your email for confirmation.');
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-16">
      <div className="bg-white p-8 rounded-xl shadow-lg border">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-neutral-600 mb-6">
          Join MoneyXprt to access AI-powered financial tools
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setMsg('');
            
            const formData = e.target as any;
            const email = formData.email.value;
            const password = formData.password.value;
            const fullName = formData.fullName.value;
            
            await handleSignup(email, password, fullName);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              name="fullName" 
              placeholder="John Doe" 
              required 
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            msg.includes('successful') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-neutral-600">
          Already have an account? 
          <a href="/login" className="text-black font-medium underline ml-1">Sign In</a>
        </div>
      </div>
    </main>
  );
}