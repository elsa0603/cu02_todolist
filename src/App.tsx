import { TodoList } from './components/TodoList'
import { AuthForm } from './components/AuthForm'
import { useAuth } from './hooks/useAuth'
import { EmailConfirmationNotice } from './components/EmailConfirmationNotice'
import './App.css'

function App() {
  const { user, loading, signIn, signUp, signOut, isEmailConfirmed } = useAuth()

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading">載入中...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="App">
        <AuthForm onSignIn={signIn} onSignUp={signUp} />
      </div>
    )
  }

  return (
    <div className="App">
      <div className="user-header">
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          {!isEmailConfirmed && (
            <span className="email-unconfirmed-badge">未確認</span>
          )}
        </div>
        <button onClick={() => signOut()} className="logout-button">
          登出
        </button>
      </div>
      {!isEmailConfirmed && (
        <EmailConfirmationNotice email={user.email || ''} />
      )}
      <TodoList />
    </div>
  )
}

export default App
