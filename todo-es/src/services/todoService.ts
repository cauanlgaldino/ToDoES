import { supabase } from './supabaseClient'

export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  completedAt: number | null
}

type TodoRow = {
  id: string
  title: string
  completed: boolean
  created_at: string
  completed_at: string | null
}

function mapRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
  }
}

// Data access layer (REST / pull). Easy to extend later with Realtime subscriptions.
export const todoService = {
  async list(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('id,title,completed,created_at,completed_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as TodoRow[] | null)?.map(mapRow) ?? []
  },

  async create(title: string): Promise<void> {
    const { error } = await supabase.from('todos').insert({
      title,
      completed: false,
    })
    if (error) throw error
  },

  async toggleCompleted(id: string, nextCompleted: boolean): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .update({ completed: nextCompleted })
      .eq('id', id)

    if (error) throw error
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const { error } = await supabase.from('todos').update({ title }).eq('id', id)
    if (error) throw error
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) throw error
  },
  
  subscribeToChanges(
    onChange: () => void,
    onStatus?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void,
  ) {
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          onChange()
        },
      )

    // Subscribe + report status (helps debug when it looks like “nothing loads”)
    channel.subscribe((status) => {
      onStatus?.(status)
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime CHANNEL_ERROR for todos-changes')
      }
    })

    return () => {
      try {
        void supabase.removeChannel(channel)
      } catch (e) {
        console.error('Failed to remove realtime channel', e)
      }
    }
  },
}