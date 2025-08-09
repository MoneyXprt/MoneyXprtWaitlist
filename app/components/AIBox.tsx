'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AIBox() {
  const [prompt, setPrompt] = useState('')
  const [context, setContext] = useState('') // optional
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResponse('')
    setLoading(true)
    try {
      // Get user session for authenticated requests
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Include user ID if authenticated
      if (session?.user?.id) {
        headers['x-user-id'] = session.user.id
      }

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, context })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      setResponse(data.response)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-12 bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-deep rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <h3 className="text-xl font-semibold text-emerald-deep">MoneyXprt — Ask Your Financial Co-Pilot</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about taxes, investments, cash flow, or financial strategies…"
            className="w-full border border-gray-300 focus:border-emerald-deep focus:ring-2 focus:ring-emerald-deep/20 p-3 rounded-md text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <div>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional: Add context like income range, goals, or current situation"
            className="w-full border border-gray-300 focus:border-emerald-deep focus:ring-2 focus:ring-emerald-deep/20 p-3 rounded-md h-20 text-gray-900 placeholder-gray-500 resize-none"
          />
        </div>
        
        <button
          disabled={loading || !prompt.trim()}
          className="bg-emerald-deep hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Thinking…</span>
            </>
          ) : (
            <span>Get Financial Advice</span>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-emerald-deep rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-medium text-emerald-deep">MoneyXprt Response:</span>
          </div>
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        </div>
      )}
    </div>
  )
}