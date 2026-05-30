import type { Notification } from '../types/api'

export const getNotificationEntityPath = (notification: Notification): string | null => {
  if (!notification.entity_type || !notification.entity_id) {
    return null
  }

  if (notification.entity_type === 'help_request') {
    return `/requests/${notification.entity_id}`
  }

  if (notification.entity_type === 'help_request_report') {
    return `/reports/${notification.entity_id}`
  }

  if (notification.entity_type === 'verification_attempt') {
    return `/verifications/${notification.entity_id}`
  }

  if (notification.entity_type === 'complaint') {
    return `/complaints?status=OPEN`
  }

  return null
}
