'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { User, LogOut, MessageCircle, TrendingUp, PieChart, Shield } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login')
        } else {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
        className: 'bg-green-50 border-green-200 text-green-800',
      })
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-deep" />
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
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                alt="MoneyXprt Logo" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold text-emerald-deep">MoneyXprt</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Financial Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Welcome to your personalized financial co-pilot. Let's optimize your wealth together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Chat Card */}
          <Card className="border-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-emerald-deep" />
                <CardTitle className="text-emerald-deep">AI Financial Advisor</CardTitle>
              </div>
              <CardDescription>
                Get personalized financial advice from your AI co-pilot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-deep hover:bg-emerald-700">
                Start Conversation
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Analysis */}
          <Card className="border-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <PieChart className="h-6 w-6 text-emerald-deep" />
                <CardTitle className="text-emerald-deep">Portfolio Analysis</CardTitle>
              </div>
              <CardDescription>
                Analyze and optimize your investment portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gold text-emerald-deep hover:bg-yellow-400">
                View Portfolio
              </Button>
            </CardContent>
          </Card>

          {/* Tax Optimization */}
          <Card className="border-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-emerald-deep" />
                <CardTitle className="text-emerald-deep">Tax Optimization</CardTitle>
              </div>
              <CardDescription>
                Discover strategies to minimize your tax burden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-deep hover:bg-emerald-700">
                Optimize Taxes
              </Button>
            </CardContent>
          </Card>

          {/* Wealth Protection */}
          <Card className="border-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-emerald-deep" />
                <CardTitle className="text-emerald-deep">Wealth Protection</CardTitle>
              </div>
              <CardDescription>
                Strategies to preserve and protect your assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gold text-emerald-deep hover:bg-yellow-400">
                Protect Wealth
              </Button>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card className="border-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-emerald-deep" />
                <CardTitle className="text-emerald-deep">Financial Goals</CardTitle>
              </div>
              <CardDescription>
                Set and track your financial objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-deep hover:bg-emerald-700">
                Set Goals
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-emerald-deep" />
                <CardTitle className="text-emerald-deep">Account Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gold text-emerald-deep hover:bg-yellow-400">
                Manage Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-deep">$0</div>
                <div className="text-sm text-gray-600">Portfolio Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">$0</div>
                <div className="text-sm text-gray-600">Annual Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-deep">0%</div>
                <div className="text-sm text-gray-600">Tax Optimization</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}