import type { JsonObject } from '../types/api'
import { humanizeKey, humanizeValue } from './humanize'
import { labelOrValue, HELP_REQUEST_TYPES, ENUM_LABELS } from './labels'

export const isReportHistoryItem = (item: JsonObject) =>
  typeof item.report_id === 'string' || typeof item.report_version_id === 'string'

export const isMaterialReportItem = (item: JsonObject) =>
  isReportHistoryItem(item) && item.help_request_type === 'MATERIAL'

export const isMaterialHelpRequestReport = (item: JsonObject) => item.help_request_type === 'MATERIAL'

export const formatReportHelpRequestType = (type: unknown) =>
  typeof type === 'string' ? labelOrValue(HELP_REQUEST_TYPES, type) : undefined

export const formatSettlementStatus = (status: unknown) =>
  typeof status === 'string' && status ? labelOrValue(ENUM_LABELS, status) : '—'

export const getReportPayloadEntries = (payload: unknown) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return []
  }

  return Object.entries(payload as JsonObject).filter(
    ([, value]) => value !== null && value !== undefined && value !== '',
  )
}

export const formatReportPayloadValue = (key: string, value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  return humanizeValue(key, value)
}

export const getReportPayloadFieldLabel = (key: string) => humanizeKey(key)

export const getPurchasesDescription = (payload: unknown) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined
  }

  const value = (payload as JsonObject).purchases_description

  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export const getReportPayloadEntriesWithoutPurchases = (payload: unknown) =>
  getReportPayloadEntries(payload).filter(([key]) => key !== 'purchases_description')

const EMPTY_REPORT_STATUSES = new Set(['IDLE', 'NONE'])

export const isEmptyReportStatus = (status?: string | null) =>
  !status || EMPTY_REPORT_STATUSES.has(status)

export const REPORT_STATUS_LABELS: Record<string, string> = {
  IDLE: 'Не подан',
  NONE: 'Не подан',
  PENDING_MODERATION: 'На модерации',
  RETURNED_TO_REWORK: 'На доработке',
  APPROVED: 'Одобрен',
  REJECTED: 'Отклонён',
  WAITING_REPORT: 'Ожидает отчёта',
  REPORT_ON_MODERATION: 'На модерации',
  REPORT_ON_REVIEW: 'На проверке',
  REPORT_OVERDUE: 'Просрочен',
  COMPLETED: 'Завершён',
}

export const getReportStatusLabel = (status: string) =>
  REPORT_STATUS_LABELS[status] ?? labelOrValue(ENUM_LABELS, status)
