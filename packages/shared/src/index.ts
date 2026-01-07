import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Shared package must be framework-agnostic: it receives URL + anon key from the app.
export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey)
}

// Re-export from todoService.ts to make it available via the main import
export { createTodoService, type Todo, type TodoService, type RealtimeStatus } from './services/todoService'