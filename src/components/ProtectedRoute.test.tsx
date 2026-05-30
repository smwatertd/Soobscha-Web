// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../auth/AuthContext'

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={['/requests']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/requests" element={<div>Private content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('ProtectedRoute', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockedUseAuth.mockReset()
  })

  it('shows loader while auth state is not ready', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isReady: false,
      userRole: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderProtected()

    expect(screen.getByText('Загрузка сессии...')).toBeTruthy()
  })

  it('redirects unauthorized users to login page', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isReady: true,
      userRole: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderProtected()

    expect(screen.getByText('Login page')).toBeTruthy()
  })

  it('renders nested route for authenticated users', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isReady: true,
      userRole: 'PARTNER',
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderProtected()

    expect(screen.getByText('Private content')).toBeTruthy()
  })
})
