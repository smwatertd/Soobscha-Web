import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { verificationsApi } from '../api/endpoints'
import { ActionPanel } from '../components/ActionPanel'
import { DetailSection } from '../components/DetailSection'
import { FieldGrid } from '../components/FieldGrid'
import { HumanDataCard } from '../components/HumanDataCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { useHelpRequestCategories } from '../hooks/useHelpRequestCategories'
import type { VerificationAttemptDetails } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { labelOrValue, ROLES } from '../utils/labels'

export const VerificationDetailsPage = () => {
  const { id } = useParams()
  const [attempt, setAttempt] = useState<VerificationAttemptDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const categoryLabels = useHelpRequestCategories()

  const load = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      setAttempt(await verificationsApi.get(id))
    } catch (verificationError) {
      setError(getErrorMessage(verificationError))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (isLoading) {
    return <StateBlock title="Загружаем верификацию..." />
  }

  if (error || !attempt || !id) {
    return <StateBlock title="Не удалось открыть верификацию" description={error} />
  }

  const fallbackActions = attempt.status === 'PENDING_MODERATION' ? ['approve', 'reject'] : []

  return (
    <>
      <PageHeader
        title={attempt.applicant_full_name || `Верификация ${truncateId(attempt.id)}`}
        description={`${labelOrValue(ROLES, attempt.user_role)} · пользователь ${truncateId(attempt.user_id)}`}
        actions={<Link to="/verifications" className="button secondary">К списку</Link>}
      />
      <div className="detail-layout">
        <div className="detail-layout__main">
          <DetailSection title="Основная информация">
            <FieldGrid
              fields={[
                { label: 'Статус', value: <StatusBadge status={attempt.status} /> },
                { label: 'Роль', value: labelOrValue(ROLES, attempt.user_role) },
                { label: 'Категория', value: labelOrValue(categoryLabels, attempt.category) },
                { label: 'Город', value: attempt.applicant_city ?? '—' },
                { label: 'Действительна до', value: formatDate(attempt.derived_valid_until) },
                { label: 'Создана', value: formatDate(attempt.created_at) },
                { label: 'Обновлена', value: formatDate(attempt.updated_at) },
              ]}
            />
          </DetailSection>
          <DetailSection title="Общие данные">
            <HumanDataCard value={attempt.common_data} emptyText="Общие данные не заполнены." />
          </DetailSection>
          <DetailSection title="Данные категории">
            <HumanDataCard value={attempt.category_data} emptyText="Данные категории не заполнены." />
          </DetailSection>
          <DetailSection title="Публичный снимок">
            <HumanDataCard value={attempt.public_snapshot_json} emptyText="Публичный снимок ещё не сформирован." />
          </DetailSection>
        </div>
        <aside className="detail-layout__aside">
          <DetailSection title="Действия">
            <ActionPanel
              fallbackActions={fallbackActions}
              onApprove={async () => {
                setAttempt(await verificationsApi.approve(id))
                await load()
              }}
              onReasonAction={async (action, reason) => {
                if (action === 'reject') {
                  setAttempt(await verificationsApi.reject(id, { reason }))
                }

                await load()
              }}
            />
          </DetailSection>
          <DetailSection title="Решения">
            <FieldGrid
              fields={[
                { label: 'Одобрена', value: formatDate(attempt.approved_at) },
                { label: 'Отклонена', value: formatDate(attempt.rejected_at) },
                { label: 'Отозвана', value: formatDate(attempt.revoked_at) },
                { label: 'Причина отклонения', value: attempt.rejection_reason ?? '—' },
                { label: 'Причина отзыва', value: attempt.revocation_reason ?? '—' },
              ]}
            />
          </DetailSection>
        </aside>
      </div>
    </>
  )
}
