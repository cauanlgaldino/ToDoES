import { useEffect, useMemo, useState } from 'react'
import type { Todo, TodoService } from '@todo-es/shared'
import type { DataMode, Filter } from './todos.types'

export type ToDoViewModel = {
  todos: Todo[]
  visibleTodos: Todo[]
  isLoading: boolean

  filter: Filter
  setFilter: (f: Filter) => void

  mode: DataMode
  setMode: (m: DataMode) => void

  realtimeStatus: string
  realtimeError: string

  refresh: () => Promise<void>
  addTodo: (title: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  removeTodo: (id: string) => Promise<void>
  editTodo: (todo: Todo, title: string) => Promise<void>
}

export function useToDoViewModel(todoService: TodoService): ToDoViewModel {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [mode, setMode] = useState<DataMode>('rest')
  const [realtimeStatus, setRealtimeStatus] = useState<string>('')
  const [realtimeError, setRealtimeError] = useState<string>('')

  async function refresh() {
    setIsLoading(true)
    try {
      const list = await todoService.list()
      setTodos(list)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mode !== 'realtime') {
      setRealtimeStatus('')
      setRealtimeError('')
      return
    }

    void refresh()

    let alive = true

    const unsubscribe = (() => {
      try {
        return todoService.subscribeToChanges(
          () => void refresh(),
          (status) => {
            if (!alive) return
            setRealtimeStatus(status)
            if (status === 'CHANNEL_ERROR') {
              setRealtimeError('Realtime channel error (check Supabase Realtime table settings)')
            }
          },
        )
      } catch (e) {
        setRealtimeError(e instanceof Error ? e.message : String(e))
        return () => {}
      }
    })()

    return () => {
      alive = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case 'todo':
        return todos.filter((t) => !t.completed)
      case 'done':
        return todos.filter((t) => t.completed)
      default:
        return todos
    }
  }, [todos, filter])

  async function addTodo(title: string) {
    await todoService.create(title)
    await refresh()
  }

  async function toggleTodo(id: string) {
    const current = todos.find((t) => t.id === id)
    if (!current) return
    await todoService.toggleCompleted(id, !current.completed)
    await refresh()
  }

  async function removeTodo(id: string) {
    await todoService.remove(id)
    await refresh()
  }

  async function editTodo(todo: Todo, title: string) {
    await todoService.updateTitle(todo.id, title)
    await refresh()
  }

  return {
    todos,
    visibleTodos,
    isLoading,
    filter,
    setFilter,
    mode,
    setMode,
    realtimeStatus,
    realtimeError,
    refresh,
    addTodo,
    toggleTodo,
    removeTodo,
    editTodo,
  }
}