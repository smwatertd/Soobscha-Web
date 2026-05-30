// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RequestsListPage } from './RequestsListPage'
import { helpRequestsApi } from '../api/endpoints'

vi.mock('../api/endpoints', () => ({
  helpRequestsApi: {
    list: vi.fn(),
  },
}))

vi.mock('../hooks/useHelpRequestCategories', () => ({
  useHelpRequestCategories: () => ({
    MEDICINE: 'Лекарства',
  }),
}))

vi.mock('../hooks/useRealtimeRefresh', () => ({
  useRealtimeRefresh: () => undefined,
}))

describe('RequestsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads and renders request rows with default moderation filter', async () => {
    vi.mocked(helpRequestsApi.list).mockResolvedValue({
      page: 1,
      page_size: 20,
      total_count: 1,
      has_more: false,
      items: [
        {
          id: 'req-1',
          beneficiary_user_id: 'user-1',
          type: 'MATERIAL',
          title: 'Покупка лекарств',
          description: 'Нужна помощь',
          category: 'MEDICINE',
          status: 'PENDING_MODERATION',
          amount_requested_kopeks: 100_000,
          amount_collected_kopeks: 0,
          created_at: '2026-05-01T10:00:00Z',
        },
      ],
    })

    render(
      <MemoryRouter>
        <RequestsListPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(helpRequestsApi.list).toHaveBeenCalledTimes(1))
    expect(helpRequestsApi.list).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: 'PENDING_MODERATION',
        page: 1,
      }),
    )
    expect(screen.getByText('Покупка лекарств')).toBeTruthy()
  })

  it('shows error block when request fails', async () => {
    vi.mocked(helpRequestsApi.list).mockRejectedValue(new Error('Сервис недоступен'))

    render(
      <MemoryRouter>
        <RequestsListPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(screen.getByText('Ошибка загрузки')).toBeTruthy())
    expect(screen.getByText('Сервис недоступен')).toBeTruthy()
  })
})
