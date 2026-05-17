import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { helpRequestsApi } from '../api/endpoints'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { StateBlock } from '../components/StateBlock'
import { StatusBadge } from '../components/StatusBadge'
import { useHelpRequestCategories } from '../hooks/useHelpRequestCategories'
import type { HelpRequestSummary, PaginatedResponse } from '../types/api'
import { formatDate, formatMoney, getErrorMessage } from '../utils/format'
import { HELP_REQUEST_TYPES, labelOrValue } from '../utils/labels'

const PAGE_SIZE = 20

export const RequestsListPage = () => {
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('PENDING_MODERATION')
  const [data, setData] = useState<PaginatedResponse<HelpRequestSummary> | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const categoryLabels = useHelpRequestCategories()

  useEffect(() => {
    setIsLoading(true)
    setError('')

    helpRequestsApi
      .list({
        page,
        'page-size': PAGE_SIZE,
        'order-by': 'created_at',
        'order-desc': true,
        type,
        statuses: status,
      })
      .then(setData)
      .catch((requestError: unknown) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoading(false))
  }, [page, status, type])

  return (
    <>
      <PageHeader
        title="Заявки"
        description="Модерация материальных и социальных заявок, просмотр деталей и истории решений."
      />
      <div className="filters">
        <label>
          Тип
          <select
            value={type}
            onChange={(event) => {
              setPage(1)
              setType(event.target.value)
            }}
          >
            <option value="">Все</option>
            <option value="MATERIAL">Материальные</option>
            <option value="SOCIAL">Социальные</option>
          </select>
        </label>
        <label>
          Статус
          <select
            value={status}
            onChange={(event) => {
              setPage(1)
              setStatus(event.target.value)
            }}
          >
            <option value="">Все</option>
            <option value="PENDING_MODERATION">На модерации</option>
            <option value="RETURNED_TO_REWORK">На доработке</option>
            <option value="REPORT_ON_REVIEW">Отчёт на проверке</option>
            <option value="REPORT_ON_MODERATION">Отчёт на модерации</option>
            <option value="COLLECTING_FUNDS">Сбор средств</option>
            <option value="VOLUNTEER_RECRUITING">Набор волонтёров</option>
          </select>
        </label>
      </div>
      {isLoading ? <StateBlock title="Загружаем заявки..." /> : null}
      {error ? <StateBlock title="Ошибка загрузки" description={error} /> : null}
      {!isLoading && !error && !data?.items.length ? (
        <StateBlock title="Заявок не найдено" description="Попробуйте изменить фильтры." />
      ) : null}
      {data?.items.length ? (
        <>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Заявка</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Категория</th>
                  <th>Сумма / волонтёры</th>
                  <th>Создана</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <Link to={`/requests/${request.id}`} className="table-link">
                        {request.title}
                      </Link>
                      <small>{request.description}</small>
                    </td>
                    <td>{labelOrValue(HELP_REQUEST_TYPES, request.type)}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>{labelOrValue(categoryLabels, request.category)}</td>
                    <td>{getRequestMetric(request)}</td>
                    <td>{formatDate(request.created_at)}</td>
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

const getRequestMetric = (request: HelpRequestSummary) => {
  if (request.type === 'MATERIAL') {
    return `${formatMoney(request.amount_collected_kopeks)} / ${formatMoney(request.amount_requested_kopeks)}`
  }

  return `${request.min_volunteers ?? '—'}-${request.max_volunteers ?? '—'} волонтёров`
}
