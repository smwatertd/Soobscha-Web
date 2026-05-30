// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { tokenStorage } from './tokenStorage'

describe('tokenStorage', () => {
  it('stores both tokens and emits update event', () => {
    const listener = vi.fn()
    window.addEventListener('partner_tokens_updated', listener)

    tokenStorage.setTokens({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
    })

    expect(tokenStorage.getAccessToken()).toBe('access-token')
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('clears stored tokens', () => {
    localStorage.setItem('partner_access_token', 'a')
    localStorage.setItem('partner_refresh_token', 'r')

    tokenStorage.clear()

    expect(tokenStorage.getAccessToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })
})
