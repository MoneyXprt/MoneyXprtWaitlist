'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

export default function SimpleAuthWidget() {
  // Create supabase client once
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Two important anti-flicker tricks:
  // 1) Reserve width so the header doesn’t shift (min-w).
  // 2) Hide content until the session state is known (visibility).
  return (
    <div className="min-w-[220px]">
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        {session ? (
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm underline">
              App
            </Link>
            <button
              className="text-sm rounded-lg px-3 py-2 border"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/signin" className="text-sm px-3 py-2 border rounded-lg">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm px-3 py-2 bg-emerald-700 text-white rounded-lg"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
