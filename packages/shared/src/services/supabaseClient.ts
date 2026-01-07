import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey)
}