import { supabaseAdmin } from './supabaseServer'

interface UsageParams {
  userId: string
  tokensIn: number
  tokensOut: number
}

export async function incrementUsage({ userId, tokensIn, tokensOut }: UsageParams): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('Supabase admin client not available, skipping usage tracking')
    return
  }

  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Use raw SQL for upsert with increment logic
    const { error } = await supabaseAdmin.rpc('increment_usage', {
      p_user_id: userId,
      p_day: today,
      p_tokens_in: tokensIn,
      p_tokens_out: tokensOut
    })

    if (error) {
      // Fallback to manual upsert if stored procedure doesn't exist
      await manualUpsertUsage(userId, today, tokensIn, tokensOut)
    }
  } catch (error) {
    console.error('Failed to increment usage:', error)
  }
}

async function manualUpsertUsage(userId: string, day: string, tokensIn: number, tokensOut: number) {
  if (!supabaseAdmin) return

  // Try to get existing record
  const { data: existing } = await supabaseAdmin
    .from('usage_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('day', day)
    .single()

  if (existing) {
    // Update existing record
    await supabaseAdmin
      .from('usage_daily')
      .update({
        prompts: (parseInt(existing.prompts) + 1).toString(),
        tokens_in: (parseInt(existing.tokens_in) + tokensIn).toString(),
        tokens_out: (parseInt(existing.tokens_out) + tokensOut).toString(),
      })
      .eq('user_id', userId)
      .eq('day', day)
  } else {
    // Insert new record
    await supabaseAdmin
      .from('usage_daily')
      .insert({
        user_id: userId,
        day,
        prompts: '1',
        tokens_in: tokensIn.toString(),
        tokens_out: tokensOut.toString(),
      })
  }
}

export async function checkDailyLimit(userId: string, limit: number = 50): Promise<boolean> {
  if (!supabaseAdmin) return true // Allow if no admin client

  try {
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabaseAdmin
      .from('usage_daily')
      .select('prompts')
      .eq('user_id', userId)
      .eq('day', today)
      .single()

    if (!data) return true // No usage record, allow

    const currentPrompts = parseInt(data.prompts) || 0
    return currentPrompts < limit
  } catch (error) {
    console.error('Failed to check daily limit:', error)
    return true // Allow on error
  }
}

export async function getCurrentDailyUsage(userId: string): Promise<number> {
  if (!supabaseAdmin) return 0

  try {
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabaseAdmin
      .from('usage_daily')
      .select('prompts')
      .eq('user_id', userId)
      .eq('day', today)
      .single()

    if (!data) return 0

    return parseInt(data.prompts) || 0
  } catch (error) {
    console.error('Failed to get daily usage:', error)
    return 0
  }
}

export async function isUserSubscribed(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false

  try {
    const { data } = await supabaseAdmin
      .from('billing')
      .select('is_active')
      .eq('user_id', userId)
      .single()

    return data?.is_active === 'true'
  } catch (error) {
    console.error('Failed to check subscription status:', error)
    return false
  }
}