// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey)
}