import { NextResponse } from 'next/server'
import { createClientServer } from '@/lib/auth/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({})) as { email?: string }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const supabase = createClientServer()
    const origin = new URL(req.url).origin
    const emailRedirectTo = `${origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

