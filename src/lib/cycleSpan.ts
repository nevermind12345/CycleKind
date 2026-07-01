import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'
import type { PeriodRecord } from '../types'
import { toIsoDate } from './date'

export type CycleSpanClass = 'cycle-span-day-a' | 'cycle-span-day-b'

export type CycleSpanDetails = {
  className: CycleSpanClass
  periodStartDate: string
  expectedCycleLengthInDays: number
  nextEstimate: string
  notes?: string
}

const getAnchorCycleOrdinal = (
  sortedRecords: PeriodRecord[],
  anchorIndex: number,
  expectedCycleLengthInDays: number,
) => {
  let ordinal = 0

  for (let index = 1; index <= anchorIndex; index += 1) {
    const previousStartDate = parseISO(sortedRecords[index - 1].startDate)
    const currentStartDate = parseISO(sortedRecords[index].startDate)
    const daysSincePrevious = differenceInCalendarDays(
      currentStartDate,
      previousStartDate,
    )

    ordinal += Math.floor(daysSincePrevious / expectedCycleLengthInDays)
  }

  return ordinal
}

export const getCycleSpanDetails = (
  isoDate: string,
  records: PeriodRecord[],
  expectedCycleLengthInDays: number,
): CycleSpanDetails | undefined => {
  const sortedRecords = [...records].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  )
  const sortedStartDates = sortedRecords.map((record) => record.startDate)

  if (sortedStartDates.length === 0 || expectedCycleLengthInDays <= 0) {
    return undefined
  }

  const targetDate = parseISO(isoDate)
  const anchorIndex = sortedStartDates.findLastIndex(
    (startDate) => startDate <= isoDate,
  )

  if (anchorIndex === -1) {
    return undefined
  }

  const anchorRecord = sortedRecords[anchorIndex]
  const anchorDate = parseISO(anchorRecord.startDate)
  const nextRecordedStartDate = sortedStartDates[anchorIndex + 1]
  const dayOffset = differenceInCalendarDays(targetDate, anchorDate)
  const isLatestRecordedCycle = anchorIndex === sortedRecords.length - 1
  const anchorCycleOrdinal = getAnchorCycleOrdinal(
    sortedRecords,
    anchorIndex,
    expectedCycleLengthInDays,
  )

  if (isLatestRecordedCycle && dayOffset > expectedCycleLengthInDays) {
    return undefined
  }

  let cycleOffset = Math.floor(dayOffset / expectedCycleLengthInDays)

  if (isLatestRecordedCycle && dayOffset === expectedCycleLengthInDays) {
    cycleOffset = 0
  }

  const cycleIndex = anchorCycleOrdinal + cycleOffset
  const cycleStartDate = addDays(
    anchorDate,
    cycleOffset * expectedCycleLengthInDays,
  )
  const cycleEndDate = addDays(cycleStartDate, expectedCycleLengthInDays)

  if (
    nextRecordedStartDate &&
    differenceInCalendarDays(cycleEndDate, parseISO(nextRecordedStartDate)) > 0
  ) {
    return undefined
  }

  const periodStartDate = toIsoDate(cycleStartDate)
  const matchingRecord = sortedRecords.find(
    (record) => record.startDate === periodStartDate,
  )

  return {
    className: cycleIndex % 2 === 0 ? 'cycle-span-day-a' : 'cycle-span-day-b',
    periodStartDate,
    expectedCycleLengthInDays,
    nextEstimate: toIsoDate(cycleEndDate),
    notes: matchingRecord?.notes,
  }
}

export const getCycleSpanClass = (
  isoDate: string,
  records: PeriodRecord[],
  expectedCycleLengthInDays: number,
): CycleSpanClass | undefined =>
  getCycleSpanDetails(isoDate, records, expectedCycleLengthInDays)?.className
