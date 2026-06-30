import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, ExportPayload, PeriodRecord } from '../types'
import {
  DEFAULT_CYCLE_LENGTH,
  MAX_CYCLE_LENGTH,
  MIN_CYCLE_LENGTH,
} from './prediction'

const SETTINGS_ID = 'settings'
const notificationPreferences = new Set([
  'off',
  'same-day',
  'one-day-before',
  'three-days-before',
])
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

type SettingsRow = AppSettings & {
  id: string
}

class CycleKindDatabase extends Dexie {
  records!: EntityTable<PeriodRecord, 'id'>
  settings!: EntityTable<SettingsRow, 'id'>

  constructor() {
    super('cyclekind-local-data')
    this.version(1).stores({
      records: 'id, startDate, createdAt, updatedAt',
      settings: 'id',
    })
  }
}

export const db = new CycleKindDatabase()

const nowIso = () => new Date().toISOString()

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isValidIsoDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !isoDatePattern.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && value === date.toISOString().slice(0, 10)
}

const isValidIsoDateTime = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value))

const sanitizeSettings = (value: unknown): AppSettings => {
  if (!isPlainObject(value)) {
    throw new Error('Imported settings are missing or invalid.')
  }

  const expectedCycleLengthInDays = Number(value.expectedCycleLengthInDays)
  if (
    !Number.isInteger(expectedCycleLengthInDays) ||
    expectedCycleLengthInDays < MIN_CYCLE_LENGTH ||
    expectedCycleLengthInDays > MAX_CYCLE_LENGTH
  ) {
    throw new Error('Imported cycle length must be a whole number from 15 to 90.')
  }

  if (
    typeof value.notificationPreference !== 'string' ||
    !notificationPreferences.has(value.notificationPreference)
  ) {
    throw new Error('Imported notification preference is invalid.')
  }

  return {
    expectedCycleLengthInDays,
    notificationPreference: value.notificationPreference as AppSettings['notificationPreference'],
    createdAt: isValidIsoDateTime(value.createdAt) ? value.createdAt : nowIso(),
    updatedAt: nowIso(),
  }
}

const sanitizeRecords = (value: unknown): PeriodRecord[] => {
  if (!Array.isArray(value)) {
    throw new Error('Imported records must be an array.')
  }

  const seenDates = new Set<string>()
  const seenIds = new Set<string>()

  return value.map((item) => {
    if (!isPlainObject(item)) {
      throw new Error('Imported record contains invalid data.')
    }

    if (!isValidIsoDate(item.startDate)) {
      throw new Error('Imported record contains an invalid start date.')
    }

    if (seenDates.has(item.startDate)) {
      throw new Error('Imported records contain duplicate start dates.')
    }
    seenDates.add(item.startDate)

    const timestamp = nowIso()
    const id =
      typeof item.id === 'string' && item.id.trim() ? item.id : crypto.randomUUID()

    if (seenIds.has(id)) {
      throw new Error('Imported records contain duplicate record IDs.')
    }
    seenIds.add(id)

    return {
      id,
      startDate: item.startDate,
      notes: typeof item.notes === 'string' && item.notes.trim() ? item.notes.trim() : undefined,
      createdAt: isValidIsoDateTime(item.createdAt) ? item.createdAt : timestamp,
      updatedAt: isValidIsoDateTime(item.updatedAt) ? item.updatedAt : timestamp,
    }
  })
}

export const defaultSettings = (): AppSettings => ({
  expectedCycleLengthInDays: DEFAULT_CYCLE_LENGTH,
  notificationPreference: 'off',
  createdAt: nowIso(),
  updatedAt: nowIso(),
})

export const getSettings = async (): Promise<AppSettings> => {
  const settings = await db.settings.get(SETTINGS_ID)

  if (settings) {
    const { id: _id, ...appSettings } = settings
    void _id
    return appSettings
  }

  const initial = defaultSettings()
  await db.settings.put({ id: SETTINGS_ID, ...initial })
  return initial
}

export const saveSettings = async (settings: AppSettings) => {
  await db.settings.put({
    id: SETTINGS_ID,
    ...settings,
    updatedAt: nowIso(),
  })
}

export const getRecords = async () =>
  db.records.orderBy('startDate').reverse().toArray()

export const addRecord = async (startDate: string, notes?: string) => {
  const timestamp = nowIso()
  const existing = await db.records.where('startDate').equals(startDate).first()

  if (existing) {
    throw new Error('That start date is already recorded.')
  }

  await db.records.add({
    id: crypto.randomUUID(),
    startDate,
    notes: notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export const updateRecord = async (
  id: string,
  startDate: string,
  notes?: string,
) => {
  const existing = await db.records.where('startDate').equals(startDate).first()

  if (existing && existing.id !== id) {
    throw new Error('That start date is already recorded.')
  }

  await db.records.update(id, {
    startDate,
    notes: notes?.trim() || undefined,
    updatedAt: nowIso(),
  })
}

export const deleteRecord = async (id: string) => {
  await db.records.delete(id)
}

export const deleteAllData = async () => {
  await db.transaction('rw', db.records, db.settings, async () => {
    await db.records.clear()
    await db.settings.clear()
    await db.settings.put({ id: SETTINGS_ID, ...defaultSettings() })
  })
}

export const exportData = async (): Promise<ExportPayload> => ({
  exportedAt: nowIso(),
  appName: 'CycleKind',
  version: 1,
  records: await getRecords(),
  settings: await getSettings(),
})

export const importData = async (payload: ExportPayload) => {
  if (
    !isPlainObject(payload) ||
    payload.appName !== 'CycleKind' ||
    payload.version !== 1
  ) {
    throw new Error('This does not look like a CycleKind export file.')
  }

  const records = sanitizeRecords(payload.records)
  const settings = sanitizeSettings(payload.settings)

  await db.transaction('rw', db.records, db.settings, async () => {
    await db.records.clear()
    await db.records.bulkPut(records)
    await db.settings.put({ id: SETTINGS_ID, ...settings })
  })
}
