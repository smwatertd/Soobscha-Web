import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney, normalizeTelHref, truncateId } from './format'

describe('format utils', () => {
  it('formats money from kopeks to rubles', () => {
    expect(formatMoney(123_45)).toContain('123,45')
  })

  it('returns dash for empty money value', () => {
    expect(formatMoney(null)).toBe('—')
  })

  it('truncates long id with head and tail', () => {
    expect(truncateId('12345678-aaaa-bbbb-cccc-1234567890ab')).toBe('12345678...90ab')
  })

  it('normalizes phone for tel: links', () => {
    expect(normalizeTelHref('+7 (917) 111-22-33')).toBe('+79171112233')
  })

  it('formats date and falls back to dash', () => {
    expect(formatDate('2026-05-27T12:30:00Z')).not.toBe('—')
    expect(formatDate()).toBe('—')
  })
})
