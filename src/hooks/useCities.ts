import { useEffect, useMemo, useState } from 'react'
import { locationsApi } from '../api/endpoints'
import type { CitiesResponse } from '../types/api'

export const useCities = () => {
  const [cities, setCities] = useState<CitiesResponse>([])

  useEffect(() => {
    locationsApi.cities().then(setCities).catch(() => setCities([]))
  }, [])

  return useMemo(() => Object.fromEntries(cities.map((city) => [city.code, city.label])), [cities])
}
