import { useState } from 'react'
import { SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Input, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { adminsApi } from '../../api/endpoints'
import { PageHeader } from '../../components/PageHeader'
import { StateBlock } from '../../components/StateBlock'
import { getErrorMessage } from '../../utils/format'

export const AdminUsersListPage = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    const normalizedPhone = phone.trim()
    const normalizedEmail = email.trim()
    const normalizedUserId = userId.trim()

    if (!normalizedPhone && !normalizedEmail && !normalizedUserId) {
      setError('Укажите телефон, email или ID пользователя.')
      return
    }

    setIsSearching(true)
    setError('')

    try {
      const user = await adminsApi.lookupUser({
        phone: normalizedPhone || undefined,
        email: normalizedEmail || undefined,
        user_id: normalizedUserId || undefined,
      })
      navigate(`/admin/users/${user.user_id}`)
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <>
      <PageHeader
        icon={<TeamOutlined />}
        title="Пользователи"
        description="Поиск учётной записи по телефону, email или UUID для просмотра карточки и управления доступом."
      />
      <Space direction="vertical" size={16} style={{ maxWidth: 560, width: '100%' }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary">Телефон</Typography.Text>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="+7..."
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Space>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary">Email</Typography.Text>
          <Input
            allowClear
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Space>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary">ID пользователя</Typography.Text>
          <Input
            allowClear
            placeholder="UUID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </Space>
        <Button type="primary" loading={isSearching} onClick={() => void handleSearch()}>
          Найти пользователя
        </Button>
      </Space>
      {error ? <StateBlock title="Пользователь не найден" description={error} /> : null}
    </>
  )
}
