import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarOutlined, EnvironmentOutlined, IdcardOutlined, SafetyCertificateOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { AppNavLink } from '../components/AppNavLink'
import { ApplicantContactsPanel } from '../components/ApplicantContactsPanel'
import { verificationsApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { UserProfileLink } from '../components/UserProfileLink'
import { useBeneficiaryCategories } from '../hooks/useBeneficiaryCategories'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import { useCities } from '../hooks/useCities'
import type { VerificationAttemptSummary } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { labelOrValue, ROLES } from '../utils/labels'

export const VerificationsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const userIdFilter = searchParams.get('user_id') ?? ''
  const [status, setStatus] = useState(userIdFilter ? '' : 'PENDING_MODERATION')
  const [role, setRole] = useState('')
  const [items, setItems] = useState<VerificationAttemptSummary[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const categoryLabels = useBeneficiaryCategories()
  const cityLabels = useCities()

  useEffect(() => {
    if (userIdFilter) {
      setStatus('')
    }
  }, [userIdFilter])

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const response = await verificationsApi.list({ status, user_role: role, user_id: userIdFilter })
        setItems(response)
      } catch (verificationError: unknown) {
        setError(getErrorMessage(verificationError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [role, status, userIdFilter],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  const clearUserFilter = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('user_id')
    setSearchParams(nextParams)
    setStatus('PENDING_MODERATION')
  }

  return (
    <>
      <PageHeader
        icon={<SafetyCertificateOutlined />}
        title="Верификации"
        description="Очередь попыток верификации пользователей с данными заявителя и результатами проверки."
      />
      {userIdFilter ? (
        <Alert
          style={{ marginBottom: 20 }}
          type="info"
          showIcon
          message={
            <Space wrap>
              <span>
                Показаны все попытки пользователя{' '}
                <UserProfileLink userId={userIdFilter}>{truncateId(userIdFilter)}</UserProfileLink>
              </span>
              <Button size="small" onClick={clearUserFilter}>
                Сбросить фильтр
              </Button>
            </Space>
          }
        />
      ) : null}
      <Space wrap style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Статус</Typography.Text>
          <Select
            style={{ width: 220 }}
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'Все' },
              { value: 'PENDING_MODERATION', label: 'На модерации' },
              { value: 'APPROVED', label: 'Одобрены' },
              { value: 'REJECTED', label: 'Отклонены' },
              { value: 'REVOKED', label: 'Отозваны' },
            ]}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Роль</Typography.Text>
          <Select
            style={{ width: 220 }}
            value={role}
            onChange={setRole}
            options={[
              { value: '', label: 'Все' },
              { value: 'BENEFICIARY', label: 'Бенефициар' },
              { value: 'VOLUNTEER', label: 'Волонтёр' },
            ]}
          />
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем верификации..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !items.length ? <StateBlock title="Верификаций не найдено" /> : null}
      {items.length ? (
        <Table rowKey="id" dataSource={items} columns={getColumns(categoryLabels, cityLabels)} pagination={false} />
      ) : null}
    </>
  )
}

const getColumns = (
  categoryLabels: Record<string, string>,
  cityLabels: Record<string, string>,
): TableColumnsType<VerificationAttemptSummary> => [
  {
    title: <TableTitle icon={<UserOutlined />} label="Заявитель" />,
    render: (_, attempt) => (
      <Space align="start" size={10}>
        <span className="table-row-icon">
          <UserOutlined />
        </span>
        <Space direction="vertical" size={2}>
          <AppNavLink to={`/verifications/${attempt.id}`} bold>
            {attempt.applicant_full_name || truncateId(attempt.user_id)}
          </AppNavLink>
          <Typography.Text type="secondary">Верификация {truncateId(attempt.id)}</Typography.Text>
          <Typography.Text type="secondary">
            Пользователь: <UserProfileLink userId={attempt.user_id}>{truncateId(attempt.user_id)}</UserProfileLink>
          </Typography.Text>
          <ApplicantContactsPanel contact={attempt.applicant_contact} compact />
        </Space>
      </Space>
    ),
  },
  {
    title: <TableTitle icon={<IdcardOutlined />} label="Роль" />,
    dataIndex: 'user_role',
    render: (role: string) => <IconText icon={<IdcardOutlined />} text={labelOrValue(ROLES, role)} />,
  },
  {
    title: <TableTitle icon={<TagsOutlined />} label="Категория" />,
    dataIndex: 'category',
    render: (category?: string | null) => <IconText icon={<TagsOutlined />} text={labelOrValue(categoryLabels, category)} />,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (status: string) => <StatusBadge status={status} />,
  },
  {
    title: <TableTitle icon={<EnvironmentOutlined />} label="Город" />,
    dataIndex: 'applicant_city',
    render: (city?: string | null) => <IconText icon={<EnvironmentOutlined />} text={labelOrValue(cityLabels, city)} />,
  },
  {
    title: <TableTitle icon={<CalendarOutlined />} label="Создана" />,
    dataIndex: 'created_at',
    render: (createdAt: string) => <IconText icon={<CalendarOutlined />} text={formatDate(createdAt)} />,
  },
]

const TableTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={6}>
    <span className="table-title-icon">{icon}</span>
    {label}
  </Space>
)

const IconText = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <Space size={6}>
    <span className="table-cell-icon">{icon}</span>
    <span>{text}</span>
  </Space>
)
