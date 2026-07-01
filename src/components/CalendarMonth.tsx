import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PeriodRecord } from '../types'
import { formatFriendlyDate, toIsoDate } from '../lib/date'
import { getCycleSpanDetails } from '../lib/cycleSpan'

type CalendarMonthProps = {
  month: Date
  records: PeriodRecord[]
  expectedCycleLengthInDays: number
  predictedNextStartDate?: string
  onMonthChange: (month: Date) => void
}

export function CalendarMonth({
  month,
  records,
  expectedCycleLengthInDays,
  predictedNextStartDate,
  onMonthChange,
}: CalendarMonthProps) {
  const [selectedDate, setSelectedDate] = useState<string>()
  const actualDates = new Set(records.map((record) => record.startDate))
  const gridDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const selectedDetails = useMemo(
    () =>
      selectedDate
        ? getCycleSpanDetails(selectedDate, records, expectedCycleLengthInDays)
        : undefined,
    [expectedCycleLengthInDays, records, selectedDate],
  )

  return (
    <section className="card" aria-labelledby="calendar-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          className="icon-button"
          type="button"
          aria-label="Previous month"
          onClick={() => {
            setSelectedDate(undefined)
            onMonthChange(subMonths(month, 1))
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 id="calendar-title" className="section-title">
          {format(month, 'MMMM yyyy')}
        </h2>
        <button
          className="icon-button"
          type="button"
          aria-label="Next month"
          onClick={() => {
            setSelectedDate(undefined)
            onMonthChange(addMonths(month, 1))
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-500">
        {weekDays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((day) => {
          const isoDate = toIsoDate(day)
          const isActual = actualDates.has(isoDate)
          const isPredicted = predictedNextStartDate === isoDate && !isActual
          const cycleSpanDetails = getCycleSpanDetails(
            isoDate,
            records,
            expectedCycleLengthInDays,
          )
          const isSelected = selectedDate === isoDate
          const labelDate = format(parseISO(isoDate), 'd MMM yyyy')
          const labelParts = [
            labelDate,
            isActual ? 'recorded start date' : '',
            isPredicted ? 'predicted start date' : '',
            cycleSpanDetails ? 'current cycle span' : '',
            isSelected ? 'selected' : '',
          ].filter(Boolean)
          const className = [
            'calendar-day',
            cycleSpanDetails ? 'calendar-day-button' : '',
            isSameMonth(day, month) ? 'text-stone-800' : 'text-stone-300',
            cycleSpanDetails?.className ?? '',
            isSelected ? 'selected-calendar-day' : '',
            isActual ? 'actual-day' : '',
            isPredicted ? 'predicted-day' : '',
          ].join(' ')

          if (cycleSpanDetails) {
            return (
              <button
                key={isoDate}
                className={className}
                type="button"
                aria-label={labelParts.join(', ')}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(isoDate)}
              >
                {format(day, 'd')}
              </button>
            )
          }

          return (
            <div
              key={isoDate}
              className={className}
              aria-label={labelParts.join(', ')}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-600">
        <span className="legend-dot before:bg-rose-300">Recorded start</span>
        <span className="legend-dot before:bg-emerald-200">Cycle span A</span>
        <span className="legend-dot before:bg-sky-200">Cycle span B</span>
        <span className="legend-dot before:border before:border-dashed before:border-rose-500">
          Estimated next start
        </span>
      </div>
      {selectedDetails ? (
        <section className="cycle-detail-panel" aria-labelledby="cycle-detail-title">
          <h3 id="cycle-detail-title" className="section-title text-base">
            Selected cycle details
          </h3>
          <dl className="cycle-detail-grid">
            <div>
              <dt>Period start date</dt>
              <dd>{formatFriendlyDate(selectedDetails.periodStartDate)}</dd>
            </div>
            <div>
              <dt>Expected cycle length</dt>
              <dd>{selectedDetails.expectedCycleLengthInDays} days</dd>
            </div>
            <div>
              <dt>Next estimate</dt>
              <dd>{formatFriendlyDate(selectedDetails.nextEstimate)}</dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{selectedDetails.notes ?? 'No notes recorded'}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </section>
  )
}
