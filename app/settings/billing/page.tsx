"use client";
import { useState } from 'react'

export default function BillingSettings() {
  const [loading, setLoading] = useState<'portal'|'pro'|'topup'|null>(null)

  async function openPortal() {
    try {
      setLoading('portal')
      const email = (window as any)?.mxUserEmail || ''
      const res = await fetch('/api/billing/portal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json().catch(()=>({}))
      if (json?.url) window.location.href = json.url
      else alert(json?.error || 'Could not open portal')
    } finally { setLoading(null) }
  }

  async function goCheckout(kind: 'pro'|'topup') {
    try {
      setLoading(kind)
      const priceId = kind === 'pro'
        ? (process as any)?.env?.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
        : (process as any)?.env?.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_50
      if (!priceId) { alert('Pricing not configured'); return }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          success_url: `${window.location.origin}/billing/success`,
          cancel_url: `${window.location.origin}/settings/billing`,
        }),
      })
      const json = await res.json().catch(()=>({}))
      if (json?.url) window.location.href = json.url
      else alert(json?.error || 'Checkout failed')
    } finally { setLoading(null) }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <div className="rounded-2xl border p-6 space-y-3">
        <div className="text-sm text-muted-foreground">Manage your plan and usage.</div>
        <div className="flex gap-2">
          <button className="btn" onClick={()=>goCheckout('pro')} disabled={loading==='pro'}>Upgrade to Pro</button>
          <button className="btn btn-outline" onClick={()=>goCheckout('topup')} disabled={loading==='topup'}>Top‑Up 50</button>
          <button className="btn btn-outline" onClick={openPortal} disabled={loading==='portal'}>Manage in Portal</button>
        </div>
      </div>
    </main>
  )
}

