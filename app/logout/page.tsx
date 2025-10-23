'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    async function signOut() {
      if (supabase) await supabase.auth.signOut()
      router.replace('/')
    }
    signOut()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Signing out...</p>
      </div>
    </div>
  )
}
