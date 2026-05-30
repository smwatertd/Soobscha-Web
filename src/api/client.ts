import type { TokensResponse } from '../types/api'
import { isJwtExpiringSoon } from '../utils/jwt'
import { tokenStorage } from './tokenStorage'

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
  skipAuth?: boolean
  skipAuthRefresh?: boolean
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null
let refreshRequest: Promise<TokensResponse> | null = null

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(status: number, message: string, details: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler
}

const buildUrl = (path: string, params?: Record<string, string | number | boolean | null | undefined>) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value))
    }
  })

  return API_BASE_URL ? url.href : `${url.pathname}${url.search}`
}

const normalizeBody = (body: RequestOptions['body']) => {
  if (!body || body instanceof FormData || body instanceof Blob || typeof body === 'string') {
    return body ?? undefined
  }

  return JSON.stringify(body)
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type')

  if (response.status === 204) {
    return undefined as T
  }

  if (contentType?.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}

export const isAuthRefreshError = (error: unknown) => error instanceof ApiError && error.status === 401

const refreshTokens = async () => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const refreshToken = tokenStorage.getRefreshToken()

      if (!refreshToken) {
        throw new ApiError(401, 'Сессия истекла', null)
      }

      try {
        const tokens = await apiRequest<TokensResponse>('/api/auth/refresh', {
          method: 'POST',
          body: { refresh_token: refreshToken },
          skipAuth: true,
          skipAuthRefresh: true,
        })
        tokenStorage.setTokens(tokens)

        return tokens
      } catch (error) {
        if (isAuthRefreshError(error)) {
          notifySessionExpired()
        }

        throw error
      }
    })().finally(() => {
      refreshRequest = null
    })
  }

  return refreshRequest
}

/** Обновление пары токенов (один запрос в полёте — важно при ротации refresh на бэкенде). */
export const refreshAccessToken = () => refreshTokens()

/** Refresh только если access-токен скоро истечёт. */
export const ensureFreshAccessToken = async () => {
  const accessToken = tokenStorage.getAccessToken()

  if (!accessToken) {
    throw new ApiError(401, 'Сессия истекла', null)
  }

  if (!isJwtExpiringSoon(accessToken, ACCESS_TOKEN_REFRESH_BUFFER_MS)) {
    return accessToken
  }

  const tokens = await refreshTokens()

  return tokens.access_token
}

export const notifySessionExpired = () => {
  tokenStorage.clear()
  unauthorizedHandler?.()
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
  const headers = new Headers(options.headers)
  const accessToken = tokenStorage.getAccessToken()

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(buildUrl(path, params), {
    ...options,
    body: normalizeBody(options.body),
    headers,
  })

  if ((response.status === 401 || response.status === 403) && !options.skipAuthRefresh) {
    try {
      await refreshTokens()

      return apiRequest<T>(path, { ...options, skipAuthRefresh: true }, params)
    } catch (error) {
      if (isAuthRefreshError(error)) {
        notifySessionExpired()
      }

      throw error
    }
  }

  if (!response.ok) {
    const details = await parseResponse<unknown>(response)
    const message =
      typeof details === 'object' && details && 'detail' in details
        ? String((details as { detail: unknown }).detail)
        : typeof details === 'object' && details && 'message' in details
          ? String((details as { message: unknown }).message)
        : `Ошибка запроса: ${response.status}`

    throw new ApiError(response.status, message, details)
  }

  return parseResponse<T>(response)
}

export const apiUrl = buildUrl
