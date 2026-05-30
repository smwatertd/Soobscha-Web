import { useEffect, useMemo, useState } from 'react'
import { volunteersApi } from '../api/endpoints'
import type { VolunteerSkillCatalogItem } from '../types/api'

export const useVolunteerSkillCatalog = () => {
  const [skills, setSkills] = useState<VolunteerSkillCatalogItem[]>([])

  useEffect(() => {
    volunteersApi.skillCatalog().then(setSkills).catch(() => setSkills([]))
  }, [])

  return useMemo(() => Object.fromEntries(skills.map((skill) => [skill.code, skill.label])), [skills])
}

export const useVolunteerSkillCatalogMap = () => {
  const [skills, setSkills] = useState<VolunteerSkillCatalogItem[]>([])

  useEffect(() => {
    volunteersApi.skillCatalog().then(setSkills).catch(() => setSkills([]))
  }, [])

  return useMemo(() => Object.fromEntries(skills.map((skill) => [skill.code, skill])), [skills])
}

export const useVolunteerSkillCatalogData = () => {
  const [skills, setSkills] = useState<VolunteerSkillCatalogItem[]>([])

  useEffect(() => {
    volunteersApi.skillCatalog().then(setSkills).catch(() => setSkills([]))
  }, [])

  return useMemo(
    () => ({
      labels: Object.fromEntries(skills.map((skill) => [skill.code, skill.label])),
      byCode: Object.fromEntries(skills.map((skill) => [skill.code, skill])),
    }),
    [skills],
  )
}
