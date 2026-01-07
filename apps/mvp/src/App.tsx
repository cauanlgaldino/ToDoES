import { useEffect, useMemo, useState } from 'react'
import { createTodoService, type Todo } from '@todo-es/shared'
import './App.css'

const todoService = createTodoService(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

type Filter = 'all' | 'todo' | 'done'
type DataMode = 'rest' | 'realtime'

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function formatDateTime(ts: number) {
  // Match the reference (month/day/year + AM/PM)
  return new Date(ts).toLocaleString('en-US')
}


export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [mode, setMode] = useState<DataMode>('rest')
  const [realtimeStatus, setRealtimeStatus] = useState<string>('')
  const [realtimeError, setRealtimeError] = useState<string>('')

  async function loadTodos() {
    setIsLoading(true)
    try {
      const list = await todoService.list()
      setTodos(list)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao carregar tarefas do Supabase. Veja o console.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTodos()
  }, [])

  useEffect(() => {
    if (mode !== 'realtime') {
      setRealtimeStatus('')
      setRealtimeError('')
      return
    }

    // quando entrar no modo realtime, garante que está sincronizado
    void loadTodos()

    let alive = true

    const unsubscribe = (() => {
      try {
        return todoService.subscribeToChanges(
          () => {
            void loadTodos()
          },
          (status) => {
            if (!alive) return
            setRealtimeStatus(status)
            if (status === 'CHANNEL_ERROR') {
              setRealtimeError('Realtime channel error (check Supabase Realtime table settings)')
            }
          },
        )
      } catch (e) {
        console.error(e)
        setRealtimeError(e instanceof Error ? e.message : String(e))
        return () => {}
      }
    })()

    return () => {
      alive = false
      unsubscribe()
    }
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

  async function addTodo() {
    const raw = window.prompt('New task title:')
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return

    try {
      await todoService.create(title)
      await loadTodos() // REST/pull: refresh after action
    } catch (err) {
      console.error(err)
      window.alert('Erro ao criar tarefa. Veja o console.')
    }
  }

  async function toggleTodo(id: string) {
    const current = todos.find((t) => t.id === id)
    if (!current) return

    try {
      await todoService.toggleCompleted(id, !current.completed)
      await loadTodos()
    } catch (err) {
      console.error(err)
      window.alert('Erro ao atualizar tarefa. Veja o console.')
    }
  }

  async function removeTodo(id: string) {
    try {
      await todoService.remove(id)
      await loadTodos()
    } catch (err) {
      console.error(err)
      window.alert('Erro ao remover tarefa. Veja o console.')
    }
  }

  async function editTodo(todo: Todo) {
    const raw = window.prompt('Edit task title:', todo.title)
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return

    try {
      await todoService.updateTitle(todo.id, title)
      await loadTodos()
    } catch (err) {
      console.error(err)
      window.alert('Erro ao editar tarefa. Veja o console.')
    }
  }

  return (
    <div className="page">
      <main className="layout" aria-label="Todo List">
        <h1 className="title">ToDo ES - MVP</h1>

        <div className="topbar" aria-label="Actions">
          <select
            className="select"
            value={mode}
            onChange={(e) => setMode(e.target.value as DataMode)}
            aria-label="Data mode"
          >
            <option value="rest">REST (manual)</option>
            <option value="realtime">Realtime (auto)</option>
          </select>

          <select
            className="select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            aria-label="Filter"
          >
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="done">Completed</option>
          </select>
        </div>

        <button className="primary" type="button" onClick={addTodo}>
            Add Task
        </button>

        <section className="board" aria-label="Tasks">
          {mode === 'realtime' && (realtimeStatus || realtimeError) ? (
            <p className="empty" style={{ textAlign: 'left', padding: '0 0 10px' }}>
              <b>Realtime:</b> {realtimeStatus || '…'}
              {realtimeError ? (
                <>
                  <br />
                  <span>{realtimeError}</span>
                </>
              ) : null}
            </p>
          ) : null}
          {isLoading ? (
            <p className="empty">Loading…</p>
          ) : visibleTodos.length === 0 ? (
            <p className="empty">No tasks in this filter.</p>
          ) : (
            <ul className="list">
              {visibleTodos.map((todo) => (
                <li key={todo.id} className="card">
                  <label className="check" aria-label="Toggle completed">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => void toggleTodo(todo.id)}
                    />
                    <span className="check__box" aria-hidden="true" />
                  </label>

                  <div className="content">
                    <p className={'task' + (todo.completed ? ' task--done' : '')}>
                      {todo.title}
                    </p>
                    <p className="dates">
                      <span>{formatDateTime(todo.createdAt)}</span>
                      <span className="dot">•</span>
                      <span>{todo.completedAt ? formatDateTime(todo.completedAt) : '—'}</span>
                    </p>
                  </div>

                  <div className="actions" aria-label="Actions">
                    <button
                      className="icon"
                      type="button"
                      onClick={() => void removeTodo(todo.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      className="icon"
                      type="button"
                      onClick={() => void editTodo(todo)}
                      aria-label="Edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
