export const HELP_REQUEST_TYPES: Record<string, string> = {
  MATERIAL: 'Материальная',
  SOCIAL: 'Социальная',
}

export const CATEGORIES: Record<string, string> = {
  FOOD: 'Продукты питания',
  MEDICINE: 'Лекарства',
  MEDICAL_SUPPLIES: 'Медицинские расходники',
  CLOTHING: 'Одежда',
  HYGIENE: 'Гигиена',
  CHILDREN_GOODS: 'Детские товары',
  HOUSEHOLD_GOODS: 'Товары для дома',
  TRANSPORT: 'Транспорт',
  HOUSING_UTILITIES: 'Жильё и коммунальные услуги',
  DELIVERY: 'Доставка',
  TRANSPORTATION: 'Сопровождение и перевозка',
  HOUSEHOLD_HELP: 'Помощь по дому',
  CARE_ASSISTANCE: 'Уход и сопровождение',
  MEDICAL_ACCOMPANIMENT: 'Медицинское сопровождение',
  DOCUMENTS_HELP: 'Помощь с документами',
  EDUCATION_TUTORING: 'Обучение и репетиторство',
  EMOTIONAL_SUPPORT: 'Эмоциональная поддержка',
  REPAIR_HELP: 'Помощь с ремонтом',
}

export const STATUSES: Record<string, string> = {
  PENDING_MODERATION: 'На модерации',
  RETURNED_TO_REWORK: 'На доработке',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено',
  COLLECTING_FUNDS: 'Сбор средств',
  INTERRUPTED: 'Прервано',
  FUNDED: 'Профинансировано',
  REPORT_ON_REVIEW: 'Отчёт на проверке',
  REPORT_ON_MODERATION: 'Отчёт на модерации',
  COMPLETED: 'Завершено',
  REPORT_OVERDUE: 'Отчёт просрочен',
  VOLUNTEER_RECRUITING: 'Набор волонтёров',
  WAITING_RELEVANCE_CONFIRMATION: 'Ожидает подтверждения',
  WAITING_START: 'Ожидает начала',
  IN_PROGRESS: 'В работе',
  WAITING_REPORT: 'Ожидает отчёта',
  APPROVED: 'Одобрено',
  REVOKED: 'Отозвано',
  AWAITING_REFUND: 'Ожидает возврата',
  EXPENSES_VERIFIED: 'Расходы подтверждены',
}

export const ROLES: Record<string, string> = {
  BENEFICIARY: 'Получатель',
  VOLUNTEER: 'Волонтёр',
  PARTNER: 'Партнёр',
  ADMIN: 'Администратор',
  ORGANIZATION: 'Организация',
}

export const ENUM_LABELS: Record<string, string> = {
  ...HELP_REQUEST_TYPES,
  ...CATEGORIES,
  ...STATUSES,
  ...ROLES,
}

export const ACTION_LABELS: Record<string, string> = {
  approve: 'Одобрить',
  reject: 'Отклонить',
  return_to_rework: 'Вернуть на доработку',
  'return-to-rework': 'Вернуть на доработку',
  cancel: 'Отменить',
  interrupt: 'Прервать',
}

export const ACTION_ALIASES: Record<string, string> = {
  APPROVE: 'approve',
  REJECT: 'reject',
  RETURN_TO_REWORK: 'return_to_rework',
  CANCEL: 'cancel',
  INTERRUPT: 'interrupt',
}

export const labelOrValue = (dictionary: Record<string, string>, value?: string | null) =>
  value ? (dictionary[value] ?? value) : '—'

export const normalizeAction = (action: string) => ACTION_ALIASES[action] ?? action
