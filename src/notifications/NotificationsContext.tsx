import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { notificationsApi } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import { useDataRefresh } from '../realtime/DataRefreshContext'
import type { Notification } from '../types/api'

const PAGE_SIZE = 20

type NotificationsContextValue = {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const mergeNotification = (items: Notification[], incoming: Notification) => {
  const withoutDuplicate = items.filter((item) => item.id !== incoming.id)

  return [incoming, ...withoutDuplicate]
}

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isReady } = useAuth()
  const { subscribeNotifications, subscribeUnreadCount } = useDataRefresh()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const pageRef = useRef(1)

  const loadUnreadCount = useCallback(async () => {
    const response = await notificationsApi.unreadCount()
    setUnreadCount(response.unread_count)
  }, [])

  const loadPage = useCallback(async (page: number, append: boolean) => {
    const response = await notificationsApi.list({
      page,
      'page-size': PAGE_SIZE,
      desc: true,
    })

    pageRef.current = response.page
    setHasMore(response.has_more)
    setNotifications((prev) => (append ? [...prev, ...response.items] : response.items))
  }, [])

  const refreshSilent = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    await Promise.all([loadPage(1, false), loadUnreadCount()])
  }, [isAuthenticated, loadPage, loadUnreadCount])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    setIsLoading(true)

    try {
      await refreshSilent()
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, refreshSilent])

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || !hasMore || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      await loadPage(pageRef.current + 1, true)
    } finally {
      setIsLoading(false)
    }
  }, [hasMore, isAuthenticated, isLoading, loadPage])

  const markAsRead = useCallback(
    async (id: string) => {
      const updated = await notificationsApi.markRead(id)

      setNotifications((prev) => prev.map((item) => (item.id === id ? updated : item)))
      await loadUnreadCount()
    },
    [loadUnreadCount],
  )

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllRead()
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at ?? new Date().toISOString(),
      })),
    )
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      setHasMore(false)
      pageRef.current = 1
      return
    }

    void refresh()
  }, [isAuthenticated, isReady, refresh])

  useEffect(() => {
    return subscribeNotifications((notification) => {
      setNotifications((prev) => mergeNotification(prev, notification))
      void loadUnreadCount()
    })
  }, [loadUnreadCount, subscribeNotifications])

  useEffect(() => {
    return subscribeUnreadCount(setUnreadCount)
  }, [subscribeUnreadCount])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      hasMore,
      refresh,
      loadMore,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, isLoading, hasMore, refresh, loadMore, markAsRead, markAllAsRead],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationsProvider')
  }

  return context
}
