'use client';

import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/config/env';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordClient() {
  const router = useRouter();
  const [supabase] = useState(() =>
    createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );
      if (error) setErr(error.message);
      else setReady(true);
    })();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) setErr(error.message);
    else {
      setMsg('Password updated. Redirecting to the app…');
      setTimeout(() => router.replace('/app'), 1200);
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border p-6 bg-white shadow-sm">
        <h1 className="text-xl font-semibold">Set a new password</h1>

        {!ready ? (
          <p className="mt-3 text-sm text-neutral-600">Validating your reset link…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">New password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirm password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}
            {msg && <p className="text-sm text-green-600">{msg}</p>}

            <button
              type="submit"
              disabled={!ready || saving}
              className="w-full rounded-lg bg-[hsl(157_48%_25%)] text-white py-2 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
