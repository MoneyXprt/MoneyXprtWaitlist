import type { ReactNode } from 'react';

export const metadata = {
  title: 'MLS CFO Analytics | MoneyXprt',
  description: 'Data-driven MLS financial insights from the front office perspective.',
};

export default function MLSLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
