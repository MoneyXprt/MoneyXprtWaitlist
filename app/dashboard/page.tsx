'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '../providers'
import Link from 'next/link'
import { LogOut, MessageCircle, User } from 'lucide-react'

export default function DashboardPage() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const { supabase, user, loading: authLoading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  const fetchConversations = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) {
      setConversations(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !user) return

    setLoading(true)
    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      const data = await response.json()
      
      if (data.response) {
        setResponse(data.response)
        
        // Save to database
        await supabase
          .from('conversations')
          .insert([{
            user_id: user.id,
            prompt: question,
            response: data.response
          }])
        
        fetchConversations()
        setQuestion('')
      }
    } catch (error) {
      console.error('Error:', error)
      setResponse('Sorry, there was an error processing your request.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              MoneyXprt
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Your AI-powered financial co-pilot is ready to help you optimize your wealth.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              How can we help you today?
            </CardTitle>
            <CardDescription>
              Ask questions about tax planning, investments, real estate, or any financial topic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Ask me anything about your finances..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-12"
              />
              <Button 
                type="submit" 
                disabled={loading || !question.trim()}
                className="w-full"
              >
                {loading ? 'Thinking...' : 'Get AI Advice'}
              </Button>
            </form>

            {response && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Response:</h4>
                <p className="text-blue-800 whitespace-pre-wrap">{response}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Your recent interactions with the AI financial advisor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.slice(0, 5).map((conv) => (
                  <div key={conv.id} className="border-l-4 border-primary pl-4">
                    <p className="font-medium text-gray-900 mb-1">{conv.prompt}</p>
                    <p className="text-gray-600 text-sm mb-2">{conv.response}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}