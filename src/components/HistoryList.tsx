import type { JsonObject } from '../types/api'
import { formatDate } from '../utils/format'
import { StatusBadge } from './StatusBadge'

type HistoryItem = JsonObject & {
  version_number?: number
  status?: string
  created_at?: string
  updated_at?: string
  title?: string
}

export const HistoryList = ({ items }: { items?: HistoryItem[] }) => {
  if (!items?.length) {
    return <p className="muted">История пока пустая.</p>
  }

  return (
    <ol className="history-list">
      {items.map((item, index) => (
        <li key={`${item.version_number ?? index}-${item.updated_at ?? item.created_at ?? index}`}>
          <div>
            <strong>Версия {item.version_number ?? index + 1}</strong>
            <span>{formatDate(item.updated_at ?? item.created_at)}</span>
          </div>
          <StatusBadge status={item.status} />
          {item.title ? <p>{item.title}</p> : null}
        </li>
      ))}
    </ol>
  )
}
