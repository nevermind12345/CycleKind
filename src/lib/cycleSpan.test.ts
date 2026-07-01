import { describe, expect, it } from 'vitest'
import type { PeriodRecord } from '../types'
import { getCycleSpanClass, getCycleSpanDetails } from './cycleSpan'

const record = (
  id: string,
  startDate: string,
  notes?: string,
): PeriodRecord => ({
  id,
  startDate,
  notes,
  createdAt: `${startDate}T00:00:00.000Z`,
  updatedAt: `${startDate}T00:00:00.000Z`,
})

describe('cycle span calendar marker', () => {
  it('marks only the latest recorded cycle through its next estimate', () => {
    const records = [record('july', '2026-07-01')]

    expect(getCycleSpanClass('2026-06-30', records, 28)).toBeUndefined()
    expect(getCycleSpanClass('2026-07-01', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-07-28', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-07-29', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-07-30', records, 28)).toBeUndefined()
  })

  it('resets the marker color when a later actual start date anchors a new cycle', () => {
    const records = [
      record('july', '2026-07-01'),
      record('august', '2026-08-29', 'Light cramps.'),
    ]

    expect(getCycleSpanClass('2026-07-28', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-07-29', records, 28)).toBe(
      'cycle-span-day-b',
    )
    expect(getCycleSpanClass('2026-08-25', records, 28)).toBe(
      'cycle-span-day-b',
    )
    expect(getCycleSpanClass('2026-08-26', records, 28)).toBeUndefined()
    expect(getCycleSpanClass('2026-08-29', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-09-25', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-09-26', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-09-27', records, 28)).toBeUndefined()
  })

  it('uses the second marker color when the next actual start is one full cycle later', () => {
    const records = [
      record('july', '2026-07-01'),
      record('july-next', '2026-07-29'),
    ]

    expect(getCycleSpanClass('2026-07-28', records, 28)).toBe(
      'cycle-span-day-a',
    )
    expect(getCycleSpanClass('2026-07-29', records, 28)).toBe(
      'cycle-span-day-b',
    )
    expect(getCycleSpanClass('2026-08-26', records, 28)).toBe(
      'cycle-span-day-b',
    )
    expect(getCycleSpanClass('2026-08-27', records, 28)).toBeUndefined()
  })

  it('returns details for the selected marked cycle date', () => {
    const details = getCycleSpanDetails(
      '2026-09-26',
      [record('august', '2026-08-29', 'Light cramps.')],
      28,
    )

    expect(details).toMatchObject({
      className: 'cycle-span-day-a',
      periodStartDate: '2026-08-29',
      expectedCycleLengthInDays: 28,
      nextEstimate: '2026-09-26',
      notes: 'Light cramps.',
    })

    expect(
      getCycleSpanDetails(
        '2026-09-27',
        [record('august', '2026-08-29', 'Light cramps.')],
        28,
      ),
    ).toBeUndefined()
  })

  it('uses actual record notes when the selected block starts on a saved period start date', () => {
    const details = getCycleSpanDetails(
      '2026-09-26',
      [
        record('july', '2026-07-01'),
        record('august', '2026-08-29', 'Light cramps.'),
      ],
      28,
    )

    expect(details).toMatchObject({
      className: 'cycle-span-day-a',
      periodStartDate: '2026-08-29',
      expectedCycleLengthInDays: 28,
      nextEstimate: '2026-09-26',
      notes: 'Light cramps.',
    })
  })
})
