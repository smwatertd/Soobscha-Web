// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { authApi } from '../api/endpoints'
import { tokenStorage } from '../api/tokenStorage'

vi.mock('../api/endpoints', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('../api/client', () => ({
  setUnauthorizedHandler: vi.fn(),
}))

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

const createJwt = (role: string) => {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = toBase64Url(JSON.stringify({ role, exp: 1_900_000_000 }))

  return `${header}.${payload}.sig`
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('initializes auth state from stored token', async () => {
    localStorage.setItem('partner_access_token', createJwt('ADMIN'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.userRole).toBe('ADMIN')
  })

  it('updates auth state after successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: createJwt('PARTNER'),
      refresh_token: 'refresh',
      token_type: 'bearer',
    })

    const setTokensSpy = vi.spyOn(tokenStorage, 'setTokens')
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isReady).toBe(true))
    await result.current.login({ phone_number: '+79990000000', password: 'secret' })

    expect(setTokensSpy).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    await waitFor(() => expect(result.current.userRole).toBe('PARTNER'))
  })

  it('clears session on logout and calls logout API with refresh token', async () => {
    localStorage.setItem('partner_access_token', createJwt('PARTNER'))
    localStorage.setItem('partner_refresh_token', 'refresh-1')
    vi.mocked(authApi.logout).mockResolvedValue(undefined)

    const clearSpy = vi.spyOn(tokenStorage, 'clear')
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isReady).toBe(true))
    await result.current.logout()

    expect(clearSpy).toHaveBeenCalledTimes(1)
    expect(authApi.logout).toHaveBeenCalledWith('refresh-1')
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))
    await waitFor(() => expect(result.current.userRole).toBeNull())
  })
})
