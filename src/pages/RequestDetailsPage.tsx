import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { helpRequestsApi } from '../api/endpoints'
import { ActionPanel } from '../components/ActionPanel'
import { DetailSection } from '../components/DetailSection'
import { FieldGrid } from '../components/FieldGrid'
import { HistoryList } from '../components/HistoryList'
import { HumanDataCard } from '../components/HumanDataCard'
import { MediaGrid } from '../components/MediaGrid'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { useHelpRequestCategories } from '../hooks/useHelpRequestCategories'
import { useVolunteerSkillCatalog } from '../hooks/useVolunteerSkillCatalog'
import type { CodeLabel, HelpRequestDetails, HelpRequestReasonCodesResponse, HelpRequestVersion } from '../types/api'
import { formatDate, formatMoney, getErrorMessage, truncateId } from '../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue } from '../utils/labels'

export const RequestDetailsPage = () => {
  const { id } = useParams()
  const [request, setRequest] = useState<HelpRequestDetails | null>(null)
  const [history, setHistory] = useState<HelpRequestVersion[]>([])
  const [reasonCodes, setReasonCodes] = useState<HelpRequestReasonCodesResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const categoryLabels = useHelpRequestCategories()
  const skillLabels = useVolunteerSkillCatalog()

  const load = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const [requestResponse, historyResponse] = await Promise.all([
        helpRequestsApi.get(id),
        helpRequestsApi.history(id).catch(() => []),
      ])
      setRequest(requestResponse)
      setHistory(historyResponse)
      helpRequestsApi.reasonCodes().then(setReasonCodes).catch(() => setReasonCodes(null))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (isLoading) {
    return <StateBlock title="Загружаем заявку..." />
  }

  if (error || !request || !id) {
    return <StateBlock title="Не удалось открыть заявку" description={error} />
  }

  const fallbackActions = request.status === 'PENDING_MODERATION' ? ['approve', 'reject', 'return_to_rework'] : []
  const typedReasonCodes = getReasonCodesForType(request.type, reasonCodes)

  return (
    <>
      <PageHeader
        title={request.title}
        description={`Заявка ${truncateId(request.id)} · ${labelOrValue(HELP_REQUEST_TYPES, request.type)}`}
        actions={<Link to="/requests" className="button secondary">К списку</Link>}
      />
      <div className="detail-layout">
        <div className="detail-layout__main">
          <DetailSection title="Основная информация">
            <FieldGrid
              fields={[
                { label: 'Статус', value: <StatusBadge status={request.status} /> },
                { label: 'Тип', value: labelOrValue(HELP_REQUEST_TYPES, request.type) },
                { label: 'Категория', value: labelOrValue(categoryLabels, request.category) },
                  { label: 'ID получателя', value: truncateId(request.beneficiary_user_id) },
                { label: 'Создана', value: formatDate(request.created_at) },
                { label: 'Обновлена', value: formatDate(request.updated_at) },
              ]}
            />
            <p className="detail-description">{request.description}</p>
          </DetailSection>
          <DetailSection title={request.type === 'MATERIAL' ? 'Финансы' : 'Параметры работ'}>
            {request.type === 'MATERIAL' ? (
              <div className="stack">
                <div className="metric-grid">
                  <div className="metric-card">
                    <span>Запрошено</span>
                    <strong>{formatMoney(request.amount_requested_kopeks)}</strong>
                  </div>
                  <div className="metric-card">
                    <span>Собрано</span>
                    <strong>{formatMoney(request.amount_collected_kopeks)}</strong>
                  </div>
                </div>
                <div>
                  <h3 className="subsection-title">Финансовое состояние</h3>
                  <HumanDataCard value={request.financials} />
                </div>
                <div>
                  <h3 className="subsection-title">Пожертвования</h3>
                  <HumanDataCard value={request.donations} />
                </div>
              </div>
            ) : (
              <FieldGrid
                fields={[
                  { label: 'Волонтёры', value: `${request.min_volunteers ?? '—'}-${request.max_volunteers ?? '—'}` },
                  { label: 'Начало', value: formatDate(request.start_at) },
                  { label: 'Длительность', value: request.duration_minutes ? `${request.duration_minutes} мин.` : '—' },
                  { label: 'Адрес', value: request.address_text ?? request.place_name ?? '—' },
                  { label: 'Обязательные навыки', value: formatCodes(request.required_skills, skillLabels) },
                  { label: 'Желательные навыки', value: formatCodes(request.preferred_skills, skillLabels) },
                ]}
              />
            )}
          </DetailSection>
          <DetailSection title="Медиа">
            <MediaGrid files={request.media_files} />
          </DetailSection>
          <DetailSection title="История">
            <HistoryList items={history} />
          </DetailSection>
        </div>
        <aside className="detail-layout__aside">
          <DetailSection title="Действия">
            <ActionPanel
              actions={request.available_actions}
              fallbackActions={fallbackActions}
              reasonCodeOptions={{
                cancel: typedReasonCodes?.cancellation,
                interrupt: typedReasonCodes?.interruption,
              }}
              onApprove={async () => {
                setRequest(await helpRequestsApi.approve(id))
                await load()
              }}
              onReasonAction={async (action, reason, code) => {
                if (action === 'reject') {
                  setRequest(await helpRequestsApi.reject(id, { reason }))
                }

                if (action === 'return_to_rework' || action === 'return-to-rework') {
                  setRequest(await helpRequestsApi.returnToRework(id, { reason }))
                }

                if (action === 'cancel') {
                  setRequest(await helpRequestsApi.cancel(id, { reason, code }))
                }

                if (action === 'interrupt') {
                  setRequest(await helpRequestsApi.interrupt(id, { reason, code }))
                }

                await load()
              }}
            />
          </DetailSection>
          <DetailSection title="Причины решений">
            <FieldGrid
              fields={[
                { label: 'Отклонение', value: request.rejection_reason ?? '—' },
                { label: 'Возврат', value: request.return_reason ?? '—' },
                { label: 'Отмена', value: request.cancellation_reason ?? '—' },
                { label: 'Прерывание', value: request.interruption_reason ?? '—' },
              ]}
            />
          </DetailSection>
        </aside>
      </div>
    </>
  )
}

const getReasonCodesForType = (type: string, reasonCodes: HelpRequestReasonCodesResponse | null) => {
  if (!reasonCodes) {
    return undefined
  }

  const codes = type === 'MATERIAL' ? reasonCodes.material : reasonCodes.social

  return {
    cancellation: withPartnerFallback(codes.cancellation),
    interruption: withPartnerFallback(codes.interruption),
  }
}

const withPartnerFallback = (codes: CodeLabel[]) =>
  codes.length ? codes : [{ code: 'PARTNER_MANUAL', label: 'Решение партнёра' }]

const formatCodes = (codes: string[] | undefined, labels: Record<string, string>) =>
  codes?.length ? codes.map((code) => labels[code] ?? code).join(', ') : '—'
