'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import AIBox from './components/AIBox'

export default function Home() {
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState(false)

  async function join(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('waitlist').insert([{ email }])
    if (error) alert('Error: ' + error.message)
    else { setOk(true); setEmail('') }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">MoneyXprt</h1>
        <p>Join the waitlist:</p>
        <form onSubmit={join} className="flex gap-2">
          <input 
            className="border p-2 rounded flex-1" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="you@example.com" 
          />
          <button className="bg-black text-white px-4 rounded">Join</button>
        </form>
        {ok && <p className="text-green-600">Thanks for joining!</p>}
      </section>
      <AIBox />
    </main>
  )
}