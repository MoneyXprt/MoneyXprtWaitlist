'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@/lib/useSession'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Optional: ensure this page never gets prerendered in a way that interferes with client hooks
export const dynamic = 'force-dynamic'

export default function PricingPage() {
  const session = useSession()
  const router = useRouter()

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8">Loading pricing…</div>}>
      <PricingContent session={session} router={router} />
    </Suspense>
  )
}

function PricingContent({ session, router }: { session: ReturnType<typeof useSession>; router: ReturnType<typeof useRouter> }) {
  const { user, loading } = session
  const searchParams = useSearchParams()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const canceled = searchParams.get('canceled') === '1'

  async function handleCheckout() {
    if (!user) {
      router.push('/login')
      return
    }

    setCheckoutLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (session?.user?.id) {
        headers['x-user-id'] = session.user.id
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout: ' + (error.message || 'Unknown error'))
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
            </div>
            {user && (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {canceled && (
          <Alert className="mb-8 bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              ⚠️ Checkout was canceled. You can try again anytime.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Unlock Unlimited Financial Advice</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to MoneyXprt's AI-powered financial guidance. Perfect for high-income professionals who
            need comprehensive wealth management strategies.
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="max-w-sm w-full border-2 border-emerald-200 relative">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Starter Plan</CardTitle>
              <div className="text-4xl font-bold text-emerald-600 mb-1">$9</div>
              <div className="text-gray-500">per month</div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Unlimited AI conversations</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Advanced tax optimization strategies</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Investment portfolio guidance</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Conversation history & export</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>

              <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {checkoutLoading ? 'Starting checkout...' : 'Start Subscription'}
              </Button>

              <p className="text-xs text-gray-500 text-center">Cancel anytime. 30-day money-back guarantee.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose MoneyXprt?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert Knowledge</h4>
              <p className="text-gray-600 text-sm">Advanced AI trained on comprehensive financial strategies for high-income earners</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tax Optimization</h4>
              <p className="text-gray-600 text-sm">Personalized strategies to minimize tax burden and maximize wealth preservation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Answers</h4>
              <p className="text-gray-600 text-sm">Get immediate, personalized financial advice 24/7 without waiting for appointments</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
