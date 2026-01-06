import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TodoCategory } from '../hooks/useTodos'

interface AddTodoFormProps {
  onAdd: (content: string, category: TodoCategory) => Promise<void>
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<TodoCategory>('專案A')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onAdd(content.trim(), category)
      setContent('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as TodoCategory)}
        className="category-select"
        disabled={isSubmitting}
      >
        <option value="專案A">專案A</option>
        <option value="專案B">專案B</option>
        <option value="專案C">專案C</option>
      </select>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="輸入工作內容..."
        className="todo-input"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="add-button"
      >
        {isSubmitting ? '新增中...' : '新增'}
      </button>
    </form>
  )
}

