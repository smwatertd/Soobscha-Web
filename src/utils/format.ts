export const formatDate = (value?: string | null) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const formatMoney = (kopeks?: number | null) => {
  if (kopeks === undefined || kopeks === null) {
    return '—'
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(kopeks / 100)
}

export const truncateId = (id?: string | null) => (id ? `${id.slice(0, 8)}...${id.slice(-4)}` : '—')

export const formatDistanceKm = (km?: number | null) => {
  if (km === undefined || km === null) {
    return '—'
  }

  return `${km.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} км`
}

export const normalizeTelHref = (phone: string) => phone.replace(/[^\d+]/g, '')

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось выполнить запрос'
}
