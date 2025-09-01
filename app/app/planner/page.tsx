import PlannerClient from './PlannerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PlannerPage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Wealth Planner</h1>
      <p className="text-sm text-neutral-600 mb-6">
        Enter your situation to see common high-income tax & investment strategies.
      </p>
      <PlannerClient />
    </section>
  );
}}