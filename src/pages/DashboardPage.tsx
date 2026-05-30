import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckSquareOutlined, DollarCircleOutlined, ExclamationCircleOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { partnersApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import type { PartnerDashboardResponse, PartnerDashboardSplitCounter, PartnerDashboardVerificationCounter } from '../types/api'
import { getErrorMessage } from '../utils/format'

const cards = [
  {
    title: 'Заявки',
    description: 'Очередь материальных и социальных заявок на модерации.',
    href: '/requests',
    accent: 'blue',
    icon: <CheckSquareOutlined />,
    queueKey: 'help_requests_pending_moderation',
    statLabel: 'ожидают решения',
  },
  {
    title: 'Отчёты',
    description: 'Проверка результатов помощи и возврат на доработку.',
    href: '/reports',
    accent: 'violet',
    icon: <FileTextOutlined />,
    queueKey: 'reports_pending_moderation',
    statLabel: 'на проверке',
  },
  {
    title: 'Верификации',
    description: 'Проверка данных пользователей и решений по документам.',
    href: '/verifications',
    accent: 'green',
    icon: <SafetyCertificateOutlined />,
    queueKey: 'verifications_pending_moderation',
    statLabel: 'на модерации',
  },
  {
    title: 'Жалобы',
    description: 'Рассмотрение жалоб на участников социальных заявок.',
    href: '/complaints',
    accent: 'amber',
    icon: <ExclamationCircleOutlined />,
    queueKey: 'complaints_open',
    statLabel: 'открытых',
  },
] satisfies Array<{
  title: string
  description: string
  href: string
  accent: 'blue' | 'violet' | 'green' | 'amber'
  icon: ReactNode
  queueKey:
    | 'help_requests_pending_moderation'
    | 'reports_pending_moderation'
    | 'verifications_pending_moderation'
    | 'complaints_open'
  statLabel: string
}>

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<PartnerDashboardResponse | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const response = await partnersApi.dashboard()
      setDashboard(response)
      setError('')
    } catch (dashboardError: unknown) {
      setError(getErrorMessage(dashboardError))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useRealtimeRefresh(load, [load])

  return (
    <>
      <PageHeader
        title="Рабочий стол партнёра"
        description="Очереди, которые требуют проверки, и быстрые переходы к ключевым разделам."
      />
      {error ? <StateBlock title="Не удалось загрузить показатели" description={error} /> : null}
      <Row gutter={[20, 20]}>
        {cards.map((card) => (
          <Col xs={24} md={12} xl={8} key={card.href}>
            <Link to={card.href}>
              <Card hoverable className={`dashboard-card dashboard-card--${card.accent}`}>
                <Space align="center" className="dashboard-card__heading">
                  <span className="dashboard-card__icon">{card.icon}</span>
                  <Typography.Text className="dashboard-card__label">{card.title}</Typography.Text>
                </Space>
                <Statistic
                  value={
                    dashboard
                      ? card.queueKey === 'complaints_open'
                        ? dashboard.queues.complaints_open
                        : dashboard.queues[card.queueKey].total
                      : undefined
                  }
                />
                <Typography.Paragraph className="dashboard-card__description">{card.description}</Typography.Paragraph>
                {dashboard && card.queueKey !== 'complaints_open' ? (
                  <QueueBreakdown value={dashboard.queues[card.queueKey]} />
                ) : null}
                <Typography.Text className="dashboard-card__footer">{card.statLabel}</Typography.Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
      <Card
        title={
          <Space align="center">
            <span className="section-title-icon">
              <DollarCircleOutlined />
            </span>
            Финансовая проверка
          </Space>
        }
        className="dashboard-section"
      >
        <Typography.Paragraph type="secondary">
          Отдельная очередь материальных отчётов, где нужно проверить подтверждённые расходы или возвраты.
        </Typography.Paragraph>
        <Link to="/reports?queue=settlement-review">
          <Card size="small" hoverable className="settlement-card">
            <Statistic
              value={dashboard ? dashboard.queues.material_reports_awaiting_settlement_review : undefined}
              suffix="отчётов"
            />
            <Typography.Text type="secondary">ожидают финансовой проверки</Typography.Text>
          </Card>
        </Link>
      </Card>
    </>
  )
}

const QueueBreakdown = ({
  value,
}: {
  value: PartnerDashboardSplitCounter | PartnerDashboardVerificationCounter
}) => {
  if ('material' in value) {
    return (
      <Space wrap className="dashboard-card__breakdown">
        <Typography.Text>Материальные: {value.material}</Typography.Text>
        <Typography.Text>Социальные: {value.social}</Typography.Text>
      </Space>
    )
  }

  return (
    <Space wrap className="dashboard-card__breakdown">
      <Typography.Text>Бенефициары: {value.beneficiaries}</Typography.Text>
      <Typography.Text>Волонтёры: {value.volunteers}</Typography.Text>
    </Space>
  )
}
