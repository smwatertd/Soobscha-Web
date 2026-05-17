import type { JsonObject } from '../types/api'
import { formatDate, formatMoney } from './format'
import { ENUM_LABELS, labelOrValue } from './labels'

const FIELD_LABELS: Record<string, string> = {
  requested_kopeks: 'Запрошено',
  collected_kopeks: 'Собрано',
  pending_donations_kopeks: 'Ожидают подтверждения',
  remaining_to_collect_kopeks: 'Осталось собрать',
  withdrawn_kopeks: 'Выведено',
  pending_payout_kopeks: 'Выплата в обработке',
  available_for_withdrawal_kopeks: 'Доступно к выводу',
  refund_obligation_kopeks: 'К возврату',
  returned_kopeks: 'Возвращено',
  refund_obligation: 'Обязательство по возврату',
  count: 'Всего',
  succeeded_count: 'Успешных',
  pending_count: 'В ожидании',
  description: 'Описание',
  text: 'Текст',
  result: 'Результат',
  comment: 'Комментарий',
  work_done: 'Что сделано',
  spent_confirmed_kopeks: 'Подтверждено расходов',
  amount_kopeks: 'Сумма',
  full_name: 'ФИО',
  first_name: 'Имя',
  last_name: 'Фамилия',
  middle_name: 'Отчество',
  phone_number: 'Телефон',
  email: 'Email',
  city: 'Город',
  birth_date: 'Дата рождения',
  address: 'Адрес',
  document_type: 'Тип документа',
  document_number: 'Номер документа',
  issued_by: 'Кем выдан',
  issued_at: 'Дата выдачи',
  valid_until: 'Действительно до',
  social_status: 'Социальный статус',
  organization_name: 'Организация',
}

export type HumanField = {
  key: string
  label: string
  value: string
}

export const humanizeKey = (key: string) => {
  if (FIELD_LABELS[key]) {
    return FIELD_LABELS[key]
  }

  return key
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

export const humanizeValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет'
  }

  if (typeof value === 'number' && key.endsWith('_kopeks')) {
    return formatMoney(value)
  }

  if (typeof value === 'string' && (key.endsWith('_at') || key.endsWith('_until') || key.includes('date'))) {
    return formatDate(value)
  }

  if (typeof value === 'string') {
    return labelOrValue(ENUM_LABELS, value)
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => humanizeValue(key, item)).join(', ') : '—'
  }

  if (typeof value === 'object') {
    return objectToHumanFields(value as JsonObject)
      .map((field) => `${field.label}: ${field.value}`)
      .join('; ')
  }

  return String(value)
}

export const objectToHumanFields = (value?: JsonObject | null): HumanField[] => {
  if (!value) {
    return []
  }

  return Object.entries(value)
    .filter(([, fieldValue]) => fieldValue !== null && fieldValue !== undefined && fieldValue !== '')
    .map(([key, fieldValue]) => ({
      key,
      label: humanizeKey(key),
      value: humanizeValue(key, fieldValue),
    }))
}
