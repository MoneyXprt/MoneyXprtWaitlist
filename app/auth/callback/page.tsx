'use client';

// Tell Next "do NOT prerender or cache this page".
export const dynamic = 'force-dynamic';
export const revalidate = 0;           // must be a number or false
export const fetchCache = 'force-no-store';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // Handle the incoming auth callback params, then send the user somewhere
    // (dashboard, planner, etc.). For now, just send to /.
    const error = params.get('error_description') || params.get('error');
    if (error) {
      // You could surface this to the UI instead
      console.error('Auth error:', error);
    }
    router.replace('/'); // or '/planner'
  }, [params, router]);

  return null; // nothing to render on the callback
}