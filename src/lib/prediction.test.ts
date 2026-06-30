import { describe, expect, it } from 'vitest'
import type { PeriodRecord } from '../types'
import {
  getCycleLengthFromPrevious,
  getLatestRecord,
  predictNextStartDate,
} from './prediction'

const record = (id: string, startDate: string): PeriodRecord => ({
  id,
  startDate,
  createdAt: `${startDate}T00:00:00.000Z`,
  updatedAt: `${startDate}T00:00:00.000Z`,
})

describe('prediction logic', () => {
  it('predicts from the latest actual recorded start date', () => {
    expect(predictNextStartDate('2026-06-01', 28)).toBe('2026-06-29')
  })

  it('does not predict without a recorded start date', () => {
    expect(predictNextStartDate(undefined, 28)).toBeUndefined()
  })

  it('finds the latest record by start date', () => {
    expect(
      getLatestRecord([
        record('older', '2026-04-01'),
        record('latest', '2026-05-03'),
      ])?.id,
    ).toBe('latest')
  })

  it('calculates cycle length between actual records', () => {
    expect(
      getCycleLengthFromPrevious(
        record('current', '2026-06-02'),
        record('previous', '2026-05-05'),
      ),
    ).toBe(28)
  })
})
