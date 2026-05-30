import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AppstoreOutlined, CalendarOutlined, DollarCircleOutlined, FileTextOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons'
import { Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { AppNavLink } from '../components/AppNavLink'
import { helpRequestsApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { ReportStatusBadge } from '../components/ReportStatusBadge'
import { useHelpRequestCategories } from '../hooks/useHelpRequestCategories'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import type { HelpRequestSummary, PaginatedResponse } from '../types/api'
import { formatDate, formatDistanceKm, formatMoney, getErrorMessage } from '../utils/format'
import { getBeneficiaryDisplayName } from '../utils/beneficiary'
import { HELP_REQUEST_TYPES, labelOrValue } from '../utils/labels'

const PAGE_SIZE = 20

export const RequestsListPage = () => {
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('PENDING_MODERATION')
  const [data, setData] = useState<PaginatedResponse<HelpRequestSummary> | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const categoryLabels = useHelpRequestCategories()

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const response = await helpRequestsApi.list({
          page,
          'page-size': PAGE_SIZE,
          'order-by': 'created_at',
          'order-desc': true,
          type,
          statuses: status,
        })
        setData(response)
      } catch (requestError: unknown) {
        setError(getErrorMessage(requestError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [page, status, type],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  return (
    <>
      <PageHeader
        icon={<FileTextOutlined />}
        title="Заявки"
        description="Модерация материальных и социальных заявок, просмотр деталей и истории решений."
      />
      <Space wrap style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Тип</Typography.Text>
          <Select
            style={{ width: 220 }}
            value={type}
            onChange={(event) => {
              setPage(1)
              setType(event)
            }}
            options={[
              { value: '', label: 'Все' },
              { value: 'MATERIAL', label: 'Материальные' },
              { value: 'SOCIAL', label: 'Социальные' },
            ]}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Статус</Typography.Text>
          <Select
            style={{ width: 260 }}
            value={status}
            onChange={(event) => {
              setPage(1)
              setStatus(event)
            }}
            options={[
              { value: '', label: 'Все' },
              { value: 'PENDING_MODERATION', label: 'На модерации' },
              { value: 'RETURNED_TO_REWORK', label: 'На доработке' },
              { value: 'REPORT_ON_REVIEW', label: 'Отчёт на проверке' },
              { value: 'REPORT_ON_MODERATION', label: 'Отчёт на модерации' },
              { value: 'COLLECTING_FUNDS', label: 'Сбор средств' },
              { value: 'VOLUNTEER_RECRUITING', label: 'Набор волонтёров' },
            ]}
          />
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем заявки..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !data?.items.length ? (
        <StateBlock title="Заявок не найдено" description="Попробуйте изменить фильтры." />
      ) : null}
      {data?.items.length ? (
        <>
          <Table rowKey="id" dataSource={data.items} columns={getColumns(categoryLabels)} pagination={false} />
          <Pagination page={page} totalCount={data.total_count} hasMore={data.has_more} onPageChange={setPage} />
        </>
      ) : null}
    </>
  )
}

const getColumns = (categoryLabels: Record<string, string>): TableColumnsType<HelpRequestSummary> => [
  {
    title: <TableTitle icon={<FileTextOutlined />} label="Заявка" />,
    dataIndex: 'title',
    render: (_, request) => (
      <Space align="start" size={10}>
        <span className="table-row-icon">
          <FileTextOutlined />
        </span>
        <Space direction="vertical" size={2}>
          <AppNavLink to={`/requests/${request.id}`} bold>
            {request.title}
          </AppNavLink>
          <Typography.Text type="secondary">{request.description}</Typography.Text>
          <Typography.Text type="secondary">
            Бенефициар: {getBeneficiaryDisplayName(request)}
          </Typography.Text>
        </Space>
      </Space>
    ),
  },
  {
    title: <TableTitle icon={<AppstoreOutlined />} label="Тип" />,
    dataIndex: 'type',
    render: (type: string) => <IconText icon={<AppstoreOutlined />} text={labelOrValue(HELP_REQUEST_TYPES, type)} />,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (status: string) => <StatusBadge status={status} />,
  },
  {
    title: 'Отчёт',
    dataIndex: 'report_status',
    render: (reportStatus?: string) => <ReportStatusBadge status={reportStatus} />,
  },
  {
    title: <TableTitle icon={<TagsOutlined />} label="Категория" />,
    dataIndex: 'category',
    render: (category: string) => <IconText icon={<TagsOutlined />} text={labelOrValue(categoryLabels, category)} />,
  },
  {
    title: <TableTitle icon={<DollarCircleOutlined />} label="Сумма / волонтёры" />,
    render: (_, request) => (
      <IconText
        icon={request.type === 'MATERIAL' ? <DollarCircleOutlined /> : <TeamOutlined />}
        text={getRequestMetric(request)}
      />
    ),
  },
  {
    title: <TableTitle icon={<CalendarOutlined />} label="Создана" />,
    dataIndex: 'created_at',
    render: (createdAt?: string) => <IconText icon={<CalendarOutlined />} text={formatDate(createdAt)} />,
  },
]

const getRequestMetric = (request: HelpRequestSummary) => {
  if (request.type === 'MATERIAL') {
    return `${formatMoney(request.amount_collected_kopeks)} / ${formatMoney(request.amount_requested_kopeks)}`
  }

  const volunteers = `${request.min_volunteers ?? '—'}-${request.max_volunteers ?? '—'} волонтёров`
  const distance = request.distance_km != null ? ` · ${formatDistanceKm(request.distance_km)}` : ''

  return `${volunteers}${distance}`
}

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
