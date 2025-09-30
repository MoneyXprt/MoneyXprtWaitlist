'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@/lib/useSession'
import type { UsageDaily } from '@/shared/schema'

// Helper function to safely parse numbers
const safeParseInt = (value: string | null | undefined): number => {
  if (!value) return 0;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
};

export default function UsagePage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [usage, setUsage] = useState<UsageDaily[]>([])
  const [usageLoading, setUsageLoading] = useState(true)
  const [todayUsage, setTodayUsage] = useState<UsageDaily | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }

    if (user) {
      fetchUsage()
    }
  }, [user, loading, router])

  async function fetchUsage() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('usage_daily')
        .select('*')
        .eq('user_id', user.id)
        .order('day', { ascending: false })
        .limit(30)

      if (error) throw error
      
      const usageData = data || []
      setUsage(usageData)
      
      // Find today's usage
      const today = new Date().toISOString().split('T')[0]
      const todayRecord = usageData.find(record => record.day === today)
      setTodayUsage(todayRecord || null)
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setUsageLoading(false)
    }
  }

  if (loading || usageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading usage data...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const todayPrompts = todayUsage?.prompts ? safeParseInt(todayUsage.prompts) : 0
  const usagePercent = Math.min((todayPrompts / 50) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Usage Statistics</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Today's Usage Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{todayPrompts}</div>
              <div className="text-sm text-gray-600">AI Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(todayUsage?.tokensIn ? safeParseInt(todayUsage.tokensIn) : 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Input Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {(todayUsage?.tokensOut ? safeParseInt(todayUsage.tokensOut) : 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Output Tokens</div>
            </div>
          </div>
          
          {/* Usage Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                usagePercent >= 90 ? 'bg-red-600' : 
                usagePercent >= 70 ? 'bg-yellow-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{todayPrompts} / 50 daily requests</span>
            <span>{Math.round(usagePercent)}% used</span>
          </div>
          
          {usagePercent >= 90 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                ⚠️ You're approaching your daily limit. Consider upgrading for unlimited access.
              </p>
            </div>
          )}
        </div>

        {/* Historical Usage */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Usage History (Last 30 Days)</h3>
          </div>
          
          {usage.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No usage data available yet. Start asking MoneyXprt questions to see your usage statistics!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tokens</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usage.map((record) => {
                    const tokensIn = safeParseInt(record.tokensIn)
                    const tokensOut = safeParseInt(record.tokensOut)
                    const totalTokens = tokensIn + tokensOut
                    
                    return (
                      <tr key={record.day} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.day).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.prompts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tokensIn.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tokensOut.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totalTokens.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}