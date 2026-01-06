import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useTodos, type TodoCategory } from '../hooks/useTodos'
import { TodoItem } from './TodoItem'
import { AddTodoForm } from './AddTodoForm'

const CATEGORIES: TodoCategory[] = ['專案A', '專案B', '專案C']

export function TodoList() {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo, updateSortOrder } = useTodos()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // 找到被拖動的項目和目標項目
    const activeTodo = todos.find((todo) => todo.id === active.id)
    const overTodo = todos.find((todo) => todo.id === over.id)

    if (!activeTodo || !overTodo) {
      return
    }

    // 檢查是否屬於同一個類別
    if (activeTodo.category !== overTodo.category) {
      return
    }

    // 取得該類別的所有項目
    const categoryTodos = todos
      .filter((todo) => todo.category === activeTodo.category)
      .sort((a, b) => a.sort_order - b.sort_order)

    const oldIndex = categoryTodos.findIndex((todo) => todo.id === active.id)
    const newIndex = categoryTodos.findIndex((todo) => todo.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const newOrder = arrayMove(categoryTodos, oldIndex, newIndex)
    await updateSortOrder(activeTodo.category, newOrder)
  }

  // 依類別分組（使用 useMemo 快取結果）
  const todosByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = todos
        .filter((todo) => todo.category === category)
        .sort((a, b) => a.sort_order - b.sort_order)
      return acc
    }, {} as Record<TodoCategory, typeof todos>)
  }, [todos])

  if (loading) {
    return (
      <div className="todo-container">
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="todo-container">
        <div className="error">錯誤: {error}</div>
      </div>
    )
  }

  return (
    <div className="todo-container">
      <h1 className="todo-title">工作清單</h1>
      
      <AddTodoForm onAdd={addTodo} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="todo-columns">
          {CATEGORIES.map((category) => {
            const categoryTodos = todosByCategory[category]
            const todoIds = categoryTodos.map(todo => todo.id)

            return (
              <div key={category} className={`todo-column todo-column-${category}`}>
                <h2 className="column-title">{category}</h2>
                {categoryTodos.length === 0 ? (
                  <div className="empty-column">目前沒有項目</div>
                ) : (
                  <SortableContext
                    items={todoIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="todo-list">
                      {categoryTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleTodo}
                          onDelete={deleteTodo}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
