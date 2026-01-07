import { useMemo } from 'react'
import { createTodoService } from '@todo-es/shared'
import ToDoView from './View/ToDoView'
import { useToDoController } from './Controller/ToDoController'

export default function App() {
  const todoService = useMemo(
    () =>
      createTodoService(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ),
    [],
  )

  const controller = useToDoController(todoService)

  return <ToDoView controller={controller} />
}