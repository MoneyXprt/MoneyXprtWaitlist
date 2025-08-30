// app/planner/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import PlannerClient from './PlannerClient';

export default function Page() {
  return <PlannerClient />;
}