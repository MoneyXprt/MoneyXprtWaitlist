'use client'
import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
      // Get user session for authenticated requests (if available)
      const sb = getSupabaseBrowser()
      const { data: { session } } = sb ? await sb.auth.getSession() : { data: { session: null } } as any
      
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
      if (!res.ok) {
        if (res.status === 402 && data.upgrade_url) {
          // Payment required - show upgrade option
          setError(data.error + ' Click here to upgrade.')
          setTimeout(() => {
            if (window.confirm('Upgrade to continue unlimited access?')) {
              window.location.href = data.upgrade_url
            }
          }, 1000)
          return
        }
        throw new Error(data?.error || 'Request failed')
      }
      setResponse(data.response)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-12">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <CardTitle className="text-emerald-600">MoneyXprt — Ask Your Financial Co-Pilot</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about taxes, investments, cash flow, or financial strategies…"
            className="focus:ring-emerald-600 focus:border-emerald-600"
          />
          
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional: Add context like income range, goals, or current situation"
            className="h-20 resize-none focus:ring-emerald-600 focus:border-emerald-600"
          />
          
          <Button
            disabled={loading || !prompt.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Thinking…</span>
              </>
            ) : (
              <span>Get Financial Advice</span>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {response && (
          <Alert className="bg-emerald-50 border-emerald-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-medium text-emerald-600">MoneyXprt Response:</span>
            </div>
            <AlertDescription className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {response}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
