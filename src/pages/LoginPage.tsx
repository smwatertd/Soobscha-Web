import { useState } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export const LoginPage = () => {
  const { isAuthenticated, userRole, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form] = Form.useForm<{ identifier: string; password: string }>()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={userRole === 'ADMIN' ? '/admin' : '/'} replace />
  }

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'
  const canGoBack = location.key !== 'default'

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1)
      return
    }

    window.history.back()
  }

  const handleSubmit = async (values: { identifier: string; password: string }) => {
    setError('')
    setIsSubmitting(true)

    const normalizedIdentifier = values.identifier.trim()
    const isEmail = normalizedIdentifier.includes('@')

    try {
      await login({
        email: isEmail ? normalizedIdentifier : null,
        phone_number: isEmail ? null : normalizedIdentifier,
        password: values.password,
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
      <Card className="login-card">
        <Button
          className="login-back-btn"
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Назад
        </Button>
        <div>
          <Typography.Text className="eyebrow">Сообща</Typography.Text>
          <Typography.Title level={2}>Вход в кабинет</Typography.Title>
          <Typography.Paragraph type="secondary">
            Используйте email или телефон и пароль для входа в кабинет партнёра или администратора.
          </Typography.Paragraph>
        </div>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email или телефон"
            name="identifier"
            rules={[{ required: true, message: 'Укажите email или телефон' }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Укажите пароль' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          {error ? <Alert type="error" message={error} showIcon className="login-error" /> : null}
          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Войти
          </Button>
        </Form>
      </Card>
    </main>
  )
}
