import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 獲取當前會話
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 監聽身份驗證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 註冊
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  // 登入
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // 重新發送確認郵件
  const resendConfirmationEmail = async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    return { data, error }
  }

  // 檢查電子郵件是否已確認
  const isEmailConfirmed = user?.email_confirmed_at !== null

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmationEmail,
    isEmailConfirmed,
  }
}

