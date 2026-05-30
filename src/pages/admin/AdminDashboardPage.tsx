import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  DollarOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { adminsApi } from '../../api/endpoints'
import { PageHeader } from '../../components/PageHeader'
import { StateBlock } from '../../components/StateBlock'
import type { AdminDashboardResponse } from '../../types/api'
import { formatMoney, getErrorMessage } from '../../utils/format'

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setStats(await adminsApi.dashboard())
      setError('')
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <>
        <PageHeader
          icon={<UserOutlined />}
          title="Сводка по платформе"
          description="Ключевые показатели активности пользователей, сотрудников и финансов платформы."
        />
        <StateBlock title="Не удалось загрузить сводку" description={error} />
      </>
    )
  }

  if (!stats) {
    return <StateBlock title="Загружаем сводку..." />
  }

  const usersUnderSanctions = stats.users_restricted + stats.users_blocked

  const statCards = [
    {
      key: 'users-active',
      title: 'Активные пользователи',
      value: stats.users_active,
      hint: 'без ограничений и блокировок',
      accent: 'blue' as const,
      icon: <TeamOutlined />,
      href: '/admin/users',
    },
    {
      key: 'users-sanctions',
      title: 'Под санкциями',
      value: usersUnderSanctions,
      hint: `${stats.users_restricted} ограничены · ${stats.users_blocked} заблокированы`,
      accent: 'violet' as const,
      icon: <WarningOutlined />,
      href: '/admin/users',
    },
    {
      key: 'staff',
      title: 'Сотрудники',
      value: stats.staff_admins_active + stats.staff_partners_active,
      hint: `${stats.staff_admins_active} админов · ${stats.staff_partners_active} партнёров`,
      accent: 'green' as const,
      icon: <UserOutlined />,
      href: '/admin/staff',
    },
    {
      key: 'fund',
      title: 'Фонд платформы',
      value: formatMoney(stats.platform_fund_balance_kopeks),
      hint: 'текущий баланс',
      accent: 'amber' as const,
      icon: <DollarOutlined />,
      isMoney: true,
    },
  ]

  return (
    <>
      <PageHeader
        icon={<UserOutlined />}
        title="Сводка по платформе"
        description="Ключевые показатели активности пользователей, сотрудников и финансов платформы."
      />
      <Row gutter={[16, 16]} className="admin-stats-row">
        {statCards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.key}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} className="admin-stats-row admin-stats-row--secondary">
        <Col xs={24} md={12}>
          <Card title="Пользователи" className="dashboard-section admin-panel-card">
            <div className="admin-queue-list">
              <MetricRow label="Активные" value={stats.users_active} icon={<TeamOutlined />} />
              <MetricRow label="Ограничены" value={stats.users_restricted} icon={<WarningOutlined />} />
              <MetricRow label="Заблокированы" value={stats.users_blocked} icon={<StopOutlined />} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Организация" className="dashboard-section admin-panel-card">
            <div className="admin-org-block">
              <div className="admin-org-block__metric">
                <Typography.Text type="secondary">Активных партнёров</Typography.Text>
                <Typography.Title level={2} className="admin-org-block__value">
                  {stats.staff_partners_active}
                </Typography.Title>
              </div>
              <Typography.Paragraph type="secondary" className="admin-org-block__text">
                Административный интерфейс предназначен для контроля пользователей, управления сотрудниками и анализа
                показателей платформы «Сообща».
              </Typography.Paragraph>
              <Link className="admin-org-block__link" to="/admin/users">
                Перейти к поиску пользователей →
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

type StatCardConfig = {
  title: string
  value: number | string
  hint: string
  accent: 'blue' | 'violet' | 'green' | 'amber'
  icon: ReactNode
  href?: string
  isMoney?: boolean
}

const StatCard = ({ title, value, hint, accent, icon, href, isMoney }: StatCardConfig) => {
  const card = (
    <Card hoverable={Boolean(href)} className={`dashboard-card admin-stat-card admin-stat-card--${accent}`}>
      <div className="admin-stat-card__header">
        <span className="admin-stat-card__icon">{icon}</span>
        <Typography.Text className="admin-stat-card__label">{title}</Typography.Text>
      </div>
      <div className="admin-stat-card__body">
        <div className={`admin-stat-card__value${isMoney ? ' admin-stat-card__value--money' : ''}`}>{value}</div>
        <Typography.Text className="admin-stat-card__hint">{hint}</Typography.Text>
      </div>
    </Card>
  )

  if (!href) {
    return card
  }

  return (
    <Link className="admin-stat-card-link" to={href}>
      {card}
    </Link>
  )
}

const MetricRow = ({ label, value, icon }: { label: string; value: number; icon: ReactNode }) => (
  <div className="admin-queue-row">
    <span className="admin-queue-row__label">
      <span className="admin-queue-row__icon">{icon}</span>
      {label}
    </span>
    <span className="admin-queue-row__value">{value}</span>
  </div>
)
