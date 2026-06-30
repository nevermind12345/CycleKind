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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PeriodRecord } from '../types'
import { toIsoDate } from '../lib/date'

type CalendarMonthProps = {
  month: Date
  records: PeriodRecord[]
  predictedNextStartDate?: string
  onMonthChange: (month: Date) => void
}

export function CalendarMonth({
  month,
  records,
  predictedNextStartDate,
  onMonthChange,
}: CalendarMonthProps) {
  const actualDates = new Set(records.map((record) => record.startDate))
  const gridDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <section className="card" aria-labelledby="calendar-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          className="icon-button"
          type="button"
          aria-label="Previous month"
          onClick={() => onMonthChange(subMonths(month, 1))}
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
          onClick={() => onMonthChange(addMonths(month, 1))}
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
          const labelDate = format(parseISO(isoDate), 'd MMM yyyy')

          return (
            <div
              key={isoDate}
              className={[
                'calendar-day',
                isSameMonth(day, month) ? 'text-stone-800' : 'text-stone-300',
                isActual ? 'actual-day' : '',
                isPredicted ? 'predicted-day' : '',
              ].join(' ')}
              aria-label={`${labelDate}${isActual ? ', recorded start date' : ''}${
                isPredicted ? ', predicted start date' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-600">
        <span className="legend-dot before:bg-rose-300">Recorded start</span>
        <span className="legend-dot before:border before:border-dashed before:border-violet-500">
          Estimated next start
        </span>
      </div>
    </section>
  )
}
