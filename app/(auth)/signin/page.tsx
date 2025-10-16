export const dynamic = 'force-dynamic'
"use client"
import React from 'react'

export default function SignInPage() {
  const [email, setEmail] = React.useState('')
  const [msg, setMsg] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr(null); setMsg(null)
    try {
      const res = await fetch('/api/auth/magic-link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || `Failed (${res.status})`)
      setMsg('Check your email for a sign-in link.')
    } catch (e: any) {
      setErr(e?.message || 'Failed to send link')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border rounded px-3 py-2" />
        <button disabled={loading} className="border rounded px-3 py-1 text-sm disabled:opacity-50">{loading ? 'Sending…' : 'Send magic link'}</button>
      </form>
      {msg && <div className="mt-3 text-sm text-emerald-700">{msg}</div>}
      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
    </div>
  )
}

