import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type LocationState = {
  from?: {
    pathname?: string
  }
}

const TEST_USERS = [
  {
    role: 'Партнёр',
    login: 'Daniella_Mertz@hotmail.com',
    password: 'Xhh0a94Iw48vtIk',
    isAvailable: true,
  },
  {
    role: 'Админ',
    login: '—',
    password: '—',
    isAvailable: false,
  },
]

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const normalizedIdentifier = identifier.trim()
    const isEmail = normalizedIdentifier.includes('@')

    try {
      await login({
        email: isEmail ? normalizedIdentifier : null,
        phone_number: isEmail ? null : normalizedIdentifier,
        password,
      })
      navigate(from, { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Не удалось войти')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Партнёрский backoffice</p>
          <h1>Вход в кабинет</h1>
          <p>Используйте email или телефон и пароль партнёра.</p>
        </div>
        <label>
          Email или телефон
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button primary full-width" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
        <section className="test-users">
          <div>
            <h2>Тестовые пользователи</h2>
            <p>Можно быстро заполнить форму тестовыми данными.</p>
          </div>
          {TEST_USERS.map((user) => (
            <div key={user.role} className="test-user-card">
              <div>
                <strong>{user.role}</strong>
                <span>{user.login}</span>
                <small>{user.password}</small>
              </div>
              <button
                type="button"
                className="button secondary"
                disabled={!user.isAvailable}
                onClick={() => {
                  setIdentifier(user.login)
                  setPassword(user.password)
                  setError('')
                }}
              >
                {user.isAvailable ? 'Заполнить' : 'Нет данных'}
              </button>
            </div>
          ))}
        </section>
      </form>
    </main>
  )
}
