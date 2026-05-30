import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { adminsApi, userTrustApi } from '../../api/endpoints'
import { DetailSection } from '../../components/DetailSection'
import { FieldGrid } from '../../components/FieldGrid'
import { PageHeader } from '../../components/PageHeader'
import { StateBlock } from '../../components/StateBlock'
import { StatusBadge } from '../../components/StatusBadge'
import { useRealtimeRefresh } from '../../hooks/useRealtimeRefresh'
import type { AdminUserCard, AdminUserComplaintSummary, TrustEvent } from '../../types/api'
import { formatDate, getErrorMessage, truncateId } from '../../utils/format'
import { humanizeKey } from '../../utils/humanize'
import { labelOrValue, ROLES, SANCTION_LEVELS, ENUM_LABELS } from '../../utils/labels'

export const AdminUserDetailsPage = () => {
  const { id } = useParams()
  const [user, setUser] = useState<AdminUserCard | null>(null)
  const [trustEvents, setTrustEvents] = useState<TrustEvent[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false)
  const [trustForm] = Form.useForm<{ severity: number; reason: string }>()

  const load = useCallback(
    async (silent = false) => {
      if (!id) {
        return
      }

      if (!silent) {
        setIsLoading(true)
      }

      setError('')

      try {
        const [card, trust] = await Promise.all([
          adminsApi.getUserCard(id),
          userTrustApi.getWithEvents(id, { events_limit: 50 }),
        ])
        setUser(card)
        setTrustEvents(trust.events)
      } catch (requestError: unknown) {
        setError(getErrorMessage(requestError))
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [id],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useRealtimeRefresh(() => load(true), [load])

  if (isLoading) {
    return <StateBlock title="Загружаем карточку пользователя..." />
  }

  if (error || !user || !id) {
    return <StateBlock title="Не удалось открыть пользователя" description={error} />
  }

  const fullName = [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(' ') || truncateId(user.user_id)

  const deactivate = async () => {
    setIsUpdating(true)

    try {
      await adminsApi.deactivateUser(id)
      await load(true)
    } finally {
      setIsUpdating(false)
    }
  }

  const pardonTrust = async () => {
    setIsUpdating(true)

    try {
      await userTrustApi.pardon(id)
      await load(true)
    } finally {
      setIsUpdating(false)
    }
  }

  const recordTrustEvent = async () => {
    const values = await trustForm.validateFields()
    setIsUpdating(true)

    try {
      await userTrustApi.recordManualEvent(id, values)
      setIsTrustModalOpen(false)
      trustForm.resetFields()
      await load(true)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <PageHeader
        icon={<TeamOutlined />}
        title={fullName}
        description={`${labelOrValue(ROLES, user.role)} · ${truncateId(user.user_id)}`}
        actions={
          <Link to="/admin/users">
            <Button>К поиску</Button>
          </Link>
        }
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<InfoCircleOutlined />} label="Основная информация" />}>
              <FieldGrid
                fields={[
                  { label: 'Роль', value: labelOrValue(ROLES, user.role) },
                  {
                    label: 'Статус',
                    value: user.is_active ? <Tag color="green">Активен</Tag> : <Tag color="red">Деактивирован</Tag>,
                  },
                  { label: 'Телефон', value: user.phone ?? '—' },
                  { label: 'Email', value: user.email ?? '—' },
                  { label: 'Верификация', value: user.verification_status ? <StatusBadge status={user.verification_status} /> : '—' },
                  { label: 'Создан / удалён', value: user.deleted_at ? formatDate(user.deleted_at) : '—' },
                ]}
              />
            </DetailSection>
            <DetailSection title={<SectionTitle icon={<SafetyCertificateOutlined />} label="Доверие и санкции" />}>
              <FieldGrid
                fields={[
                  {
                    label: 'Уровень санкции',
                    value: labelOrValue(SANCTION_LEVELS, user.trust_status.sanction_level),
                  },
                  { label: 'Сумма severity', value: user.trust_status.active_severity_sum },
                  { label: 'Действует до', value: formatDate(user.trust_status.sanction_until) },
                  { label: 'Порог предупреждения', value: user.trust_status.warning_threshold },
                  { label: 'Порог ограничения', value: user.trust_status.restrict_threshold },
                  { label: 'Порог блокировки', value: user.trust_status.block_threshold },
                ]}
              />
              {trustEvents.length ? (
                <Table
                  rowKey="id"
                  dataSource={trustEvents}
                  columns={trustEventColumns}
                  pagination={false}
                  style={{ marginTop: 16 }}
                />
              ) : (
                <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                  Событий доверия пока нет.
                </Typography.Text>
              )}
            </DetailSection>
            {user.help_request_counts ? (
              <DetailSection title={<SectionTitle icon={<FileTextOutlined />} label="Заявки" />}>
                <FieldGrid
                  fields={[
                    { label: 'Материальные активные', value: user.help_request_counts.material_active },
                    { label: 'Материальные завершённые', value: user.help_request_counts.material_completed },
                    { label: 'Социальные активные', value: user.help_request_counts.social_active },
                    { label: 'Социальные завершённые', value: user.help_request_counts.social_completed },
                  ]}
                />
              </DetailSection>
            ) : null}
            <DetailSection title={<SectionTitle icon={<ExclamationCircleOutlined />} label="Жалобы пользователя" />}>
              {user.complaints.length ? (
                <Table rowKey="id" dataSource={user.complaints} columns={complaintColumns} pagination={false} />
              ) : (
                <Typography.Text type="secondary">Жалоб нет.</Typography.Text>
              )}
            </DetailSection>
          </Space>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <DetailSection title={<SectionTitle icon={<ThunderboltOutlined />} label="Действия" />}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {user.is_active ? (
                  <Popconfirm
                    title="Деактивировать пользователя?"
                    description="Пользователь потеряет доступ к платформе."
                    okText="Деактивировать"
                    cancelText="Отмена"
                    onConfirm={() => void deactivate()}
                  >
                    <Button danger block loading={isUpdating}>
                      Деактивировать
                    </Button>
                  </Popconfirm>
                ) : (
                  <Typography.Text type="secondary">Пользователь уже деактивирован.</Typography.Text>
                )}
                <Popconfirm
                  title="Снять санкции доверия?"
                  description="Будет выполнено помилование trust-статуса."
                  okText="Помиловать"
                  cancelText="Отмена"
                  onConfirm={() => void pardonTrust()}
                >
                  <Button block loading={isUpdating}>
                    Помиловать trust
                  </Button>
                </Popconfirm>
                <Button block loading={isUpdating} onClick={() => setIsTrustModalOpen(true)}>
                  Зафиксировать событие
                </Button>
              </Space>
            </DetailSection>
          </Space>
        </Col>
      </Row>
      <Modal
        title="Ручное событие доверия"
        open={isTrustModalOpen}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={isUpdating}
        onOk={() => void recordTrustEvent()}
        onCancel={() => setIsTrustModalOpen(false)}
      >
        <Form form={trustForm} layout="vertical">
          <Form.Item
            name="severity"
            label="Severity"
            rules={[{ required: true, message: 'Укажите severity' }, { type: 'number', min: 1, message: 'Минимум 1' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Причина" rules={[{ required: true, message: 'Укажите причину' }]}>
            <Input.TextArea rows={3} maxLength={255} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const trustEventColumns: TableColumnsType<TrustEvent> = [
  {
    title: 'Тип',
    dataIndex: 'kind',
    render: (value: string) => ENUM_LABELS[value] ?? humanizeKey(value),
  },
  {
    title: 'Severity',
    dataIndex: 'severity',
  },
  {
    title: 'Создано',
    dataIndex: 'created_at',
    render: (value: string) => formatDate(value),
  },
  {
    title: 'Истекает',
    dataIndex: 'expires_at',
    render: (value: string) => formatDate(value),
  },
  {
    title: 'Ссылка',
    render: (_, event) =>
      event.reference_type && event.reference_id ? `${event.reference_type}: ${truncateId(event.reference_id)}` : '—',
  },
]

const complaintColumns: TableColumnsType<AdminUserComplaintSummary> = [
  {
    title: 'Причина',
    dataIndex: 'reason',
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (value: string) => <StatusBadge status={value} />,
  },
  {
    title: 'Заявка',
    dataIndex: 'help_request_id',
    render: (value: string) => truncateId(value),
  },
  {
    title: 'Создана',
    dataIndex: 'created_at',
    render: (value: string) => formatDate(value),
  },
]

const SectionTitle = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <Space size={8}>
    <span className="section-title-icon">{icon}</span>
    {label}
  </Space>
)
