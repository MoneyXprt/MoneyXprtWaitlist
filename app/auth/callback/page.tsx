// app/auth/callback/CallbackClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        setError(error.message);
        return;
      }
      const to = searchParams.get('redirect_to') || '/app';
      router.replace(to);
    })();
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        {!error ? (
          <>
            <div className="animate-spin h-8 w-8 rounded-full border-2 border-[hsl(157_48%_25%)] border-t-transparent mx-auto mb-3" />
            <p className="text-sm text-neutral-600">Signing you in…</p>
          </>
        ) : (
          <>
            <p className="font-semibold mb-2">Link error</p>
            <p className="text-sm text-neutral-600">{error}</p>
            <button
              onClick={() => router.push('/signin')}
              className="mt-4 px-4 py-2 rounded-lg border"
            >
              Go to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
