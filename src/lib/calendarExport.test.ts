import { describe, expect, it } from 'vitest'
import { createReminderCalendar } from './calendarExport'

describe('calendar reminder export', () => {
  it('exports an all-day reminder on the predicted day', () => {
    const calendar = createReminderCalendar({
      predictedStartDate: '2026-07-20',
      preference: 'same-day',
      generatedAt: new Date('2026-07-01T10:20:30.000Z'),
    })

    expect(calendar).toContain('BEGIN:VCALENDAR')
    expect(calendar).toContain('DTSTAMP:20260701T102030Z')
    expect(calendar).toContain('DTSTART;VALUE=DATE:20260720')
    expect(calendar).toContain('DTEND;VALUE=DATE:20260721')
    expect(calendar).toContain('SUMMARY:CycleKind reminder')
    expect(calendar).toContain('BEGIN:VALARM')
  })

  it('exports the reminder before the predicted date when requested', () => {
    const calendar = createReminderCalendar({
      predictedStartDate: '2026-07-20',
      preference: 'three-days-before',
      generatedAt: new Date('2026-07-01T10:20:30.000Z'),
    })

    expect(calendar).toContain('DTSTART;VALUE=DATE:20260717')
  })

  it('does not export when reminders are off', () => {
    expect(() =>
      createReminderCalendar({
        predictedStartDate: '2026-07-20',
        preference: 'off',
        generatedAt: new Date('2026-07-01T10:20:30.000Z'),
      }),
    ).toThrow('Choose a reminder preference')
  })
})
