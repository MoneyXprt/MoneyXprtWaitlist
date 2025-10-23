export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js';
import Results from '@/components/Results';
import type { ResultsV1 } from '@/types/results';

export const revalidate = 0; // always fresh (or set a small ISR window)

export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // safe for public read
  );

  const { data, error } = await supabase
    .from('results')
    .select('payload')
    .eq('public_id', params.id)
    .eq('is_public', true)
    .single();

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p className="text-sm text-muted-foreground">This result may be private or no longer exists.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Results data={data.payload as ResultsV1} />
    </div>
  );
}
