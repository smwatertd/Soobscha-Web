import { describe, expect, it, vi } from 'vitest'
import { getJwtExpiryMs, isJwtExpiringSoon } from './jwt'

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

const createJwt = (expSeconds: number) => {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = toBase64Url(JSON.stringify({ exp: expSeconds }))

  return `${header}.${payload}.signature`
}

describe('jwt utils', () => {
  it('parses JWT expiry in milliseconds', () => {
    const token = createJwt(1_800_000_000)

    expect(getJwtExpiryMs(token)).toBe(1_800_000_000_000)
  })

  it('returns null for malformed token payload', () => {
    expect(getJwtExpiryMs('broken.token')).toBeNull()
  })

  it('checks token expiration using provided buffer', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-27T12:00:00Z'))

    const nowSec = Math.floor(Date.now() / 1000)
    const validToken = createJwt(nowSec + 120)
    const expiringToken = createJwt(nowSec + 10)

    expect(isJwtExpiringSoon(validToken, 30_000)).toBe(false)
    expect(isJwtExpiringSoon(expiringToken, 30_000)).toBe(true)

    vi.useRealTimers()
  })
})
