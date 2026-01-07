import type { Todo } from '@todo-es/shared'
import type { DataMode, Filter } from '../Controller/todos.types'
import type { ToDoController } from '../Controller/ToDoController'
import '../App.css'

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-US')
}

export default function ToDoView({ controller }: { controller: ToDoController }) {
  async function onAdd() {
    const raw = window.prompt('New task title:')
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return

    try {
      await controller.create(title)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao criar tarefa. Veja o console.')
    }
  }

  async function onToggle(id: string) {
    try {
      await controller.toggle(id)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao atualizar tarefa. Veja o console.')
    }
  }

  async function onRemove(id: string) {
    try {
      await controller.remove(id)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao remover tarefa. Veja o console.')
    }
  }

  async function onEdit(todo: Todo) {
    const raw = window.prompt('Edit task title:', todo.title)
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return

    try {
      await controller.edit(todo, title)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao editar tarefa. Veja o console.')
    }
  }

  return (
    <div className="page">
      <main className="layout" aria-label="Todo List - MVC">
        <h1 className="title">ToDo ES - MVC</h1>

        <div className="topbar" aria-label="Actions">
          <select
            className="select"
            value={controller.mode}
            onChange={(e) => controller.setMode(e.target.value as DataMode)}
            aria-label="Data mode"
          >
            <option value="rest">REST (manual)</option>
            <option value="realtime">Realtime (auto)</option>
          </select>

          <select
            className="select"
            value={controller.filter}
            onChange={(e) => controller.setFilter(e.target.value as Filter)}
            aria-label="Filter"
          >
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="done">Completed</option>
          </select>
        </div>

        <button className="primary" type="button" onClick={() => void onAdd()}>
          Add Task
        </button>

        <section className="board" aria-label="Tasks">
          {controller.mode === 'realtime' && (controller.realtimeStatus || controller.realtimeError) ? (
            <p className="empty" style={{ textAlign: 'left', padding: '0 0 10px' }}>
              <b>Realtime:</b> {controller.realtimeStatus || '…'}
              {controller.realtimeError ? (
                <>
                  <br />
                  <span>{controller.realtimeError}</span>
                </>
              ) : null}
            </p>
          ) : null}

          {controller.isLoading ? (
            <p className="empty">Loading…</p>
          ) : controller.visibleTodos.length === 0 ? (
            <p className="empty">No tasks in this filter.</p>
          ) : (
            <ul className="list">
              {controller.visibleTodos.map((todo) => (
                <li key={todo.id} className="card">
                  <label className="check" aria-label="Toggle completed">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => void onToggle(todo.id)}
                    />
                    <span className="check__box" aria-hidden="true" />
                  </label>

                  <div className="content">
                    <p className={'task' + (todo.completed ? ' task--done' : '')}>{todo.title}</p>
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
                      onClick={() => void onRemove(todo.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      className="icon"
                      type="button"
                      onClick={() => void onEdit(todo)}
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