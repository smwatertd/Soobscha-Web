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
  status: 'Статус',
  report_status: 'Статус отчёта',
  settlement_status: 'Статус расчётов',
  items_to_bring: 'Что взять с собой',
  additional_notes: 'Дополнительные заметки',
  relevance_confirmed_at: 'Актуальность подтверждена',
  started_at: 'Исполнение начато',
  finished_at: 'Исполнение завершено',
  fund_redistribution_status: 'Статус перераспределения фонда',
  fund_redistributed_amount_kopeks: 'Перераспределено из фонда',
  distance_km: 'Расстояние',
  joined: 'Присоединились',
  attended: 'Присутствовали',
  no_show: 'Не явились',
  left_after_start: 'Ушли после начала',
  unjoined: 'Отказались',
  total: 'Всего участников',
  participants: 'Участники',
  public_snapshot_json: 'Публичный снимок',
  version_number: 'Номер версии',
  type: 'Тип',
  title: 'Название',
  description: 'Описание',
  purchases_description: 'Описание покупок',
  text: 'Текст',
  result: 'Результат',
  comment: 'Комментарий',
  work_done: 'Что сделано',
  spent_confirmed_kopeks: 'Подтверждено расходов',
  amount_kopeks: 'Сумма',
  amount_requested_kopeks: 'Запрошено',
  amount_collected_kopeks: 'Собрано',
  required_kopeks: 'Необходимо вернуть',
  remaining_kopeks: 'Осталось вернуть',
  completed_at: 'Завершено',
  min_volunteers: 'Минимум волонтёров',
  max_volunteers: 'Максимум волонтёров',
  duration_minutes: 'Длительность',
  start_at: 'Начало',
  closed_at: 'Закрыта',
  id: 'ID',
  user_id: 'ID пользователя',
  beneficiary_user_id: 'ID бенефициара',
  approved_by_user_id: 'Кто одобрил',
  rejected_by_user_id: 'Кто отклонил',
  returned_by_user_id: 'Кто вернул',
  cancelled_by_user_id: 'Кто отменил',
  interrupted_by_user_id: 'Кто прервал',
  role: 'Роль',
  user_role: 'Роль',
  category: 'Категория',
  base_category: 'Базовая категория',
  age: 'Возраст',
  is_verified: 'Верифицирован',
  full_name: 'ФИО',
  name: 'Имя',
  first_name: 'Имя',
  last_name: 'Фамилия',
  middle_name: 'Отчество',
  patronymic: 'Отчество',
  phone_number: 'Телефон',
  applicant_contact: 'Контакты заявителя',
  email: 'Email',
  avatar_url: 'Аватар',
  city: 'Город',
  birth_date: 'Дата рождения',
  certificate_expiry_date: 'Срок действия сертификата',
  certificate_issue_date: 'Дата выдачи сертификата',
  certificate_number: 'Номер сертификата',
  disability_group: 'Группа инвалидности',
  issuing_authority: 'Кем выдано',
  limitation_summary: 'Описание ограничений',
  limitations_summary: 'Описание ограничений',
  monthly_income: 'Ежемесячный доход',
  address: 'Адрес',
  address_text: 'Адрес',
  place_name: 'Место',
  latitude: 'Широта',
  longitude: 'Долгота',
  skills: 'Навыки',
  skill_codes: 'Навыки',
  required_skills: 'Обязательные навыки',
  preferred_skills: 'Желательные навыки',
  media_files: 'Медиафайлы',
  financials: 'Финансы',
  donations: 'Пожертвования',
  report: 'Отчёт',
  report_version_id: 'ID версии отчёта',
  report_id: 'ID отчёта',
  approved_at: 'Одобрена',
  rejected_at: 'Отклонена',
  returned_at: 'Возвращена на доработку',
  cancelled_at: 'Отменена',
  interrupted_at: 'Прервана',
  rejection_reason: 'Причина отклонения',
  return_reason: 'Причина возврата',
  cancellation_reason: 'Причина отмены',
  cancellation_reason_code: 'Код причины отмены',
  cancellation_reason_label: 'Причина отмены',
  cancellation_initiator: 'Инициатор отмены',
  cancellation_initiator_label: 'Инициатор отмены',
  interruption_reason: 'Причина прерывания',
  interruption_reason_code: 'Код причины прерывания',
  interruption_reason_label: 'Причина прерывания',
  interruption_initiator: 'Инициатор прерывания',
  interruption_initiator_label: 'Инициатор прерывания',
  document_type: 'Тип документа',
  document_number: 'Номер документа',
  id_document_files: 'Документы',
  selfie_with_id_files: 'Селфи с документом',
  selfie_with_certificate_files: 'Селфи с сертификатом',
  selfie_with_document_files: 'Селфи с документом',
  passport_issue_date: 'Дата выдачи паспорта',
  passport_series_number: 'Серия и номер паспорта',
  passport_number: 'Номер паспорта',
  passport_series: 'Серия паспорта',
  passport_issued_by: 'Кем выдан паспорт',
  passport_department_code: 'Код подразделения',
  registration_address: 'Адрес регистрации',
  residential_address: 'Адрес проживания',
  gender: 'Пол',
  media_id: 'ID файла',
  url: 'Файл',
  preview_url: 'Превью',
  expires_at: 'Ссылка активна до',
  issued_by: 'Кем выдан',
  issued_at: 'Дата выдачи',
  valid_until: 'Действительно до',
  social_status: 'Социальный статус',
  organization_name: 'Организация',
  skills_evidence: 'Подтверждение навыков',
  skill_code: 'Навык',
  supporting_document_files: 'Подтверждающие документы',
  certificate_files: 'Сертификаты',
  education_document_files: 'Документы об образовании',
  portfolio_files: 'Портфолио',
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

  if (typeof value === 'string' && (key.endsWith('_date') || key.includes('birth_date') || key.includes('issue_date'))) {
    return formatDateOnly(value)
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

const formatDateOnly = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
  }).format(new Date(value))

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
