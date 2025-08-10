'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@/lib/useSession'
import AIBox from '@/app/components/AIBox'
import type { Profile } from '@/shared/schema'

export default function DashboardPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }

    if (user) {
      checkProfile()
    }
  }, [user, loading, router])

  async function checkProfile() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Profile fetch error:', error)
      }

      if (!data) {
        // No profile found, redirect to onboarding
        router.replace('/onboarding')
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Profile check failed:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading || profileLoading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user || !profile) return null

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {profile.fullName || user.email}</h1>
          <p className="text-sm text-gray-600">
            {profile.incomeRange?.replace(/k/g, 'K').replace(/-/g, ' - $')} • {profile.entityType?.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => router.push('/history')} 
            className="border px-3 py-1 rounded hover:bg-gray-50 text-sm"
          >
            History
          </button>
          <button 
            onClick={() => router.push('/usage')} 
            className="border px-3 py-1 rounded hover:bg-gray-50 text-sm"
          >
            Usage
          </button>
          <button 
            onClick={() => router.push('/pricing')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm"
          >
            Upgrade
          </button>
          <button onClick={signOut} className="border px-3 py-1 rounded hover:bg-gray-50">
            Sign out
          </button>
        </div>
      </div>
      <AIBox />
    </main>
  )
}