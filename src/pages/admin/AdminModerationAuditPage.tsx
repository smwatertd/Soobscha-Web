import { useCallback, useEffect, useState } from 'react'
import { AuditOutlined, CalendarOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { adminsApi } from '../../api/endpoints'
import { PageHeader } from '../../components/PageHeader'
import { Pagination } from '../../components/Pagination'
import { StateBlock } from '../../components/StateBlock'
import { StatusBadge } from '../../components/StatusBadge'
import type { ModerationAuditEntry } from '../../types/api'
import { formatDate, getErrorMessage, truncateId } from '../../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue } from '../../utils/labels'

const PAGE_SIZE = 50

export const AdminModerationAuditPage = () => {
  const [page, setPage] = useState(1)
  const [helpRequestId, setHelpRequestId] = useState('')
  const [changedByUserId, setChangedByUserId] = useState('')
  const [changedFrom, setChangedFrom] = useState<string | null>(null)
  const [changedTo, setChangedTo] = useState<string | null>(null)
  const [items, setItems] = useState<ModerationAuditEntry[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const response = await adminsApi.moderationAudit({
          help_request_id: helpRequestId.trim() || undefined,
          changed_by_user_id: changedByUserId.trim() || undefined,
          changed_from: changedFrom ?? undefined,
          changed_to: changedTo ?? undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
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
    [changedByUserId, changedFrom, changedTo, helpRequestId, page],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  const resetFilters = () => {
    setPage(1)
    setHelpRequestId('')
    setChangedByUserId('')
    setChangedFrom(null)
    setChangedTo(null)
  }

  return (
    <>
      <PageHeader
        icon={<AuditOutlined />}
        title="Аудит модерации"
        description="Журнал изменений статусов заявок: кто, когда и на какой статус перевёл заявку."
      />
      <Space wrap style={{ marginBottom: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">ID заявки</Typography.Text>
          <Input
            style={{ width: 260 }}
            placeholder="UUID заявки"
            value={helpRequestId}
            onChange={(event) => {
              setPage(1)
              setHelpRequestId(event.target.value)
            }}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Кем изменено</Typography.Text>
          <Input
            style={{ width: 260 }}
            placeholder="UUID пользователя"
            value={changedByUserId}
            onChange={(event) => {
              setPage(1)
              setChangedByUserId(event.target.value)
            }}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">С даты</Typography.Text>
          <DatePicker
            showTime
            style={{ width: 220 }}
            value={changedFrom ? dayjs(changedFrom) : null}
            onChange={(value) => {
              setPage(1)
              setChangedFrom(value ? value.toISOString() : null)
            }}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">По дату</Typography.Text>
          <DatePicker
            showTime
            style={{ width: 220 }}
            value={changedTo ? dayjs(changedTo) : null}
            onChange={(value) => {
              setPage(1)
              setChangedTo(value ? value.toISOString() : null)
            }}
          />
        </Space>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">&nbsp;</Typography.Text>
          <Button onClick={resetFilters}>Сбросить</Button>
        </Space>
      </Space>
      {isLoading ? <StateBlock title="Загружаем журнал..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error ? (
        <>
          <Table rowKey="id" dataSource={items} columns={columns} pagination={false} />
          <Pagination
            page={page}
            hasMore={items.length === PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </>
  )
}

const columns: TableColumnsType<ModerationAuditEntry> = [
  {
    title: 'Заявка',
    dataIndex: 'help_request_id',
    render: (value: string, entry) => (
      <Space direction="vertical" size={0}>
        <Typography.Text>
          <FileTextOutlined /> {truncateId(value)}
        </Typography.Text>
        <Typography.Text type="secondary">{labelOrValue(HELP_REQUEST_TYPES, entry.help_request_type)}</Typography.Text>
      </Space>
    ),
  },
  {
    title: 'Переход',
    render: (_, entry) => (
      <Space size={8} wrap>
        {entry.from_status ? <StatusBadge status={entry.from_status} /> : <Typography.Text type="secondary">—</Typography.Text>}
        <Typography.Text type="secondary">→</Typography.Text>
        <StatusBadge status={entry.to_status} />
      </Space>
    ),
  },
  {
    title: 'Кем',
    dataIndex: 'changed_by_user_id',
    render: (value: string | null) =>
      value ? (
        <Link to={`/admin/users/${value}`}>
          <UserOutlined /> {truncateId(value)}
        </Link>
      ) : (
        '—'
      ),
  },
  {
    title: 'Когда',
    dataIndex: 'changed_at',
    render: (value: string) => (
      <Space>
        <CalendarOutlined />
        {formatDate(value)}
      </Space>
    ),
  },
]
