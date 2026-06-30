import type { NotificationPreference } from '../types'

export const notificationOptions: Array<{
  value: NotificationPreference
  label: string
}> = [
  { value: 'off', label: 'Off' },
  { value: 'same-day', label: 'On predicted day' },
  { value: 'one-day-before', label: '1 day before' },
  { value: 'three-days-before', label: '3 days before' },
]

export const canTestNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window

export const sendImmediateTestNotification = async () => {
  if (!canTestNotifications()) {
    throw new Error('This browser does not expose the Notification API.')
  }

  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission

  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  new Notification('CycleKind test', {
    body: 'This is only a permission test, not a scheduled reminder.',
  })
}

// TODO: Add real Web Push scheduling only when a push backend and iOS install flow exist.
