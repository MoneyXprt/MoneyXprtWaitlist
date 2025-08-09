'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import AIBox from '@/app/components/AIBox'

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null
      if (!user) router.replace('/login')
      setEmail(user?.email ?? null)
    })
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!email) return <main className="p-6">Loading…</main>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, {email}</h1>
        <button onClick={signOut} className="border px-3 py-1 rounded">Sign out</button>
      </div>
      <AIBox />
    </main>
  )
}