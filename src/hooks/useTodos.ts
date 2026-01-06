import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type TodoCategory = '專案A' | '專案B' | '專案C'

export interface Todo {
  id: string
  content: string
  completed: boolean
  created_at: string
  sort_order: number
  category: TodoCategory
  user_id: string
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 載入所有工作項目（所有人可以看到所有任務）
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true)
      
      // 獲取當前用戶（用於檢查權限）
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTodos([])
        setLoading(false)
        return
      }

      // 載入所有任務，不限制 user_id
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })

      if (error) throw error
      setTodos(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
      console.error('Error fetching todos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 新增工作項目
  const addTodo = useCallback(async (content: string, category: TodoCategory) => {
    try {
      // 獲取當前用戶
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('請先登入')
      }

      // 從本地狀態計算下一個 sort_order，避免額外的資料庫查詢
      const categoryTodos = todos.filter(t => t.category === category)
      const maxSortOrder = categoryTodos.length > 0
        ? Math.max(...categoryTodos.map(t => t.sort_order))
        : -1
      const nextSortOrder = maxSortOrder + 1

      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            content,
            completed: false,
            sort_order: nextSortOrder,
            category,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error
      if (data) {
        setTodos((prev) => {
          const newTodos = [...prev, data]
          return newTodos.sort((a, b) => {
            if (a.category !== b.category) {
              return a.category.localeCompare(b.category)
            }
            return a.sort_order - b.sort_order
          })
        })
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增失敗')
      console.error('Error adding todo:', err)
      throw err
    }
  }, [todos])

  // 切換完成狀態（只有任務擁有者可以）
  const toggleTodo = useCallback(async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      // 獲取當前用戶
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('請先登入')
      }

      // 檢查是否為任務擁有者
      if (todo.user_id !== user.id) {
        throw new Error('您只能關閉自己的任務')
      }

      // 樂觀更新：先更新本地狀態
      setTodos((prev) =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      )

      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (data) {
        // 使用伺服器返回的資料更新狀態
        setTodos((prev) =>
          prev.map(t => t.id === id ? data : t)
        )
      }
      setError(null)
    } catch (err) {
      // 發生錯誤時恢復原狀態
      const todo = todos.find(t => t.id === id)
      if (todo) {
        setTodos((prev) =>
          prev.map(t => t.id === id ? { ...t, completed: todo.completed } : t)
        )
      }
      setError(err instanceof Error ? err.message : '更新失敗')
      console.error('Error toggling todo:', err)
    }
  }, [todos])

  // 刪除工作項目
  const deleteTodo = useCallback(async (id: string) => {
    // 先保存要刪除的項目，以便錯誤時恢復
    const todoToDelete = todos.find(t => t.id === id)
    if (!todoToDelete) return

    try {
      // 樂觀更新：先從本地狀態移除
      setTodos((prev) => prev.filter(t => t.id !== id))

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setError(null)
    } catch (err) {
      // 發生錯誤時恢復原狀態
      setTodos((prev) => {
        const newTodos = [...prev, todoToDelete]
        return newTodos.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          return a.sort_order - b.sort_order
        })
      })
      setError(err instanceof Error ? err.message : '刪除失敗')
      console.error('Error deleting todo:', err)
    }
  }, [todos])

  // 更新排序順序（僅更新指定類別的項目）
  const updateSortOrder = useCallback(async (category: TodoCategory, newOrder: Todo[]) => {
    try {
      // 只更新該類別的項目
      const categoryTodos = newOrder.filter(todo => todo.category === category)
      
      // 樂觀更新：先更新本地狀態
      setTodos((prev) => {
        const otherTodos = prev.filter(t => t.category !== category)
        const updatedCategoryTodos = categoryTodos.map((todo, index) => ({
          ...todo,
          sort_order: index
        }))
        return [...otherTodos, ...updatedCategoryTodos].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          return a.sort_order - b.sort_order
        })
      })
      
      // 批次更新該類別所有項目的 sort_order
      const updates = categoryTodos.map((todo, index) => ({
        id: todo.id,
        sort_order: index
      }))

      // 使用 Promise.all 批次更新
      const updatePromises = updates.map(update =>
        supabase
          .from('todos')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      )

      await Promise.all(updatePromises)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '排序更新失敗')
      console.error('Error updating sort order:', err)
      // 發生錯誤時重新載入資料
      fetchTodos()
    }
  }, [fetchTodos])

  // 監聽資料庫變化
  useEffect(() => {
    fetchTodos()

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos'
        },
        () => {
          // 只在必要時重新載入，避免過度更新
          // 如果是由本地操作引起的變化，可以跳過重新載入
          // 但為了保持資料一致性，我們仍然重新載入
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTodos])

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateSortOrder
  }
}


