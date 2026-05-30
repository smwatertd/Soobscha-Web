import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarOutlined, ExclamationCircleOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useSearchParams, Link } from 'react-router-dom'
import { complaintsApi } from '../api/endpoints'
import { AppNavLink } from '../components/AppNavLink'
import { ComplaintReviewModal } from '../components/ComplaintReviewModal'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { UserProfileLink } from '../components/UserProfileLink'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import type { Complaint } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'

export type ComplaintsListPageProps = {
  readOnly?: boolean
  adminMode?: boolean
}

export const ComplaintsListPage = ({ readOnly = false, adminMode = false }: ComplaintsListPageProps = {}) => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState(searchParams.get('status') ?? 'OPEN')
  const [items, setItems] = useState<Complaint[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<Complaint | null>(null)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const response = await complaintsApi.list({
          status: status || undefined,
          limit: 50,
          offset: 0,
        })
        setItems(response)
      } catch (requestError: unknown) {
        setError(getErrorMessage(requestError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [status],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  const handleReview = async (uphold: boolean, reviewNote: string) => {
    if (!reviewTarget) {
      return
    }

    await complaintsApi.review(reviewTarget.id, {
      uphold,
      review_note: reviewNote || null,
    })
    setReviewTarget(null)
    await load(true)
  }

  return (
    <>
      <PageHeader
        icon={<ExclamationCircleOutlined />}
        title="Жалобы"
        description={
          adminMode
            ? 'Просмотр жалоб пользователей на участников социальных заявок.'
            : 'Рассмотрение жалоб пользователей на участников социальных заявок.'
        }
      />
      <Space wrap style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Статус</Typography.Text>
          <Select
            style={{ width: 220 }}
            value={status}
            onChange={setStatus}
            options={[
              { value: 'OPEN', label: 'Открытые' },
              { value: 'UPHELD', label: 'Подтверждённые' },
              { value: 'REJECTED', label: 'Отклонённые' },
              { value: '', label: 'Все' },
            ]}
          />
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем жалобы..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !items.length ? (
        <StateBlock title="Жалоб не найдено" description="Попробуйте изменить фильтр статуса." />
      ) : null}
      {items.length ? (
        <Table
          rowKey="id"
          dataSource={items}
          columns={getColumns({ onReview: setReviewTarget, readOnly, adminMode })}
          pagination={false}
        />
      ) : null}
      {!readOnly && reviewTarget ? (
        <ComplaintReviewModal complaint={reviewTarget} onClose={() => setReviewTarget(null)} onSubmit={handleReview} />
      ) : null}
    </>
  )
}

type ComplaintColumnsOptions = {
  onReview: (complaint: Complaint) => void
  readOnly: boolean
  adminMode: boolean
}

const getColumns = ({ onReview, readOnly, adminMode }: ComplaintColumnsOptions): TableColumnsType<Complaint> => {
  const columns: TableColumnsType<Complaint> = [
  {
    title: <TableTitle icon={<ExclamationCircleOutlined />} label="Жалоба" />,
    render: (_, complaint) => (
      <Space direction="vertical" size={2}>
        <Typography.Text strong>{complaint.reason}</Typography.Text>
        {complaint.details ? <Typography.Text type="secondary">{complaint.details}</Typography.Text> : null}
      </Space>
    ),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (value: string) => <StatusBadge status={value} />,
  },
  {
    title: <TableTitle icon={<FileTextOutlined />} label="Заявка" />,
    render: (_, complaint) =>
      adminMode ? (
        truncateId(complaint.help_request_id)
      ) : (
        <AppNavLink to={`/requests/${complaint.help_request_id}`}>{truncateId(complaint.help_request_id)}</AppNavLink>
      ),
  },
  {
    title: <TableTitle icon={<UserOutlined />} label="Автор / объект" />,
    render: (_, complaint) => (
      <Space direction="vertical" size={0}>
        {adminMode ? (
          <>
            <Link to={`/admin/users/${complaint.author_user_id}`}>Автор: {truncateId(complaint.author_user_id)}</Link>
            <Link to={`/admin/users/${complaint.reported_user_id}`}>
              На кого: {truncateId(complaint.reported_user_id)}
            </Link>
          </>
        ) : (
          <>
            <UserProfileLink userId={complaint.author_user_id}>Автор: {truncateId(complaint.author_user_id)}</UserProfileLink>
            <UserProfileLink userId={complaint.reported_user_id}>
              На кого: {truncateId(complaint.reported_user_id)}
            </UserProfileLink>
          </>
        )}
      </Space>
    ),
  },
  {
    title: <TableTitle icon={<CalendarOutlined />} label="Создана" />,
    dataIndex: 'created_at',
    render: (value: string) => formatDate(value),
  },
  ]

  if (!readOnly) {
    columns.push({
      title: 'Действие',
      render: (_, complaint) =>
        complaint.status === 'OPEN' ? (
          <Button type="primary" size="small" onClick={() => onReview(complaint)}>
            Рассмотреть
          </Button>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    })
  }

  return columns
}

const TableTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={6}>
    <span className="table-title-icon">{icon}</span>
    {label}
  </Space>
)
