// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ActionPanel } from './ActionPanel'

describe('ActionPanel', () => {
  beforeEach(() => {
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

  it('shows empty state when no actions available', () => {
    render(<ActionPanel actions={[]} />)

    expect(screen.getByText('Для текущего статуса нет доступных действий.')).toBeTruthy()
  })

  it('calls onApprove handler', async () => {
    const onApprove = vi.fn().mockResolvedValue(undefined)

    render(<ActionPanel actions={['approve']} onApprove={onApprove} />)

    fireEvent.click(screen.getByRole('button', { name: /Одобрить/ }))

    await waitFor(() => expect(onApprove).toHaveBeenCalledTimes(1))
  })

  it('opens reason modal for reject action', () => {
    render(<ActionPanel actions={['reject']} />)

    fireEvent.click(screen.getByRole('button', { name: /Отклонить/ }))

    expect(screen.getByText('Причина')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /Отклонить/ }).length).toBeGreaterThan(0)
  })
})
