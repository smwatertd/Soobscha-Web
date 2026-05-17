import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { verificationsApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { useHelpRequestCategories } from '../hooks/useHelpRequestCategories'
import type { VerificationAttemptSummary } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { labelOrValue, ROLES } from '../utils/labels'

export const VerificationsListPage = () => {
  const [status, setStatus] = useState('PENDING_MODERATION')
  const [role, setRole] = useState('')
  const [items, setItems] = useState<VerificationAttemptSummary[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const categoryLabels = useHelpRequestCategories()

  useEffect(() => {
    setIsLoading(true)
    setError('')

    verificationsApi
      .list({ status, user_role: role })
      .then(setItems)
      .catch((verificationError: unknown) => setError(getErrorMessage(verificationError)))
      .finally(() => setIsLoading(false))
  }, [role, status])

  return (
    <>
      <PageHeader
        title="Верификации"
        description="Очередь попыток верификации пользователей с данными заявителя и результатами проверки."
      />
      <div className="filters">
        <label>
          Статус
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Все</option>
            <option value="PENDING_MODERATION">На модерации</option>
            <option value="APPROVED">Одобрены</option>
            <option value="REJECTED">Отклонены</option>
            <option value="REVOKED">Отозваны</option>
          </select>
        </label>
        <label>
          Роль
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">Все</option>
            <option value="BENEFICIARY">Получатель</option>
            <option value="VOLUNTEER">Волонтёр</option>
          </select>
        </label>
      </div>
      {isLoading ? <StateBlock title="Загружаем верификации..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !items.length ? <StateBlock title="Верификаций не найдено" /> : null}
      {items.length ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Заявитель</th>
                <th>Роль</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Город</th>
                <th>Создана</th>
              </tr>
            </thead>
            <tbody>
              {items.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    <Link to={`/verifications/${attempt.id}`} className="table-link">
                      {attempt.applicant_full_name || truncateId(attempt.user_id)}
                    </Link>
                    <small>{truncateId(attempt.id)}</small>
                  </td>
                  <td>{labelOrValue(ROLES, attempt.user_role)}</td>
                  <td>{labelOrValue(categoryLabels, attempt.category)}</td>
                  <td>
                    <StatusBadge status={attempt.status} />
                  </td>
                  <td>{attempt.applicant_city ?? '—'}</td>
                  <td>{formatDate(attempt.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  )
}
