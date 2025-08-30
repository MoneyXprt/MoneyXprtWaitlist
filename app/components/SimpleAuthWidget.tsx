'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function SimpleAuthWidget() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  if (!mounted) {
    // Prevent header flashing while client hydrates
    return <div className="h-9 w-24 rounded-md bg-neutral-200 animate-pulse" />;
  }

  return email ? (
    <form
      action={async () => {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.refresh();
      }}
    >
      <button
        type="submit"
        className="text-sm rounded-lg px-3 py-2 border border-neutral-300 hover:bg-neutral-50"
      >
        Sign out ({email})
      </button>
    </form>
  ) : (
    <a
      href="/signup"
      className="text-sm rounded-lg px-3 py-2 bg-emerald-700 text-white shadow hover:bg-emerald-800"
    >
      Sign in
    </a>
  );
}
