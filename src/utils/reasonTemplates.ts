type ReasonAction = 'reject' | 'return_to_rework' | 'return-to-rework' | 'cancel' | 'interrupt' | 'revoke' | string

export type ReasonTemplate = {
  id: string
  action: ReasonAction
  label: string
  text: string
  builtIn?: boolean
}

const STORAGE_KEY = 'partner_reason_templates_v1'

const BUILT_IN_BY_ACTION: Record<string, Array<{ label: string; text: string }>> = {
  reject: [
    { label: 'Недостаточно данных', text: 'Недостаточно подтверждающих данных для принятия положительного решения.' },
    { label: 'Данные не соответствуют', text: 'Переданные данные не соответствуют требованиям платформы.' },
    { label: 'Нарушение правил', text: 'Заявка отклонена из-за нарушения правил платформы.' },
  ],
  return_to_rework: [
    { label: 'Нужны уточнения', text: 'Пожалуйста, уточните детали и дополните заявку.' },
    { label: 'Не хватает документов', text: 'Добавьте недостающие документы и отправьте на повторную модерацию.' },
    { label: 'Требуется корректировка', text: 'Исправьте замечания и отправьте заявку на повторную проверку.' },
  ],
  'return-to-rework': [
    { label: 'Нужны уточнения', text: 'Пожалуйста, уточните детали и дополните заявку.' },
    { label: 'Не хватает документов', text: 'Добавьте недостающие документы и отправьте на повторную модерацию.' },
    { label: 'Требуется корректировка', text: 'Исправьте замечания и отправьте заявку на повторную проверку.' },
  ],
  cancel: [
    { label: 'Помощь больше не актуальна', text: 'Заявка отменена, помощь больше не требуется.' },
    { label: 'Дублирующая заявка', text: 'Заявка отменена как дублирующая.' },
  ],
  interrupt: [
    { label: 'Изменились обстоятельства', text: 'Выполнение заявки прервано из-за изменения обстоятельств.' },
    { label: 'Невозможно продолжить', text: 'Выполнение заявки временно невозможно, процесс прерван.' },
  ],
  revoke: [
    { label: 'Найдены несоответствия', text: 'Решение отозвано из-за выявленных несоответствий.' },
    { label: 'Требуется повторная проверка', text: 'Решение отозвано, требуется повторная модерация.' },
  ],
}

const normalizeAction = (action: ReasonAction) => (action === 'return-to-rework' ? 'return_to_rework' : action)

const getBuiltInTemplates = (action: ReasonAction): ReasonTemplate[] =>
  (BUILT_IN_BY_ACTION[action] ?? BUILT_IN_BY_ACTION[normalizeAction(action)] ?? []).map((item, index) => ({
    id: `builtin:${normalizeAction(action)}:${index}`,
    action,
    label: item.label,
    text: item.text,
    builtIn: true,
  }))

export const listBuiltInTemplates = (action: ReasonAction) => getBuiltInTemplates(action)

export const listCustomTemplates = (action: ReasonAction): ReasonTemplate[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as ReasonTemplate[]

    return parsed.filter((item) => item.action === action || item.action === normalizeAction(action))
  } catch {
    return []
  }
}

const readAllCustomTemplates = (): ReasonTemplate[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ReasonTemplate[]) : []
  } catch {
    return []
  }
}

const writeAllCustomTemplates = (templates: ReasonTemplate[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export const saveCustomTemplate = (action: ReasonAction, label: string, text: string): ReasonTemplate => {
  const all = readAllCustomTemplates()
  const template: ReasonTemplate = {
    id: `custom:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`,
    action: normalizeAction(action),
    label: label.trim(),
    text: text.trim(),
  }

  writeAllCustomTemplates([template, ...all])

  return template
}

export const deleteCustomTemplate = (templateId: string) => {
  const all = readAllCustomTemplates()
  writeAllCustomTemplates(all.filter((item) => item.id !== templateId))
}

