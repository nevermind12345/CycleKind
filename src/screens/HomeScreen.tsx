import { CalendarPlus } from 'lucide-react'
import type { AppSettings, PeriodRecord } from '../types'
import { formatFriendlyDate } from '../lib/date'
import { PeriodForm } from '../components/PeriodForm'

type HomeScreenProps = {
  latestRecord?: PeriodRecord
  predictedNextStartDate?: string
  settings: AppSettings
  onAddRecord: (startDate: string, notes?: string) => Promise<void>
}

export function HomeScreen({
  latestRecord,
  predictedNextStartDate,
  settings,
  onAddRecord,
}: HomeScreenProps) {
  return (
    <div className="screen-stack">
      <section className="hero-panel" aria-labelledby="home-title">
        <p className="eyebrow">Private cycle tracking</p>
        <h1 id="home-title">CycleKind</h1>
        <p className="mt-3 text-base leading-7 text-stone-700">
          Your next period may start around{' '}
          <strong>{formatFriendlyDate(predictedNextStartDate)}</strong>.
        </p>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Estimated based on your selected cycle length. If your cycle starts
          earlier or later, record the actual start date and CycleKind will
          update.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="stat-card">
          <span>Last recorded start</span>
          <strong>{formatFriendlyDate(latestRecord?.startDate)}</strong>
        </article>
        <article className="stat-card">
          <span>Expected cycle length</span>
          <strong>{settings.expectedCycleLengthInDays} days</strong>
        </article>
        <article className="stat-card">
          <span>Next estimate</span>
          <strong>{formatFriendlyDate(predictedNextStartDate)}</strong>
        </article>
      </section>

      <section className="card" aria-labelledby="add-period-title">
        <div className="mb-4 flex items-center gap-3">
          <span className="soft-icon">
            <CalendarPlus size={20} />
          </span>
          <div>
            <h2 id="add-period-title" className="section-title">
              Add a period start date
            </h2>
            <p className="text-sm text-stone-600">
              Only record actual starts. Predicted dates stay virtual.
            </p>
          </div>
        </div>
        <PeriodForm onSubmit={onAddRecord} />
      </section>

      <p className="disclaimer">
        CycleKind is for personal tracking only and is not medical advice.
      </p>
    </div>
  )
}
