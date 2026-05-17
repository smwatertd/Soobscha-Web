import { labelOrValue, STATUSES } from '../utils/labels'

const getTone = (status: string) => {
  if (['APPROVED', 'COMPLETED', 'FUNDED', 'COLLECTING_FUNDS'].includes(status)) {
    return 'success'
  }

  if (['REJECTED', 'CANCELLED', 'INTERRUPTED', 'REVOKED', 'REPORT_OVERDUE'].includes(status)) {
    return 'danger'
  }

  if (['RETURNED_TO_REWORK', 'WAITING_REPORT', 'WAITING_START'].includes(status)) {
    return 'warning'
  }

  return 'neutral'
}

export const StatusBadge = ({ status }: { status?: string | null }) => {
  if (!status) {
    return <span className="status-badge neutral">—</span>
  }

  return <span className={`status-badge ${getTone(status)}`}>{labelOrValue(STATUSES, status)}</span>
}
