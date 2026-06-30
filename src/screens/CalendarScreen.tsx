import { useState } from 'react'
import { parseISO } from 'date-fns'
import type { PeriodRecord } from '../types'
import { CalendarMonth } from '../components/CalendarMonth'

type CalendarScreenProps = {
  records: PeriodRecord[]
  predictedNextStartDate?: string
}

export function CalendarScreen({
  records,
  predictedNextStartDate,
}: CalendarScreenProps) {
  const [month, setMonth] = useState(
    predictedNextStartDate ? parseISO(predictedNextStartDate) : new Date(),
  )

  return (
    <div className="screen-stack">
      <CalendarMonth
        month={month}
        records={records}
        predictedNextStartDate={predictedNextStartDate}
        onMonthChange={setMonth}
      />
      {records.length === 0 ? (
        <section className="empty-card">
          Add your first period start date to see it on the calendar.
        </section>
      ) : null}
    </div>
  )
}
