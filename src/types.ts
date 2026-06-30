export type NotificationPreference =
  | 'off'
  | 'same-day'
  | 'one-day-before'
  | 'three-days-before'

export type PeriodRecord = {
  id: string
  startDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AppSettings = {
  expectedCycleLengthInDays: number
  notificationPreference: NotificationPreference
  createdAt?: string
  updatedAt?: string
}

export type ExportPayload = {
  exportedAt: string
  appName: 'CycleKind'
  version: 1
  records: PeriodRecord[]
  settings: AppSettings
}
