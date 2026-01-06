import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../hooks/useAuth'
import type { Todo } from '../hooks/useTodos'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { user } = useAuth()
  const isOwner = user?.id === todo.user_id
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '剛剛'
    if (diffMins < 60) return `${diffMins} 分鐘前`
    if (diffHours < 24) return `${diffHours} 小時前`
    if (diffDays < 7) return `${diffDays} 天前`
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="todo-drag-handle" {...attributes} {...listeners}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="7" cy="5" r="1.5" fill="currentColor" />
          <circle cx="13" cy="5" r="1.5" fill="currentColor" />
          <circle cx="7" cy="10" r="1.5" fill="currentColor" />
          <circle cx="13" cy="10" r="1.5" fill="currentColor" />
          <circle cx="7" cy="15" r="1.5" fill="currentColor" />
          <circle cx="13" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </div>
      
      <div className="todo-content-wrapper">
        <div className="todo-checkbox-wrapper">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            disabled={!isOwner}
            className="todo-checkbox"
            title={isOwner ? '標記完成' : '只能關閉自己的任務'}
          />
        </div>
        
        <div className="todo-text-wrapper">
          <div className={`todo-text ${todo.completed ? 'strikethrough' : ''}`}>
            {todo.content}
          </div>
          <div className="todo-time">
            {formatTime(todo.created_at)}
            {!isOwner && (
              <span className="todo-owner-badge" title={`由其他用戶建立`}>
                👤
              </span>
            )}
          </div>
        </div>
      </div>

      {!todo.completed && isOwner && (
        <button
          onClick={() => onDelete(todo.id)}
          className="delete-button"
          aria-label="刪除"
        >
          ×
        </button>
      )}
      {!todo.completed && !isOwner && (
        <span className="todo-readonly-badge" title="只能刪除自己的任務">
          🔒
        </span>
      )}
      {todo.completed && (
        <span className="completed-badge" title="已完成項目將保留在資料庫中">
          ✓
        </span>
      )}
    </div>
  )
}

