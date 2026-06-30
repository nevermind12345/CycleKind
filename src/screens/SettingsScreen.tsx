import { CalendarPlus, Download, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AppSettings, ExportPayload } from '../types'
import { notificationOptions, sendImmediateTestNotification } from '../lib/notifications'
import { MAX_CYCLE_LENGTH, MIN_CYCLE_LENGTH } from '../lib/prediction'
import { createReminderCalendar } from '../lib/calendarExport'

type SettingsScreenProps = {
  settings: AppSettings
  predictedNextStartDate?: string
  onSaveSettings: (settings: AppSettings) => Promise<void>
  onExportData: () => Promise<ExportPayload>
  onImportData: (payload: ExportPayload) => Promise<void>
  onDeleteAllData: () => Promise<void>
}

export function SettingsScreen({
  settings,
  predictedNextStartDate,
  onSaveSettings,
  onExportData,
  onImportData,
  onDeleteAllData,
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notificationMessage, setNotificationMessage] = useState<string>()
  const [cycleLengthDraft, setCycleLengthDraft] = useState(
    String(settings.expectedCycleLengthInDays),
  )
  const [settingsMessage, setSettingsMessage] = useState<string>()
  const [dataMessage, setDataMessage] = useState<string>()
  const [calendarMessage, setCalendarMessage] = useState<string>()

  useEffect(() => {
    setCycleLengthDraft(String(settings.expectedCycleLengthInDays))
  }, [settings.expectedCycleLengthInDays])

  const saveCycleLength = async () => {
    const nextLength = Number(cycleLengthDraft)

    if (
      !Number.isInteger(nextLength) ||
      nextLength < MIN_CYCLE_LENGTH ||
      nextLength > MAX_CYCLE_LENGTH
    ) {
      setSettingsMessage('Enter a whole number from 15 to 90 days.')
      return
    }

    try {
      await onSaveSettings({
        ...settings,
        expectedCycleLengthInDays: nextLength,
      })
      setSettingsMessage('Cycle length saved.')
    } catch {
      setSettingsMessage('Cycle length was not saved.')
    }
  }

  const handleExport = async () => {
    const payload = await onExportData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `cyclekind-export-${payload.exportedAt.slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setDataMessage('Export file prepared.')
  }

  const handleImport = async (file?: File) => {
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      await onImportData(JSON.parse(text) as ExportPayload)
      setDataMessage('Import complete.')
    } catch (cause) {
      setDataMessage(
        cause instanceof Error ? cause.message : 'Import failed. Check the JSON file.',
      )
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCalendarExport = () => {
    if (!predictedNextStartDate) {
      setCalendarMessage('Add a period start date before exporting a reminder.')
      return
    }

    try {
      const calendarText = createReminderCalendar({
        predictedStartDate: predictedNextStartDate,
        preference: settings.notificationPreference,
        generatedAt: new Date(),
      })
      const blob = new Blob([calendarText], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `cyclekind-reminder-${predictedNextStartDate}.ics`
      anchor.click()
      URL.revokeObjectURL(url)
      setCalendarMessage('Calendar reminder file prepared.')
    } catch (cause) {
      setCalendarMessage(
        cause instanceof Error
          ? cause.message
          : 'Calendar reminder export failed.',
      )
    }
  }

  return (
    <div className="screen-stack">
      <section className="card" aria-labelledby="settings-title">
        <h2 id="settings-title" className="section-title">
          Settings
        </h2>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="label-text">Expected cycle length</span>
            <input
              className="field"
              type="number"
              min={MIN_CYCLE_LENGTH}
              max={MAX_CYCLE_LENGTH}
              step={1}
              inputMode="numeric"
              value={cycleLengthDraft}
              onChange={(event) => setCycleLengthDraft(event.target.value)}
            />
            <span className="helper-text">
              CycleKind uses this number to estimate your next period from your
              latest recorded start date. Recommended range: 15 to 90 days.
            </span>
          </label>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void saveCycleLength()}
          >
            Save cycle length
          </button>
          {settingsMessage ? (
            <p className="text-sm text-stone-600" role="status">
              {settingsMessage}
            </p>
          ) : null}

          <fieldset>
            <legend className="label-text">Notification preference</legend>
            <div className="mt-2 grid gap-2">
              {notificationOptions.map((option) => (
                <label key={option.value} className="radio-row">
                  <input
                    type="radio"
                    name="notificationPreference"
                    value={option.value}
                    checked={settings.notificationPreference === option.value}
                    onChange={() =>
                      onSaveSettings({
                        ...settings,
                        notificationPreference: option.value,
                      }).catch(() => {
                        // The parent hook owns the visible error message.
                      })
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <p className="helper-text">
              CycleKind cannot reliably schedule local future notifications inside
              an iPhone PWA. This setting is saved for calendar export now and for
              a future Web Push backend later.
            </p>
            <button
              className="secondary-button mt-3"
              type="button"
              onClick={async () => {
                try {
                  await sendImmediateTestNotification()
                  setNotificationMessage('Test notification sent.')
                } catch (cause) {
                  setNotificationMessage(
                    cause instanceof Error
                      ? cause.message
                      : 'Notification test was not available.',
                  )
                }
              }}
            >
              Test notification permission
            </button>
            {notificationMessage ? (
              <p className="mt-2 text-sm text-stone-600">{notificationMessage}</p>
            ) : null}
          </fieldset>

          <section aria-labelledby="calendar-reminder-title">
            <h3 id="calendar-reminder-title" className="section-title text-base">
              Calendar reminder fallback
            </h3>
            <p className="helper-text">
              Export an `.ics` file for your selected reminder timing. Your
              Calendar app handles the actual alert. Depending on your calendar
              account, this event may sync outside this device.
            </p>
            <button
              className="secondary-button mt-3"
              type="button"
              onClick={handleCalendarExport}
            >
              <CalendarPlus size={18} />
              Export calendar reminder
            </button>
            {calendarMessage ? (
              <p className="mt-2 text-sm text-stone-600" role="status">
                {calendarMessage}
              </p>
            ) : null}
          </section>
        </div>
      </section>

      <section className="card" aria-labelledby="data-title">
        <h2 id="data-title" className="section-title">
          Data
        </h2>
        <div className="mt-5 grid gap-3">
          <button
            className="secondary-button justify-center"
            type="button"
            onClick={() =>
              handleExport().catch(() => setDataMessage('Export failed.'))
            }
          >
            <Download size={18} />
            Export JSON
          </button>
          <button
            className="secondary-button justify-center"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="application/json"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
          {dataMessage ? (
            <p className="text-sm text-stone-600" role="status">
              {dataMessage}
            </p>
          ) : null}
          <button
            className="danger-button"
            type="button"
            onClick={() => {
              if (confirm('Delete all CycleKind data on this device?')) {
                onDeleteAllData().catch(() => {
                  // The parent hook owns the visible error message.
                })
              }
            }}
          >
            Delete all data
          </button>
        </div>
      </section>
    </div>
  )
}
