import { useEffect, useMemo, useState } from 'react'
import { beneficiariesApi } from '../api/endpoints'
import type { BeneficiaryCategoriesResponse } from '../types/api'
import { CATEGORIES } from '../utils/labels'

const toDictionary = (categories: BeneficiaryCategoriesResponse | null) => ({
  ...CATEGORIES,
  ...Object.fromEntries((categories ?? []).map((category) => [category.code, category.label])),
})

export const useBeneficiaryCategories = () => {
  const [categories, setCategories] = useState<BeneficiaryCategoriesResponse | null>(null)

  useEffect(() => {
    beneficiariesApi.categories().then(setCategories).catch(() => setCategories(null))
  }, [])

  return useMemo(() => toDictionary(categories), [categories])
}
