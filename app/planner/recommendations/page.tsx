import React, { Suspense } from 'react';
import RecommendationsClient from './_components/RecommendationsClient';

export const metadata = { title: 'Recommendations • MoneyXprt' };

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading recommendations…</div>}>
      <RecommendationsClient />
    </Suspense>
  );
}
