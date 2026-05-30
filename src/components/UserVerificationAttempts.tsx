import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { HistoryOutlined } from '@ant-design/icons'
import { Empty, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { AppNavLink } from './AppNavLink'
import { verificationsApi } from '../api/endpoints'
import { StatusBadge } from './StatusBadge'
import type { VerificationAttemptSummary } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { labelOrValue } from '../utils/labels'

type UserVerificationAttemptsProps = {
  userId: string
  currentAttemptId: string
  categoryLabels?: Record<string, string>
}

export const UserVerificationAttempts = ({
  userId,
  currentAttemptId,
  categoryLabels = {},
}: UserVerificationAttemptsProps) => {
  const [items, setItems] = useState<VerificationAttemptSummary[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setError('')

    verificationsApi
      .list({ user_id: userId })
      .then((response) =>
        setItems(
          [...response].sort(
            (first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
          ),
        ),
      )
      .catch((loadError: unknown) => setError(getErrorMessage(loadError)))
      .finally(() => setIsLoading(false))
  }, [userId])

  if (isLoading) {
    return <Typography.Text type="secondary">Загружаем попытки пользователя...</Typography.Text>
  }

  if (error) {
    return <Typography.Text type="danger">{error}</Typography.Text>
  }

  if (!items.length) {
    return <Empty description="Попыток верификации не найдено" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  if (items.length === 1) {
    return (
      <Typography.Text type="secondary">
        У пользователя пока только эта попытка верификации.
      </Typography.Text>
    )
  }

  const relevantAttempt = getRelevantAttempt(items)

  return (
    <Table
      size="small"
      rowKey="id"
      dataSource={items}
      pagination={false}
      rowClassName={(record) => {
        if (record.id === currentAttemptId) {
          return 'verification-attempt-row--open'
        }

        if (record.id === relevantAttempt?.id) {
          return 'verification-attempt-row--active'
        }

        return ''
      }}
      columns={getColumns(categoryLabels, currentAttemptId, relevantAttempt)}
    />
  )
}

const getRelevantAttempt = (items: VerificationAttemptSummary[]) => {
  const latestApproved = items.find((item) => item.status === 'APPROVED')

  return latestApproved ?? items[0]
}

const getColumns = (
  categoryLabels: Record<string, string>,
  currentAttemptId: string,
  relevantAttempt?: VerificationAttemptSummary,
): TableColumnsType<VerificationAttemptSummary> => [
  {
    title: 'Попытка',
    render: (_, attempt) => (
      <Space direction="vertical" size={2}>
        <Space size={6} wrap>
          <AppNavLink to={`/verifications/${attempt.id}`} bold>
            {truncateId(attempt.id)}
          </AppNavLink>
          {attempt.id === relevantAttempt?.id ? (
            <Tag color={relevantAttempt.status === 'APPROVED' ? 'success' : 'default'}>
              {relevantAttempt.status === 'APPROVED' ? 'Активная' : 'Последняя'}
            </Tag>
          ) : null}
          {attempt.id === currentAttemptId ? <Tag color="blue">Сейчас открыта</Tag> : null}
        </Space>
        <Typography.Text type="secondary">{formatDate(attempt.created_at)}</Typography.Text>
      </Space>
    ),
  },
  {
    title: 'Категория',
    dataIndex: 'category',
    render: (category?: string | null) => labelOrValue(categoryLabels, category),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (status: string) => <StatusBadge status={status} />,
  },
]

export const UserVerificationAttemptsSectionTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={8}>
    <span className="section-title-icon">{icon}</span>
    {label}
  </Space>
)

export const userVerificationAttemptsSectionIcon = <HistoryOutlined />
