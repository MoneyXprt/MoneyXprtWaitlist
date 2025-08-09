'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@/lib/useSession'

export default function OnboardingPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    incomeRange: '',
    entityType: '',
  })

  // Redirect if not authenticated
  if (!loading && !user) {
    router.replace('/login')
    return null
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || submitting) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          income_range: formData.incomeRange,
          entity_type: formData.entityType,
        })

      if (error) throw error
      router.replace('/dashboard')
    } catch (error: any) {
      console.error('Profile creation failed:', error)
      alert('Failed to save profile: ' + (error.message || 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to MoneyXprt</h2>
          <p className="mt-2 text-gray-600">Tell us about yourself to get personalized advice</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="incomeRange" className="block text-sm font-medium text-gray-700">
              Annual Income Range
            </label>
            <select
              id="incomeRange"
              required
              value={formData.incomeRange}
              onChange={(e) => setFormData(prev => ({ ...prev, incomeRange: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select income range</option>
              <option value="100k-250k">$100k - $250k</option>
              <option value="250k-500k">$250k - $500k</option>
              <option value="500k-1m">$500k - $1M</option>
              <option value="1m-plus">$1M+</option>
            </select>
          </div>

          <div>
            <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">
              Entity Type
            </label>
            <select
              id="entityType"
              required
              value={formData.entityType}
              onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select entity type</option>
              <option value="individual">Individual</option>
              <option value="sole-proprietor">Sole Proprietor</option>
              <option value="llc">LLC</option>
              <option value="s-corp">S-Corp</option>
              <option value="c-corp">C-Corp</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}