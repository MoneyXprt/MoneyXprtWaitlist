// app/planner/page.tsx
import Wizard from './Wizard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return <Wizard />;
}