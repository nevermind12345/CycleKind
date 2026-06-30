import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'
import type { PeriodRecord } from '../types'
import { toIsoDate } from './date'

export const DEFAULT_CYCLE_LENGTH = 28
export const MIN_CYCLE_LENGTH = 15
export const MAX_CYCLE_LENGTH = 90

export const getLatestRecord = (records: PeriodRecord[]) =>
  [...records].sort((a, b) => b.startDate.localeCompare(a.startDate))[0]

export const predictNextStartDate = (
  latestRecordedStartDate: string | undefined,
  expectedCycleLengthInDays: number,
) => {
  if (!latestRecordedStartDate) {
    return undefined
  }

  return toIsoDate(
    addDays(parseISO(latestRecordedStartDate), expectedCycleLengthInDays),
  )
}

export const getCycleLengthFromPrevious = (
  currentRecord: PeriodRecord,
  olderRecord: PeriodRecord | undefined,
) => {
  if (!olderRecord) {
    return undefined
  }

  return differenceInCalendarDays(
    parseISO(currentRecord.startDate),
    parseISO(olderRecord.startDate),
  )
}
