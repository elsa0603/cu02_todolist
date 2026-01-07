import { useState } from 'react'
import type { FormEvent } from 'react'

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>
  onSignUp: (email: string, password: string) => Promise<{ error: any }>
}

export function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError('請輸入電子郵件和密碼')
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError('密碼不一致')
      return
    }

    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await onSignUp(email, password)
        if (error) {
          setError(error.message || '註冊失敗')
        } else {
          setMessage('註冊成功！請檢查您的電子郵件以確認帳號。')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        const { error } = await onSignIn(email, password)
        if (error) {
          setError(error.message || '登入失敗')
        }
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">工作清單</h1>
        <p className="auth-subtitle">
          {isSignUp ? '建立新帳號' : '登入您的帳號'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">電子郵件</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 個字元"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">確認密碼</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次輸入密碼"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading
              ? isSignUp
                ? '註冊中...'
                : '登入中...'
              : isSignUp
              ? '註冊'
              : '登入'}
          </button>
        </form>

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
              setPassword('')
              setConfirmPassword('')
            }}
            className="auth-switch-button"
          >
            {isSignUp
              ? '已有帳號？點擊登入'
              : '還沒有帳號？點擊註冊'}
          </button>
        </div>
      </div>
    </div>
  )
}


