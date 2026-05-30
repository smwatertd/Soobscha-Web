import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AppstoreOutlined, AuditOutlined, CalendarOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons'
import { Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { AppNavLink } from '../components/AppNavLink'
import { reportsApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import type { PaginatedResponse, ReportSummary } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue, ENUM_LABELS } from '../utils/labels'

const PAGE_SIZE = 20

export const ReportsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [queue, setQueue] = useState(searchParams.get('queue') === 'settlement-review' ? 'settlement-review' : 'moderation')
  const [status, setStatus] = useState(queue === 'moderation' ? 'PENDING_MODERATION' : '')
  const [data, setData] = useState<PaginatedResponse<ReportSummary> | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const response = await reportsApi.list({
          page,
          'page-size': PAGE_SIZE,
          'order-by': 'created_at',
          'order-desc': true,
          statuses: queue === 'moderation' ? status : undefined,
          'help-request-type': queue === 'settlement-review' ? 'MATERIAL' : undefined,
          'awaiting-material-settlement-review': queue === 'settlement-review' ? true : undefined,
        })
        setData(response)
      } catch (reportError: unknown) {
        setError(getErrorMessage(reportError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [page, queue, status],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  return (
    <>
      <PageHeader icon={<FileTextOutlined />} title="Отчёты" description="Проверка отчётов по материальной и социальной помощи." />
      <Space wrap style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Очередь</Typography.Text>
          <Select
            style={{ width: 340 }}
            value={queue}
            onChange={(event) => {
              const nextQueue = event
              setPage(1)
              setQueue(nextQueue)
              setStatus(nextQueue === 'moderation' ? 'PENDING_MODERATION' : '')
              setSearchParams(nextQueue === 'settlement-review' ? { queue: 'settlement-review' } : {})
            }}
            options={[
              { value: 'moderation', label: 'Модерация отчётов' },
              { value: 'settlement-review', label: 'Финансовая проверка материальных отчётов' },
            ]}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Статус</Typography.Text>
          <Select
            style={{ width: 220 }}
            value={status}
            disabled={queue !== 'moderation'}
            onChange={(event) => {
              setPage(1)
              setStatus(event)
            }}
            options={[
              { value: '', label: 'Все' },
              { value: 'PENDING_MODERATION', label: 'На модерации' },
              { value: 'RETURNED_TO_REWORK', label: 'На доработке' },
              { value: 'APPROVED', label: 'Одобрены' },
              { value: 'REJECTED', label: 'Отклонены' },
            ]}
          />
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем отчёты..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !data?.items.length ? <StateBlock title="Отчётов не найдено" /> : null}
      {data?.items.length ? (
        <>
          <Table rowKey="id" dataSource={data.items} columns={columns} pagination={false} />
          <Pagination page={page} totalCount={data.total_count} hasMore={data.has_more} onPageChange={setPage} />
        </>
      ) : null}
    </>
  )
}

const columns: TableColumnsType<ReportSummary> = [
  {
    title: <TableTitle icon={<FileTextOutlined />} label="Отчёт" />,
    dataIndex: 'id',
    render: (id: string) => (
      <Space size={10}>
        <span className="table-row-icon">
          <FileTextOutlined />
        </span>
        <AppNavLink to={`/reports/${id}`} bold>
          {truncateId(id)}
        </AppNavLink>
      </Space>
    ),
  },
  {
    title: <TableTitle icon={<LinkOutlined />} label="Заявка" />,
    dataIndex: 'help_request_id',
    render: (id: string) => (
      <IconText icon={<LinkOutlined />} text={<AppNavLink to={`/requests/${id}`}>{truncateId(id)}</AppNavLink>} />
    ),
  },
  {
    title: <TableTitle icon={<AppstoreOutlined />} label="Тип" />,
    dataIndex: 'help_request_type',
    render: (type: string) => <IconText icon={<AppstoreOutlined />} text={labelOrValue(HELP_REQUEST_TYPES, type)} />,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (status: string) => <StatusBadge status={status} />,
  },
  {
    title: <TableTitle icon={<AuditOutlined />} label="Расчёты" />,
    dataIndex: 'settlement_status',
    render: (status?: string | null) => <IconText icon={<AuditOutlined />} text={labelOrValue(ENUM_LABELS, status)} />,
  },
  {
    title: <TableTitle icon={<CalendarOutlined />} label="Создан" />,
    dataIndex: 'created_at',
    render: (createdAt: string) => <IconText icon={<CalendarOutlined />} text={formatDate(createdAt)} />,
  },
];

function TableTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Space size={6}>
      <span className="table-title-icon">{icon}</span>
      {label}
    </Space>
  )
}

function IconText({ icon, text }: { icon: ReactNode; text: ReactNode }) {
  return (
    <Space size={6}>
      <span className="table-cell-icon">{icon}</span>
      <span>{text}</span>
    </Space>
  )
}
