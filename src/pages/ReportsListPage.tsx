import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { reportsApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import type { PaginatedResponse, ReportSummary } from '../types/api'
import { formatDate, getErrorMessage, truncateId } from '../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue, STATUSES } from '../utils/labels'

const PAGE_SIZE = 20

export const ReportsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [queue, setQueue] = useState(searchParams.get('queue') === 'settlement-review' ? 'settlement-review' : 'moderation')
  const [status, setStatus] = useState(queue === 'moderation' ? 'PENDING_MODERATION' : '')
  const [data, setData] = useState<PaginatedResponse<ReportSummary> | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setError('')

    reportsApi
      .list({
        page,
        'page-size': PAGE_SIZE,
        'order-by': 'created_at',
        'order-desc': true,
        statuses: queue === 'moderation' ? status : undefined,
        'help-request-type': queue === 'settlement-review' ? 'MATERIAL' : undefined,
        'awaiting-material-settlement-review': queue === 'settlement-review' ? true : undefined,
      })
      .then(setData)
      .catch((reportError: unknown) => setError(getErrorMessage(reportError)))
      .finally(() => setIsLoading(false))
  }, [page, queue, status])

  return (
    <>
      <PageHeader title="Отчёты" description="Проверка отчётов по материальной и социальной помощи." />
      <div className="filters">
        <label>
          Очередь
          <select
            value={queue}
            onChange={(event) => {
              const nextQueue = event.target.value
              setPage(1)
              setQueue(nextQueue)
              setStatus(nextQueue === 'moderation' ? 'PENDING_MODERATION' : '')
              setSearchParams(nextQueue === 'settlement-review' ? { queue: 'settlement-review' } : {})
            }}
          >
            <option value="moderation">Модерация отчётов</option>
            <option value="settlement-review">Финансовая проверка материальных отчётов</option>
          </select>
        </label>
        <label>
          Статус
          <select
            value={status}
            disabled={queue !== 'moderation'}
            onChange={(event) => {
              setPage(1)
              setStatus(event.target.value)
            }}
          >
            <option value="">Все</option>
            <option value="PENDING_MODERATION">На модерации</option>
            <option value="RETURNED_TO_REWORK">На доработке</option>
            <option value="APPROVED">Одобрены</option>
            <option value="REJECTED">Отклонены</option>
          </select>
        </label>
      </div>
      {isLoading ? <StateBlock title="Загружаем отчёты..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !data?.items.length ? <StateBlock title="Отчётов не найдено" /> : null}
      {data?.items.length ? (
        <>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Отчёт</th>
                  <th>Заявка</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Расчёты</th>
                  <th>Создан</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <Link to={`/reports/${report.id}`} className="table-link">
                        {truncateId(report.id)}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/requests/${report.help_request_id}`}>{truncateId(report.help_request_id)}</Link>
                    </td>
                    <td>{labelOrValue(HELP_REQUEST_TYPES, report.help_request_type)}</td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>{labelOrValue(STATUSES, report.settlement_status)}</td>
                    <td>{formatDate(report.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalCount={data.total_count} hasMore={data.has_more} onPageChange={setPage} />
        </>
      ) : null}
    </>
  )
}
