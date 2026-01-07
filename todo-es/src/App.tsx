import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  completedAt: number | null
}

type Filter = 'all' | 'todo' | 'done'

type TodoRepository = {
  load: () => Promise<Todo[]>
  save: (todos: Todo[]) => Promise<void>
}

function uuid() {
  // Safari/older browsers fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyCrypto = crypto as any
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID() as string
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function formatDateTime(ts: number) {
  // Match the reference (month/day/year + AM/PM)
  return new Date(ts).toLocaleString('en-US')
}

function getSeedTodos(): Todo[] {
  const now = Date.now()
  return [
    {
      id: uuid(),
      title: 'read body language Book ⏰',
      completed: false,
      createdAt: now - 1000 * 60 * 60 * 24,
      completedAt: null,
    },
    {
      id: uuid(),
      title: 'Make Dinner 🍔',
      completed: true,
      createdAt: now - 1000 * 60 * 60 * 2,
      completedAt: now - 1000 * 60 * 40,
    },
    {
      id: uuid(),
      title: 'do home work',
      completed: false,
      createdAt: now - 1000 * 60 * 20,
      completedAt: null,
    },
  ]
}

const localStorageRepo: TodoRepository = {
  async load() {
    try {
      const raw = localStorage.getItem('todo-es:todos:v2')
      if (!raw) return getSeedTodos()

      const parsed = JSON.parse(raw) as Partial<Todo>[]
      if (!Array.isArray(parsed)) return getSeedTodos()

      // Guard + light migration (completedAt might not exist)
      return parsed
        .filter((t) => typeof t.id === 'string' && typeof t.title === 'string')
        .map((t) => {
          const createdAt = typeof t.createdAt === 'number' ? t.createdAt : Date.now()
          const completed = Boolean(t.completed)
          const completedAt =
            typeof t.completedAt === 'number'
              ? t.completedAt
              : completed
                ? createdAt
                : null

          return {
            id: t.id as string,
            title: t.title as string,
            completed,
            createdAt,
            completedAt,
          }
        })
    } catch {
      return getSeedTodos()
    }
  },
  async save(todos) {
    localStorage.setItem('todo-es:todos:v2', JSON.stringify(todos))
  },
}

export default function App() {
  const repo = localStorageRepo

  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const loaded = await repo.load()
      if (!alive) return
      setTodos(loaded)
      setIsLoading(false)
    })()

    return () => {
      alive = false
    }
  }, [repo])

  useEffect(() => {
    if (isLoading) return
    void repo.save(todos)
  }, [todos, isLoading, repo])

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

  function addTodo() {
    const raw = window.prompt('New task title:')
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return

    const todo: Todo = {
      id: uuid(),
      title,
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
    }

    setTodos((prev) => [todo, ...prev])
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const nextCompleted = !t.completed
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : null,
        }
      }),
    )
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function editTodo(todo: Todo) {
    const raw = window.prompt('Edit task title:', todo.title)
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return
    
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, title } : t)))
  }

  return (
    <div className="page">
      <main className="layout" aria-label="Todo List">
        <h1 className="title">ToDo ES</h1>

        <div className="topbar" aria-label="Actions">
          <button className="primary" type="button" onClick={addTodo}>
            Add Task
          </button>

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

        <section className="board" aria-label="Tasks">
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
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span className="check__box" aria-hidden="true" />
                  </label>

                  <div className="content">
                    <p className={"task" + (todo.completed ? ' task--done' : '')}>
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
                      onClick={() => removeTodo(todo.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      className="icon"
                      type="button"
                      onClick={() => editTodo(todo)}
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
