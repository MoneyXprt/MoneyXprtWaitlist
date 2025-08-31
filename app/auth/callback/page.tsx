'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;            // <= must be a number (or false)
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';        // avoid Edge for safety

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const next = params.get('next') || '/';
    router.replace(next);
  }, [params, router]);

  return null; // nothing to render; we immediately redirect
}