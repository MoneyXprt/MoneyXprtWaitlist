'use client';

export const dynamic = 'force-dynamic';
export const revalidate = false;              // ✅ number, not an object
export const fetchCache = 'force-no-store';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const err = params.get('error_description') || params.get('error');
    if (err) console.error('Auth error:', err);
    router.replace('/'); // or '/planner'
  }, [params, router]);

  return null;
}