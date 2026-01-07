import type { Todo } from '@todo-es/shared'
import type { DataMode, Filter } from '../ViewModel/todos.types'
import type { ToDoViewModel } from '../ViewModel/ToDoViewModel.ts'
import '../App.css'

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-US')
}

export default function ToDoView({ vm }: { vm: ToDoViewModel }) {
  async function onAdd() {
    const raw = window.prompt('New task title:')
    if (raw == null) return

    const title = normalizeTitle(raw)
    if (!title) return

    try {
      await vm.addTodo(title)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao criar tarefa. Veja o console.')
    }
  }

  async function onToggle(id: string) {
    try {
      await vm.toggleTodo(id)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao atualizar tarefa. Veja o console.')
    }
  }

  async function onRemove(id: string) {
    try {
      await vm.removeTodo(id)
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
      await vm.editTodo(todo, title)
    } catch (err) {
      console.error(err)
      window.alert('Erro ao editar tarefa. Veja o console.')
    }
  }

  return (
    <div className="page">
      <main className="layout" aria-label="Todo List - MVVM">
        <h1 className="title">ToDo ES - MVVM</h1>

        <div className="topbar" aria-label="Actions">
          <select
            className="select"
            value={vm.mode}
            onChange={(e) => vm.setMode(e.target.value as DataMode)}
            aria-label="Data mode"
          >
            <option value="rest">REST (manual)</option>
            <option value="realtime">Realtime (auto)</option>
          </select>

          <select
            className="select"
            value={vm.filter}
            onChange={(e) => vm.setFilter(e.target.value as Filter)}
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
          {vm.mode === 'realtime' && (vm.realtimeStatus || vm.realtimeError) ? (
            <p className="empty" style={{ textAlign: 'left', padding: '0 0 10px' }}>
              <b>Realtime:</b> {vm.realtimeStatus || '…'}
              {vm.realtimeError ? (
                <>
                  <br />
                  <span>{vm.realtimeError}</span>
                </>
              ) : null}
            </p>
          ) : null}

          {vm.isLoading ? (
            <p className="empty">Loading…</p>
          ) : vm.visibleTodos.length === 0 ? (
            <p className="empty">No tasks in this filter.</p>
          ) : (
            <ul className="list">
              {vm.visibleTodos.map((todo) => (
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