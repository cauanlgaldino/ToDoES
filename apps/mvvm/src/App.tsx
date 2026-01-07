import { useMemo } from 'react'
import { createTodoService } from '@todo-es/shared'
import ToDoView from './View/ToDoView'
import { useToDoViewModel } from './ViewModel/ToDoViewModel.ts'

export default function App() {
  const todoService = useMemo(
    () =>
      createTodoService(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ),
    [],
  )

  const vm = useToDoViewModel(todoService)

  return <ToDoView vm={vm} />
}