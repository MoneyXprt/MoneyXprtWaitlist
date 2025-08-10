import { supabase } from './supabaseClient'
import type { Billing } from '@/shared/schema'

export async function getUserBilling(userId: string): Promise<Billing | null> {
  try {
    const { data, error } = await supabase
      .from('billing')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to fetch billing:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Billing query failed:', error)
    return null
  }
}

export function isUserSubscribed(billing: Billing | null): boolean {
  return billing?.isActive === 'true'
}