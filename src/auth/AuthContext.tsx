import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/endpoints'
import { setUnauthorizedHandler } from '../api/client'
import { tokenStorage } from '../api/tokenStorage'
import type { LoginRequest } from '../types/api'

type AuthContextValue = {
  isAuthenticated: boolean
  isReady: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsAuthenticated(Boolean(tokenStorage.getAccessToken()))
    setIsReady(true)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setIsAuthenticated(false))

    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const tokens = await authApi.login(payload)
    tokenStorage.setTokens(tokens)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    tokenStorage.clear()
    setIsAuthenticated(false)

    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined)
    }
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      login,
      logout,
    }),
    [isAuthenticated, isReady, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
