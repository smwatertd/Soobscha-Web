import { useEffect, useMemo, useState } from 'react'
import { helpRequestsApi } from '../api/endpoints'
import type { HelpRequestCategoriesResponse } from '../types/api'
import { CATEGORIES } from '../utils/labels'

const toDictionary = (categories: HelpRequestCategoriesResponse | null) => {
  const serverLabels = Object.fromEntries(
    [...(categories?.material ?? []), ...(categories?.social ?? [])].map((category) => [category.code, category.label]),
  )

  return {
    ...CATEGORIES,
    ...serverLabels,
  }
}

export const useHelpRequestCategories = () => {
  const [categories, setCategories] = useState<HelpRequestCategoriesResponse | null>(null)

  useEffect(() => {
    helpRequestsApi.categories().then(setCategories).catch(() => setCategories(null))
  }, [])

  return useMemo(() => toDictionary(categories), [categories])
}
