import { ensureFreshAccessToken, isAuthRefreshError, notifySessionExpired } from '../api/client'
import { tokenStorage } from '../api/tokenStorage'
import type { Notification, UnreadNotificationsCountResponse } from '../types/api'
import { getJwtExpiryMs, isJwtExpiringSoon } from '../utils/jwt'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000]
const TOKEN_REFRESH_BUFFER_MS = 30_000

export type NotificationStreamMessage =
  | { kind: 'notification'; notification: Notification }
  | { kind: 'unread_count'; unread_count: number }
  | { kind: 'refresh' }

const buildStreamUrl = (token: string) =>
  `${apiBase}/api/notifications/stream?token=${encodeURIComponent(token)}`

const isNotification = (value: unknown): value is Notification =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'type' in value &&
  'title' in value &&
  'body' in value

export const parseNotificationStreamPayload = (
  data: string,
  eventType?: string,
): NotificationStreamMessage | null => {
  const trimmed = data.trim()

  if (!trimmed || trimmed === 'ping' || trimmed === ': ping') {
    return null
  }

  if (eventType === 'refresh' || eventType === 'invalidate') {
    return { kind: 'refresh' }
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>

    if (typeof parsed.unread_count === 'number') {
      return { kind: 'unread_count', unread_count: parsed.unread_count }
    }

    if (isNotification(parsed)) {
      return { kind: 'notification', notification: parsed }
    }

    if (isNotification(parsed.notification)) {
      return { kind: 'notification', notification: parsed.notification }
    }

    if (parsed.event === 'refresh' || parsed.kind === 'refresh') {
      return { kind: 'refresh' }
    }
  } catch {
    return null
  }

  return null
}

type ConnectOptions = {
  onMessage: (message: NotificationStreamMessage) => void
}

export const connectNotificationsStream = ({ onMessage }: ConnectOptions) => {
  let eventSource: EventSource | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let tokenRotationTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempt = 0
  let disposed = false
  let isConnecting = false
  let ignoreTokensUpdatedEvent = false

  const clearTokenRotationTimer = () => {
    if (tokenRotationTimer) {
      clearTimeout(tokenRotationTimer)
      tokenRotationTimer = null
    }
  }

  const scheduleTokenRotation = (accessToken: string) => {
    clearTokenRotationTimer()

    const expiryMs = getJwtExpiryMs(accessToken)

    if (!expiryMs) {
      return
    }

    const delay = expiryMs - Date.now() - TOKEN_REFRESH_BUFFER_MS

    if (delay <= 0) {
      return
    }

    tokenRotationTimer = setTimeout(() => {
      void refreshAndReconnect()
    }, delay)
  }

  const handleAuthError = (error: unknown) => {
    if (isAuthRefreshError(error)) {
      return true
    }

    if (!tokenStorage.getRefreshToken()) {
      notifySessionExpired()
      return true
    }

    return false
  }

  const refreshAndReconnect = async () => {
    if (disposed) {
      return
    }

    ignoreTokensUpdatedEvent = true

    try {
      const token = await ensureFreshAccessToken()
      reconnectWithToken(token)
    } catch (error) {
      if (!handleAuthError(error)) {
        scheduleReconnect()
      }
    } finally {
      ignoreTokensUpdatedEvent = false
    }
  }

  const handlePayload = (data: string, eventType?: string) => {
    const message = parseNotificationStreamPayload(data, eventType)

    if (message) {
      onMessage(message)
    }
  }

  const openEventSource = (token: string) => {
    eventSource?.close()
    eventSource = new EventSource(buildStreamUrl(token))

    eventSource.onopen = () => {
      reconnectAttempt = 0
    }

    eventSource.onmessage = (event) => {
      handlePayload(event.data)
    }

    eventSource.addEventListener('notification', (event) => {
      handlePayload((event as MessageEvent).data, 'notification')
    })

    eventSource.addEventListener('refresh', () => {
      onMessage({ kind: 'refresh' })
    })

    eventSource.addEventListener('invalidate', () => {
      onMessage({ kind: 'refresh' })
    })

    eventSource.addEventListener('unread_count', (event) => {
      const payload = parseNotificationStreamPayload((event as MessageEvent).data, 'unread_count')

      if (payload?.kind === 'unread_count') {
        onMessage(payload)
        return
      }

      try {
        const parsed = JSON.parse((event as MessageEvent).data) as UnreadNotificationsCountResponse
        onMessage({ kind: 'unread_count', unread_count: parsed.unread_count })
      } catch {
        return
      }
    })

    eventSource.onerror = () => {
      eventSource?.close()
      eventSource = null
      clearTokenRotationTimer()
      void recoverFromStreamError()
    }
  }

  const reconnectWithToken = (token: string) => {
    reconnectAttempt = 0

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    scheduleTokenRotation(token)
    openEventSource(token)
  }

  const connect = async () => {
    if (disposed || isConnecting) {
      return
    }

    isConnecting = true

    try {
      const token = await ensureFreshAccessToken()

      if (!token) {
        scheduleReconnect()
        return
      }

      reconnectWithToken(token)
    } catch (error) {
      if (!handleAuthError(error)) {
        scheduleReconnect()
      }
    } finally {
      isConnecting = false
    }
  }

  const recoverFromStreamError = async () => {
    if (disposed) {
      return
    }

    const accessToken = tokenStorage.getAccessToken()
    const needsRefresh = !accessToken || isJwtExpiringSoon(accessToken, TOKEN_REFRESH_BUFFER_MS)

    if (!needsRefresh && accessToken) {
      reconnectWithToken(accessToken)
      return
    }

    await refreshAndReconnect()
  }

  const scheduleReconnect = () => {
    if (disposed) {
      return
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    const delay = RECONNECT_DELAYS_MS[Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)]
    reconnectAttempt += 1
    reconnectTimer = setTimeout(() => void connect(), delay)
  }

  void connect()

  const onVisibilityChange = () => {
    if (document.visibilityState !== 'visible') {
      return
    }

    const accessToken = tokenStorage.getAccessToken()

    if (!accessToken || isJwtExpiringSoon(accessToken, TOKEN_REFRESH_BUFFER_MS)) {
      void refreshAndReconnect()
      return
    }

    reconnectWithToken(accessToken)
  }

  const onTokensUpdated = () => {
    if (ignoreTokensUpdatedEvent) {
      return
    }

    const accessToken = tokenStorage.getAccessToken()

    if (!accessToken) {
      return
    }

    reconnectWithToken(accessToken)
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('partner_tokens_updated', onTokensUpdated)

  return () => {
    disposed = true

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    clearTokenRotationTimer()
    eventSource?.close()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('partner_tokens_updated', onTokensUpdated)
  }
}
