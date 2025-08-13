'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { TrendingUp, Shield, DollarSign, Send, Loader2 } from 'lucide-react'
import AuthWidget from '../components/AuthWidget'
import { sbBrowser } from '../lib/supabase'

interface AIResponse {
  response: string
  metadata?: {
    requestHash: string
    hasPII: boolean
    sanitized: boolean
  }
}

export default function Home() {
  const supabase = sbBrowser()
  const [taxPrompt, setTaxPrompt] = useState('')
  const [entityPrompt, setEntityPrompt] = useState('')
  const [feeFile, setFeeFile] = useState<File | null>(null)
  
  const [taxResponse, setTaxResponse] = useState<AIResponse | null>(null)
  const [entityResponse, setEntityResponse] = useState<AIResponse | null>(null)
  const [feeResponse, setFeeResponse] = useState<AIResponse | null>(null)
  
  const [taxLoading, setTaxLoading] = useState(false)
  const [entityLoading, setEntityLoading] = useState(false)
  const [feeLoading, setFeeLoading] = useState(false)

  // Waitlist state
  const [email, setEmail] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [waitlistError, setWaitlistError] = useState('')

  async function authHeader(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { 'x-supabase-auth': token } : {}
  }

  const callAPI = async (endpoint: string, prompt: string, setResponse: (r: AIResponse | null) => void, setLoading: (l: boolean) => void) => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setResponse(null)
    
    try {
      const headers = { 
        'Content-Type': 'application/json',
        ...(await authHeader())
      }
      
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt })
      })
      
      const data = await response.json()
      setResponse(data)
    } catch (error) {
      setResponse({ response: 'Error: Unable to process request' })
    } finally {
      setLoading(false)
    }
  }

  const callFileAPI = async (endpoint: string, file: File, setResponse: (r: AIResponse | null) => void, setLoading: (l: boolean) => void) => {
    if (!file) return
    
    setLoading(true)
    setResponse(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const headers = await authHeader()
      
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      })
      
      const data = await response.json()
      setResponse({ response: data.message || JSON.stringify(data) })
    } catch (error) {
      setResponse({ response: 'Error: Unable to process file' })
    } finally {
      setLoading(false)
    }
  }

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setWaitlistLoading(true)
    setWaitlistError('')
    setWaitlistSuccess(false)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setWaitlistSuccess(true)
        setEmail('')
      } else {
        setWaitlistError(data.error || 'Failed to join waitlist')
      }
    } catch (error) {
      setWaitlistError('Network error. Please try again.')
    } finally {
      setWaitlistLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 min-h-screen -m-6">
      <div className="p-6">

      {/* Hero */}
      <section className="pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-3 bg-emerald-100 text-emerald-800">
            AI-Powered Financial Intelligence
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Your AI Financial <span className="text-emerald-600">Co-Pilot</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Test our specialized AI tools for tax optimization, entity structuring, and fee analysis
          </p>
          <div className="mb-6">
            <a href="/reports" className="underline text-emerald-800 hover:text-emerald-900">
              View Reports
            </a>
          </div>
          
          {/* Waitlist Signup */}
          <div className="max-w-md mx-auto">
            <form onSubmit={joinWaitlist} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={waitlistLoading}
              />
              <Button 
                type="submit" 
                disabled={waitlistLoading || !email.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {waitlistLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            </form>
            {waitlistSuccess && (
              <p className="mt-2 text-sm text-emerald-600">
                Thanks for joining! We'll be in touch soon.
              </p>
            )}
            {waitlistError && (
              <p className="mt-2 text-sm text-red-600">
                {waitlistError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Tax Scanner */}
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">Tax Scanner</CardTitle>
                <CardDescription>
                  AI-powered tax optimization analysis for high-income strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ask about tax strategies for your income level..."
                  value={taxPrompt}
                  onChange={(e) => setTaxPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={() => callAPI('tax-scan', taxPrompt, setTaxResponse, setTaxLoading)}
                  disabled={taxLoading || !taxPrompt.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {taxLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Scan Tax Strategy
                    </>
                  )}
                </Button>
                {taxResponse && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {taxResponse.response}
                    </div>
                    {taxResponse.metadata && (
                      <div className="mt-3 flex gap-2">
                        {taxResponse.metadata.sanitized && (
                          <Badge variant="secondary" className="text-xs">PII Protected</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          ID: {taxResponse.metadata.requestHash.substring(0, 8)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Entity Optimizer */}
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">Entity Optimizer</CardTitle>
                <CardDescription>
                  Business structure recommendations for tax efficiency and protection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ask about LLC, S-Corp, or other entity structures..."
                  value={entityPrompt}
                  onChange={(e) => setEntityPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={() => callAPI('entity-opt', entityPrompt, setEntityResponse, setEntityLoading)}
                  disabled={entityLoading || !entityPrompt.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {entityLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Optimize Entity
                    </>
                  )}
                </Button>
                {entityResponse && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {entityResponse.response}
                    </div>
                    {entityResponse.metadata && (
                      <div className="mt-3 flex gap-2">
                        {entityResponse.metadata.sanitized && (
                          <Badge variant="secondary" className="text-xs">PII Protected</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          ID: {entityResponse.metadata.requestHash.substring(0, 8)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Checker */}
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">Fee Checker</CardTitle>
                <CardDescription>
                  Upload CSV portfolio holdings for automated fee analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFeeFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="fee-file-input"
                  />
                  <label htmlFor="fee-file-input" className="cursor-pointer">
                    <div className="space-y-2">
                      <DollarSign className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {feeFile ? feeFile.name : 'Upload CSV with Ticker, Shares, Price, ExpenseRatio columns'}
                      </p>
                      <Button variant="outline" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </label>
                </div>
                <Button 
                  onClick={() => feeFile && callFileAPI('fee-check', feeFile, setFeeResponse, setFeeLoading)}
                  disabled={feeLoading || !feeFile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {feeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Portfolio...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Analyze Fees
                    </>
                  )}
                </Button>
                {feeResponse && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {feeResponse.response}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MoneyXprt</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2024 MoneyXprt. Financial AI for high-income professionals.
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}