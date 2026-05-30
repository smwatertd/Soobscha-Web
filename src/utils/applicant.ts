import type { JsonObject } from '../types/api'

type ApplicantCitySource = {
  applicant_city?: string | null
  common_data?: JsonObject | null
}

export const getApplicantCity = (source: ApplicantCitySource) => {
  if (source.applicant_city) {
    return source.applicant_city
  }

  const commonCity = source.common_data?.city

  return typeof commonCity === 'string' && commonCity.length > 0 ? commonCity : null
}
