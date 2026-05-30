import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/endpoints'
import { setUnauthorizedHandler } from '../api/client'
import { tokenStorage } from '../api/tokenStorage'
import type { LoginRequest } from '../types/api'

type AuthContextValue = {
  isAuthenticated: boolean
  isReady: boolean
  userRole: string | null
  login: (payload: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const accessToken = tokenStorage.getAccessToken()
    setIsAuthenticated(Boolean(accessToken))
    setUserRole(getRoleFromToken(accessToken))
    setIsReady(true)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false)
      setUserRole(null)
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const tokens = await authApi.login(payload)
    tokenStorage.setTokens(tokens)
    setIsAuthenticated(true)
    setUserRole(getRoleFromToken(tokens.access_token))
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    tokenStorage.clear()
    setIsAuthenticated(false)
    setUserRole(null)

    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined)
    }
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      userRole,
      login,
      logout,
    }),
    [isAuthenticated, isReady, userRole, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const getRoleFromToken = (token?: string | null) => {
  if (!token) {
    return null
  }

  try {
    const payload = JSON.parse(atob(toBase64(token.split('.')[1] ?? ''))) as Record<string, unknown>
    const role = payload.role ?? payload.user_role

    return typeof role === 'string' ? role : null
  } catch {
    return null
  }
}

const toBase64 = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')

  return normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
