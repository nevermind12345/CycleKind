import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { CalendarPlus, Droplets, Heart, Moon, Sparkles, Sun } from 'lucide-react'
import type { AppSettings, PeriodRecord } from '../types'
import { formatFriendlyDate, todayIsoDate } from '../lib/date'
import { PeriodForm } from '../components/PeriodForm'
import mascotImage from '../assets/cyclekind-cat-mascot.png'

type HomeScreenProps = {
  latestRecord?: PeriodRecord
  predictedNextStartDate?: string
  settings: AppSettings
  onAddRecord: (startDate: string, notes?: string) => Promise<void>
}

const comfortPicks = [
  {
    id: 'stretch',
    label: 'Stretch',
    detail: 'Try a slow shoulder roll and a gentle side stretch.',
    icon: Sparkles,
  },
  {
    id: 'water',
    label: 'Water',
    detail: 'Keep a water bottle nearby and sip before you feel thirsty.',
    icon: Droplets,
  },
  {
    id: 'rest',
    label: 'Rest',
    detail: 'Plan one quiet break today, even if it is only five minutes.',
    icon: Moon,
  },
  {
    id: 'warmth',
    label: 'Warmth',
    detail: 'A warm drink or cozy layer can make the day feel easier.',
    icon: Sun,
  },
]

const mascotMessages = [
  'Tiny paws, tiny steps, still counts.',
  'Your cozy cat says soft day mode is allowed.',
  'Sip some water and be gentle with yourself.',
  'A flower for you, because you are doing enough.',
]

export function HomeScreen({
  latestRecord,
  predictedNextStartDate,
  settings,
  onAddRecord,
}: HomeScreenProps) {
  const [selectedComfortId, setSelectedComfortId] = useState(comfortPicks[0].id)
  const [mascotMessageIndex, setMascotMessageIndex] = useState(0)
  const selectedComfort =
    comfortPicks.find((item) => item.id === selectedComfortId) ?? comfortPicks[0]
  const SelectedComfortIcon = selectedComfort.icon
  const daysUntilEstimate = useMemo(() => {
    if (!predictedNextStartDate) {
      return undefined
    }

    return differenceInCalendarDays(
      parseISO(predictedNextStartDate),
      parseISO(todayIsoDate()),
    )
  }, [predictedNextStartDate])
  const cycleProgress = useMemo(() => {
    if (!latestRecord) {
      return 0
    }

    const elapsed = differenceInCalendarDays(
      parseISO(todayIsoDate()),
      parseISO(latestRecord.startDate),
    )
    return Math.min(
      100,
      Math.max(0, Math.round((elapsed / settings.expectedCycleLengthInDays) * 100)),
    )
  }, [latestRecord, settings.expectedCycleLengthInDays])
  const countdownLabel =
    typeof daysUntilEstimate !== 'number'
      ? 'Add a start date to begin'
      : daysUntilEstimate > 1
        ? `${daysUntilEstimate} days to go`
        : daysUntilEstimate === 1
          ? 'About 1 day to go'
          : daysUntilEstimate === 0
            ? 'Estimated for today'
            : `${Math.abs(daysUntilEstimate)} days past estimate`

  return (
    <div className="screen-stack">
      <section className="hero-panel" aria-labelledby="home-title">
        <div className="hero-topline">
          <p className="eyebrow">Private cycle tracking</p>
          <span className="tiny-badge">
            <Heart size={14} />
            Just for you
          </span>
        </div>
        <div className="hero-title-row">
          <div>
            <h1 id="home-title">CycleKind</h1>
            <p className="mt-3 text-base leading-7 text-stone-700">
              Your next period may start around{' '}
              <strong>{formatFriendlyDate(predictedNextStartDate)}</strong>.
            </p>
          </div>
          <div className="countdown-orb" aria-label={countdownLabel}>
            <span>
              {typeof daysUntilEstimate === 'number'
                ? Math.abs(daysUntilEstimate)
                : '--'}
            </span>
            <small>
              {typeof daysUntilEstimate === 'number' && daysUntilEstimate < 0
                ? 'past'
                : 'days'}
            </small>
          </div>
        </div>
        <div className="mascot-row">
          <button
            className="mascot-button"
            type="button"
            aria-label="Tap cat mascot for a gentle note"
            onClick={() =>
              setMascotMessageIndex(
                (current) => (current + 1) % mascotMessages.length,
              )
            }
          >
            <img
              src={mascotImage}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          </button>
          <div className="mascot-note" role="status">
            <span>Cat note</span>
            <strong>{mascotMessages[mascotMessageIndex]}</strong>
          </div>
        </div>
        <div
          className="cycle-progress"
          aria-label={`Cycle progress ${cycleProgress} percent`}
        >
          <span style={{ width: `${cycleProgress}%` }} />
        </div>
        <p className="mt-3 text-sm font-semibold text-rose-900">{countdownLabel}</p>
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

      <section className="card" aria-labelledby="comfort-title">
        <div className="mb-4 flex items-center gap-3">
          <span className="soft-icon mint-icon">
            <SelectedComfortIcon size={20} />
          </span>
          <div>
            <h2 id="comfort-title" className="section-title">
              Pick a comfort quest
            </h2>
            <p className="text-sm text-stone-600">
              Choose one small thing that could make today easier.
            </p>
          </div>
        </div>
        <div
          className="comfort-grid"
          role="list"
          aria-label="Comfort quest choices"
        >
          {comfortPicks.map((pick) => {
            const Icon = pick.icon
            const isSelected = selectedComfortId === pick.id

            return (
              <button
                key={pick.id}
                className={isSelected ? 'comfort-chip selected' : 'comfort-chip'}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedComfortId(pick.id)}
              >
                <Icon size={18} />
                <span>{pick.label}</span>
              </button>
            )
          })}
        </div>
        <p className="comfort-detail" role="status">
          {selectedComfort.detail}
        </p>
      </section>

      <p className="disclaimer">
        CycleKind is for personal tracking only and is not medical advice.
      </p>
    </div>
  )
}
