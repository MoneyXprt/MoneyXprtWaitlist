export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'
import ResultRowActions from '@/components/admin/ResultRowActions'

type Row = {
  public_id: string
  created_at: string
  primary_goal: string
  household_agi: string
  is_public: boolean
}

export default async function AdminResultsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string
  )

  const { data, error } = await supabase
    .from('results')
    .select('public_id, created_at, primary_goal, household_agi, is_public')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Admin · Results</h1>
        <div className="text-sm text-red-600">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Admin · Results</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2">Public ID</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Goal</th>
              <th className="px-3 py-2">AGI</th>
              <th className="px-3 py-2">Public</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data as Row[] | null)?.map((r) => (
              <tr key={r.public_id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">
                  <a className="text-blue-600 hover:underline" href={`/r/${r.public_id}`} target="_blank">{r.public_id}</a>
                </td>
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{r.primary_goal}</td>
                <td className="px-3 py-2">{Number(r.household_agi || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{r.is_public ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2"><ResultRowActions id={r.public_id} isPublic={r.is_public} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

