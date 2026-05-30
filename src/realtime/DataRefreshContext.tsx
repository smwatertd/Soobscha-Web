import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Notification } from '../types/api'
import { connectNotificationsStream } from './notificationsStream'

type DataRefreshContextValue = {
  tick: number
  subscribeNotifications: (handler: (notification: Notification) => void) => () => void
  subscribeUnreadCount: (handler: (count: number) => void) => () => void
}

const DataRefreshContext = createContext<DataRefreshContextValue | null>(null)

export const DataRefreshProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isReady } = useAuth()
  const [tick, setTick] = useState(0)
  const notificationListenersRef = useRef(new Set<(notification: Notification) => void>())
  const unreadListenersRef = useRef(new Set<(count: number) => void>())

  const bumpTick = useCallback(() => {
    setTick((value) => value + 1)
  }, [])

  const subscribeNotifications = useCallback((handler: (notification: Notification) => void) => {
    notificationListenersRef.current.add(handler)

    return () => {
      notificationListenersRef.current.delete(handler)
    }
  }, [])

  const subscribeUnreadCount = useCallback((handler: (count: number) => void) => {
    unreadListenersRef.current.add(handler)

    return () => {
      unreadListenersRef.current.delete(handler)
    }
  }, [])

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      setTick(0)
      return
    }

    return connectNotificationsStream({
      onMessage: (message) => {
        if (message.kind === 'notification') {
          notificationListenersRef.current.forEach((handler) => handler(message.notification))
        }

        if (message.kind === 'unread_count') {
          unreadListenersRef.current.forEach((handler) => handler(message.unread_count))
        }

        bumpTick()
      },
    })
  }, [bumpTick, isAuthenticated, isReady])

  const value = useMemo(
    () => ({
      tick,
      subscribeNotifications,
      subscribeUnreadCount,
    }),
    [tick, subscribeNotifications, subscribeUnreadCount],
  )

  return <DataRefreshContext.Provider value={value}>{children}</DataRefreshContext.Provider>
}

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext)

  if (!context) {
    throw new Error('useDataRefresh must be used inside DataRefreshProvider')
  }

  return context
}
