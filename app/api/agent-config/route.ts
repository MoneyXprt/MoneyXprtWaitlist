export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('agent_prompts')
      .select('id,name,role,version,is_active,body,updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
    if (error) throw new Error(error.message)
    const item = data?.[0] || null
    return NextResponse.json({ ok: true, item })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
