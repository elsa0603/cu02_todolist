import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface EmailConfirmationNoticeProps {
  email: string
}

export function EmailConfirmationNotice({ email }: EmailConfirmationNoticeProps) {
  const { resendConfirmationEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const { error } = await resendConfirmationEmail(email)
      if (error) {
        setError(error.message || '發送失敗')
      } else {
        setMessage('確認郵件已重新發送，請檢查您的收件匣')
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="email-confirmation-notice">
      <div className="email-confirmation-content">
        <div className="email-confirmation-icon">📧</div>
        <div className="email-confirmation-text">
          <strong>請確認您的電子郵件</strong>
          <p>我們已發送確認郵件到 {email}，請點擊郵件中的連結來確認您的帳號。</p>
          {message && <div className="email-confirmation-message">{message}</div>}
          {error && <div className="email-confirmation-error">{error}</div>}
        </div>
        <button
          onClick={handleResend}
          disabled={loading}
          className="email-confirmation-button"
        >
          {loading ? '發送中...' : '重新發送確認郵件'}
        </button>
      </div>
    </div>
  )
}


