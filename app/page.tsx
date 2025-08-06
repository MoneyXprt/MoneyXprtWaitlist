'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from './providers'
import { Shield, TrendingUp, Users, ArrowRight, Bot, PieChart, Home as HomeIcon } from 'lucide-react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setError('')

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('Email already registered for waitlist')
        } else {
          setError('Something went wrong. Please try again.')
        }
      } else {
        setSubmitted(true)
        setEmail('')
      }
    } catch (err) {
      setError('Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">MoneyXprt</h1>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#waitlist" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Join Waitlist
                </a>
                <Link href="/auth" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI-powered financial co-pilot<br />
              <span className="text-blue-200">for high-income earners</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Optimize your wealth with personalized AI-driven insights, tax strategies, and investment recommendations tailored for your income level.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm">Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-sm">AI-powered insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm">10K+ professionals</span>
              </div>
            </div>

            <div className="flex justify-center">
              <a href="#waitlist">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50 text-lg px-8 py-4 h-auto transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Designed for ambitious professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced financial planning tools that scale with your success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Tax Optimization</h3>
                <p className="text-gray-600">
                  Smart algorithms analyze your income streams and suggest personalized tax strategies to maximize your savings.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PieChart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Rebalancing</h3>
                <p className="text-gray-600">
                  Automated portfolio optimization based on your risk tolerance, timeline, and financial goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Estate Insights</h3>
                <p className="text-gray-600">
                  Market analysis and investment opportunities tailored to your location and investment capacity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section id="waitlist" className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get early access
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of high-income professionals who are already optimizing their wealth with AI
            </p>
          </div>

          <Card className="shadow-2xl">
            <CardContent className="p-8 lg:p-12">
              {submitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowRight className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">You're on the list!</h3>
                  <p className="text-gray-600 mb-8">
                    We'll notify you when MoneyXprt launches. Check your email for confirmation.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Join another email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Waitlist</h3>
                    <p className="text-gray-600">Be the first to know when we launch</p>
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm text-center">{error}</div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full h-14 text-lg font-semibold"
                  >
                    {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">MoneyXprt</h3>
            <p className="text-gray-600 mb-4">
              AI-powered financial co-pilot for high-income earners
            </p>
            <p className="text-sm text-gray-500">
              © 2024 MoneyXprt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}