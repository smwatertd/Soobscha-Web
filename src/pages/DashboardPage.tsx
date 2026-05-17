import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { partnersApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import type { PartnerDashboardResponse, PartnerDashboardSplitCounter, PartnerDashboardVerificationCounter } from '../types/api'
import { getErrorMessage } from '../utils/format'

const cards = [
  {
    title: 'Заявки',
    description: 'Очередь материальных и социальных заявок на модерации.',
    href: '/requests',
    queueKey: 'help_requests_pending_moderation',
    statLabel: 'ожидают решения',
  },
  {
    title: 'Отчёты',
    description: 'Проверка результатов помощи и возврат на доработку.',
    href: '/reports',
    queueKey: 'reports_pending_moderation',
    statLabel: 'на проверке',
  },
  {
    title: 'Верификации',
    description: 'Проверка данных пользователей и решений по документам.',
    href: '/verifications',
    queueKey: 'verifications_pending_moderation',
    statLabel: 'на модерации',
  },
] satisfies Array<{
  title: string
  description: string
  href: string
  queueKey:
    | 'help_requests_pending_moderation'
    | 'reports_pending_moderation'
    | 'verifications_pending_moderation'
  statLabel: string
}>

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<PartnerDashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    partnersApi
      .dashboard()
      .then(setDashboard)
      .catch((dashboardError: unknown) => setError(getErrorMessage(dashboardError)))
  }, [])

  return (
    <>
      <PageHeader
        title="Рабочий стол партнёра"
        description="Очереди, которые требуют проверки, и быстрые переходы к ключевым разделам."
      />
      {error ? <StateBlock title="Не удалось загрузить показатели" description={error} /> : null}
      <div className="dashboard-grid">
        {cards.map((card) => (
          <Link key={card.href} to={card.href} className="dashboard-card">
            <div className="dashboard-card__top">
              <h2>{card.title}</h2>
              <strong>{dashboard ? dashboard.queues[card.queueKey].total : '...'}</strong>
            </div>
            <p>{card.description}</p>
            {dashboard ? <QueueBreakdown value={dashboard.queues[card.queueKey]} /> : null}
            <small>{card.statLabel}</small>
            <span>Перейти к очереди</span>
          </Link>
        ))}
      </div>
      <section className="detail-section dashboard-section">
        <h2>Финансовая проверка</h2>
        <p className="muted">
          Отдельная очередь материальных отчётов, где нужно проверить подтверждённые расходы или возвраты.
        </p>
        <Link to="/reports?queue=settlement-review" className="settlement-card">
          <strong>{dashboard ? dashboard.queues.material_reports_awaiting_settlement_review : '...'}</strong>
          <span>материальных отчётов ожидают финансовой проверки</span>
        </Link>
      </section>
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
      <div className="queue-breakdown">
        <span>Материальные: {value.material}</span>
        <span>Социальные: {value.social}</span>
      </div>
    )
  }

  return (
    <div className="queue-breakdown">
      <span>Получатели: {value.beneficiaries}</span>
      <span>Волонтёры: {value.volunteers}</span>
    </div>
  )
}
