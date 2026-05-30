// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireRole } from './RequireRole'
import { useAuth } from '../auth/AuthContext'

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

describe('RequireRole', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockedUseAuth.mockReset()
  })

  it('renders protected content when role matches', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isReady: true,
      userRole: 'ADMIN',
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="/admin" element={<div>Admin dashboard</div>} />
          </Route>
          <Route path="/" element={<div>Partner home</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin dashboard')).toBeTruthy()
  })

  it('redirects to admin section when partner role is required', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isReady: true,
      userRole: 'ADMIN',
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/requests']}>
        <Routes>
          <Route element={<RequireRole role="PARTNER" />}>
            <Route path="/requests" element={<div>Partner requests</div>} />
          </Route>
          <Route path="/admin" element={<div>Admin dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Admin dashboard').length).toBeGreaterThan(0)
  })
})
