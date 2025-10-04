// app/planner/intake/page.tsx
import Wizard from '../Wizard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function IntakePage() {
  return <Wizard />;
}

