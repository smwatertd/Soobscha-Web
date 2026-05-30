export const PARTNER_INITIATOR_LABEL = 'Партнёр'

const PARTNER_INITIATOR_CODES = new Set(['PARTNER', 'PARTNER_MANUAL'])

export const isPartnerInitiator = (code?: string | null, label?: string | null) => {
  if (code) {
    if (PARTNER_INITIATOR_CODES.has(code) || code.startsWith('PARTNER_')) {
      return true
    }
  }

  if (label && /партн/i.test(label)) {
    return true
  }

  return false
}
