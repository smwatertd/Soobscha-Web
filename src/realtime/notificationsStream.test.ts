import { describe, expect, it } from 'vitest'
import { parseNotificationStreamPayload } from './notificationsStream'

describe('parseNotificationStreamPayload', () => {
  it('parses notification payloads from stream data', () => {
    const payload = JSON.stringify({
      id: 'n-1',
      type: 'help_request.submitted_for_moderation',
      title: 'Новая заявка',
      body: 'Требуется модерация',
    })

    const result = parseNotificationStreamPayload(payload)

    expect(result).toEqual({
      kind: 'notification',
      notification: {
        id: 'n-1',
        type: 'help_request.submitted_for_moderation',
        title: 'Новая заявка',
        body: 'Требуется модерация',
      },
    })
  })

  it('parses unread counter and ignores ping noise', () => {
    expect(parseNotificationStreamPayload(JSON.stringify({ unread_count: 7 }))).toEqual({
      kind: 'unread_count',
      unread_count: 7,
    })

    expect(parseNotificationStreamPayload('ping')).toBeNull()
    expect(parseNotificationStreamPayload(': ping')).toBeNull()
  })

  it('maps refresh event types to refresh messages', () => {
    expect(parseNotificationStreamPayload('{}', 'refresh')).toEqual({ kind: 'refresh' })
    expect(parseNotificationStreamPayload('{}', 'invalidate')).toEqual({ kind: 'refresh' })
  })
})
