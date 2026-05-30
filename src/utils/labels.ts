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
  OPEN: 'Открыта',
  UPHELD: 'Подтверждена',
}

export const ROLES: Record<string, string> = {
  BENEFICIARY: 'Бенефициар',
  VOLUNTEER: 'Волонтёр',
  PARTNER: 'Партнёр',
  ADMIN: 'Администратор',
  ORGANIZATION: 'Организация',
}

export const COMPLAINT_STATUSES: Record<string, string> = {
  OPEN: 'Открыта',
  UPHELD: 'Подтверждена',
  REJECTED: 'Отклонена',
}

export const CANCELLATION_REASON_CODES: Record<string, string> = {
  OWNER_MANUAL: 'Отменено получателем вручную',
  OWNER_DECLINED_RELEVANCE: 'Получатель отклонил актуальность',
  SYSTEM_INSUFFICIENT_VOLUNTEERS_BEFORE_CONFIRMATION: 'Недостаточно волонтёров до подтверждения',
  SYSTEM_CONFIRMATION_TIMEOUT: 'Истекло время подтверждения актуальности',
  PARTNER_MANUAL: 'Решение партнёра',
}

export const INTERRUPTION_REASON_CODES: Record<string, string> = {
  OWNER_EMERGENCY: 'Чрезвычайная ситуация получателя',
  OWNER_MANUAL: 'Прервано получателем вручную',
  OWNER_NO_LONGER_NEEDS_HELP: 'Получателю помощь больше не нужна',
  OWNER_PARTIAL_AMOUNT_SUFFICIENT: 'Достаточно частичной суммы',
  OWNER_CANNOT_USE_FUNDS_FOR_PURPOSE: 'Невозможно использовать средства по назначению',
  PARTNER_MANUAL: 'Решение партнёра',
  START_TIMEOUT: 'Истекло время начала',
  INSUFFICIENT_VOLUNTEERS_BEFORE_START: 'Недостаточно волонтёров до начала',
  INSUFFICIENT_ATTENDED_AT_START: 'Недостаточно присутствующих на старте',
  INSUFFICIENT_VOLUNTEERS_AFTER_START: 'Недостаточно волонтёров после начала',
  SYSTEM_POLICY_VIOLATION: 'Нарушение правил платформы',
  SYSTEM_RISK_CHECK_FAILED: 'Не пройдена проверка рисков',
  SYSTEM_OTHER: 'Системная причина',
}

export const VOLUNTEER_PARTICIPATION_STATUSES: Record<string, string> = {
  JOINED: 'Присоединился',
  UNJOINED: 'Отказался от участия',
  ATTENDED: 'Присутствовал',
  NO_SHOW: 'Не явился',
  LEFT_AFTER_START: 'Ушёл после начала',
}

export const CONTACT_CHANNEL_TYPES: Record<string, string> = {
  phone: 'Телефон',
  email: 'Email',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  vk: 'ВКонтакте',
  max: 'MAX',
  other: 'Другое',
}

export const GENDERS: Record<string, string> = {
  male: 'Мужской',
  female: 'Женский',
}

export const SANCTION_LEVELS: Record<string, string> = {
  NONE: 'Нет',
  WARNING: 'Предупреждение',
  RESTRICT: 'Ограничение',
  BLOCK: 'Блокировка',
}

export const ENUM_LABELS: Record<string, string> = {
  ...HELP_REQUEST_TYPES,
  ...CATEGORIES,
  ...STATUSES,
  ...ROLES,
  ...COMPLAINT_STATUSES,
  ...SANCTION_LEVELS,
  ...CANCELLATION_REASON_CODES,
  ...INTERRUPTION_REASON_CODES,
  ...VOLUNTEER_PARTICIPATION_STATUSES,
  ...CONTACT_CHANNEL_TYPES,
  ...GENDERS,
}

export const codeLabelsToMap = (items?: Array<{ code: string; label: string }>) =>
  Object.fromEntries((items ?? []).map((item) => [item.code, item.label]))

export const mergeCodeLabels = (...maps: Array<Record<string, string>>) => Object.assign({}, ...maps)

export const ACTION_LABELS: Record<string, string> = {
  approve: 'Одобрить',
  reject: 'Отклонить',
  return_to_rework: 'Вернуть на доработку',
  'return-to-rework': 'Вернуть на доработку',
  cancel: 'Отменить',
  interrupt: 'Прервать',
  revoke: 'Отозвать',
  review_material: 'Подтвердить расходы',
}

export const ACTION_ALIASES: Record<string, string> = {
  APPROVE: 'approve',
  REJECT: 'reject',
  RETURN_TO_REWORK: 'return_to_rework',
  CANCEL: 'cancel',
  INTERRUPT: 'interrupt',
  REVOKE: 'revoke',
  REVIEW_MATERIAL: 'review_material',
}

export const labelOrValue = (dictionary: Record<string, string>, value?: string | null) =>
  value ? (dictionary[value] ?? value) : '—'

export const normalizeAction = (action: string) => ACTION_ALIASES[action] ?? action
