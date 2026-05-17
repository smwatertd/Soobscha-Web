import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { reportsApi } from '../api/endpoints'
import { ActionPanel } from '../components/ActionPanel'
import { DetailSection } from '../components/DetailSection'
import { FieldGrid } from '../components/FieldGrid'
import { HistoryList } from '../components/HistoryList'
import { HumanDataCard } from '../components/HumanDataCard'
import { MediaGrid } from '../components/MediaGrid'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import type { ReportDetails, ReportVersion } from '../types/api'
import { formatDate, formatMoney, getErrorMessage, truncateId } from '../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue, STATUSES } from '../utils/labels'

export const ReportDetailsPage = () => {
  const { id } = useParams()
  const [report, setReport] = useState<ReportDetails | null>(null)
  const [history, setHistory] = useState<ReportVersion[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const [reportResponse, historyResponse] = await Promise.all([
        reportsApi.get(id),
        reportsApi.history(id).catch(() => []),
      ])
      setReport(reportResponse)
      setHistory(historyResponse)
    } catch (reportError) {
      setError(getErrorMessage(reportError))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (isLoading) {
    return <StateBlock title="Загружаем отчёт..." />
  }

  if (error || !report || !id) {
    return <StateBlock title="Не удалось открыть отчёт" description={error} />
  }

  const fallbackActions = report.status === 'PENDING_MODERATION' ? ['approve', 'reject', 'return_to_rework'] : []

  return (
    <>
      <PageHeader
        title={`Отчёт ${truncateId(report.id)}`}
        description={`${labelOrValue(HELP_REQUEST_TYPES, report.help_request_type)} заявка ${truncateId(report.help_request_id)}`}
        actions={<Link to="/reports" className="button secondary">К списку</Link>}
      />
      <div className="detail-layout">
        <div className="detail-layout__main">
          <DetailSection title="Основная информация">
            <FieldGrid
              fields={[
                { label: 'Статус', value: <StatusBadge status={report.status} /> },
                { label: 'Тип заявки', value: labelOrValue(HELP_REQUEST_TYPES, report.help_request_type) },
                { label: 'Заявка', value: <Link to={`/requests/${report.help_request_id}`}>{truncateId(report.help_request_id)}</Link> },
                { label: 'Расчёты', value: labelOrValue(STATUSES, report.settlement_status) },
                { label: 'Подтверждено расходов', value: formatMoney(report.spent_confirmed_kopeks) },
                { label: 'Создан', value: formatDate(report.created_at) },
                { label: 'Обновлён', value: formatDate(report.updated_at) },
              ]}
            />
          </DetailSection>
          <DetailSection title="Данные отчёта">
            <HumanDataCard value={report.payload} emptyText="Автор отчёта не передал дополнительные данные." />
          </DetailSection>
          <DetailSection title="Медиа">
            <MediaGrid files={report.media_files} />
          </DetailSection>
          <DetailSection title="История">
            <HistoryList items={history} />
          </DetailSection>
        </div>
        <aside className="detail-layout__aside">
          <DetailSection title="Действия">
            <ActionPanel
              actions={report.available_actions}
              fallbackActions={fallbackActions}
              onApprove={async () => {
                setReport(await reportsApi.approve(id))
                await load()
              }}
              onReasonAction={async (action, reason) => {
                if (action === 'reject') {
                  setReport(await reportsApi.reject(id, { reason }))
                }

                if (action === 'return_to_rework' || action === 'return-to-rework') {
                  setReport(await reportsApi.returnToRework(id, { reason }))
                }

                await load()
              }}
            />
          </DetailSection>
          <DetailSection title="Причины решений">
            <FieldGrid
              fields={[
                { label: 'Отклонение', value: report.rejection_reason ?? '—' },
                { label: 'Возврат', value: report.return_reason ?? '—' },
                { label: 'Одобрен', value: formatDate(report.approved_at) },
                { label: 'Отклонён', value: formatDate(report.rejected_at) },
                { label: 'Возвращён', value: formatDate(report.returned_at) },
              ]}
            />
          </DetailSection>
        </aside>
      </div>
    </>
  )
}
