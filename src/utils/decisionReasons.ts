import type { JsonObject } from '../types/api'

export type DecisionRow = {
  label: string
  value?: string | null
  userId?: string | null
  initiatorCode?: string | null
  isModerationActor?: boolean
}

export type DecisionGroup = {
  key: string
  title: string
  rows: DecisionRow[]
}

const isPresent = (value: unknown): value is string => typeof value === 'string' && value.length > 0

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (isPresent(value)) {
      return value
    }
  }

  return undefined
}

const getDistinctComment = (reason: unknown, label: unknown) =>
  isPresent(reason) && reason !== label ? reason : undefined

const hasRows = (rows: DecisionRow[]) => rows.some((row) => isPresent(row.value) || isPresent(row.userId))

const compactRows = (rows: DecisionRow[]) => rows.filter((row) => isPresent(row.value) || isPresent(row.userId))

const buildGroup = (key: string, title: string, rows: DecisionRow[]): DecisionGroup | undefined => {
  const compactedRows = compactRows(rows)

  if (!hasRows(compactedRows)) {
    return undefined
  }

  return { key, title, rows: compactedRows }
}

export const buildHelpRequestDecisionGroups = (source: JsonObject): DecisionGroup[] =>
  [
    buildGroup('approved', 'Одобрено', [
      { label: 'Дата и время', value: pickString(source.approved_at) },
      { label: 'Инициатор', userId: pickString(source.approved_by_user_id), isModerationActor: true },
    ]),
    buildGroup('rejected', 'Отклонено', [
      { label: 'Дата и время', value: pickString(source.rejected_at) },
      { label: 'Инициатор', userId: pickString(source.rejected_by_user_id), isModerationActor: true },
      { label: 'Причина', value: pickString(source.rejection_reason) },
    ]),
    buildGroup('returned', 'Возвращено на доработку', [
      { label: 'Дата и время', value: pickString(source.returned_at) },
      { label: 'Инициатор', userId: pickString(source.returned_by_user_id), isModerationActor: true },
      { label: 'Причина', value: pickString(source.return_reason) },
    ]),
    buildGroup('cancelled', 'Отменено', [
      { label: 'Дата и время', value: pickString(source.cancelled_at) },
      {
        label: 'Инициатор',
        value: pickString(source.cancellation_initiator_label),
        initiatorCode: pickString(source.cancellation_initiator),
        userId: pickString(source.cancelled_by_user_id),
      },
      {
        label: 'Причина',
        value: pickString(source.cancellation_reason_label, source.cancellation_reason),
      },
      {
        label: 'Комментарий',
        value: getDistinctComment(source.cancellation_reason, source.cancellation_reason_label),
      },
    ]),
    buildGroup('interrupted', 'Прервано', [
      { label: 'Дата и время', value: pickString(source.interrupted_at) },
      {
        label: 'Инициатор',
        value: pickString(source.interruption_initiator_label),
        initiatorCode: pickString(source.interruption_initiator),
        userId: pickString(source.interrupted_by_user_id),
      },
      {
        label: 'Причина',
        value: pickString(source.interruption_reason_label, source.interruption_reason),
      },
      {
        label: 'Комментарий',
        value: getDistinctComment(source.interruption_reason, source.interruption_reason_label),
      },
    ]),
  ].filter((group): group is DecisionGroup => Boolean(group))

export const buildReportDecisionGroups = (source: JsonObject): DecisionGroup[] =>
  [
    buildGroup('approved', 'Одобрен', [
      { label: 'Дата и время', value: pickString(source.approved_at) },
      { label: 'Инициатор', userId: pickString(source.approved_by_user_id), isModerationActor: true },
    ]),
    buildGroup('rejected', 'Отклонён', [
      { label: 'Дата и время', value: pickString(source.rejected_at) },
      { label: 'Инициатор', userId: pickString(source.rejected_by_user_id), isModerationActor: true },
      { label: 'Причина', value: pickString(source.rejection_reason) },
    ]),
    buildGroup('returned', 'Возвращён на доработку', [
      { label: 'Дата и время', value: pickString(source.returned_at) },
      { label: 'Инициатор', userId: pickString(source.returned_by_user_id), isModerationActor: true },
      { label: 'Причина', value: pickString(source.return_reason) },
    ]),
  ].filter((group): group is DecisionGroup => Boolean(group))
