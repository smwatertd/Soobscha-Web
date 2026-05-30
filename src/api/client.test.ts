// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends auth header and serializes json body', async () => {
    localStorage.setItem('partner_access_token', 'access-token')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { apiRequest } = await import('./client')
    await apiRequest('/api/help-requests', { method: 'POST', body: { title: 'Test' } })

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = options.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer access-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ title: 'Test' }))
  })

  it('retries original request after 401 with token refresh', async () => {
    localStorage.setItem('partner_access_token', 'expired-token')
    localStorage.setItem('partner_refresh_token', 'refresh-1')

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Unauthorized' }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'new-access',
            refresh_token: 'new-refresh',
            token_type: 'bearer',
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await import('./client')
    await apiRequest('/api/help-requests')

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(localStorage.getItem('partner_access_token')).toBe('new-access')
  })

  it('uses single refresh request for parallel refreshAccessToken calls', async () => {
    localStorage.setItem('partner_refresh_token', 'refresh-1')
    const refreshResponse = new Response(
      JSON.stringify({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        token_type: 'bearer',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
    const fetchMock = vi.fn().mockResolvedValue(refreshResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { refreshAccessToken } = await import('./client')
    await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('ensureFreshAccessToken returns token without refresh when not expiring', async () => {
    const accessToken = 'header.payload.signature'
    localStorage.setItem('partner_access_token', accessToken)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    vi.doMock('../utils/jwt', () => ({
      isJwtExpiringSoon: vi.fn().mockReturnValue(false),
    }))

    const { ensureFreshAccessToken } = await import('./client')
    const result = await ensureFreshAccessToken()

    expect(result).toBe(accessToken)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
