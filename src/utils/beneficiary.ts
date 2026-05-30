import type { BeneficiaryPublicSummary, HelpRequestSummary } from '../types/api'
import { truncateId } from './format'

export const formatBeneficiaryName = (beneficiary?: BeneficiaryPublicSummary | null) => {
  if (!beneficiary) {
    return null
  }

  const name = [beneficiary.last_name, beneficiary.first_name].filter(Boolean).join(' ').trim()

  return name || null
}

export const getBeneficiaryDisplayName = (request: Pick<HelpRequestSummary, 'beneficiary_user_id' | 'beneficiary'>) =>
  formatBeneficiaryName(request.beneficiary) ?? truncateId(request.beneficiary_user_id)
