import { useEffect, useState } from 'react'
import type { PeriodRecord } from '../types'
import { todayIsoDate } from '../lib/date'

type PeriodFormProps = {
  record?: PeriodRecord
  onSubmit: (startDate: string, notes?: string) => Promise<void>
  onCancel?: () => void
}

export function PeriodForm({ record, onSubmit, onCancel }: PeriodFormProps) {
  const [startDate, setStartDate] = useState(record?.startDate ?? todayIsoDate())
  const [notes, setNotes] = useState(record?.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setStartDate(record?.startDate ?? todayIsoDate())
    setNotes(record?.notes ?? '')
  }, [record])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await onSubmit(startDate, notes)
      if (!record) {
        setStartDate(todayIsoDate())
        setNotes('')
      }
    } catch {
      // The parent hook owns the visible error message.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="label-text">Period start date</span>
        <input
          className="field"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="label-text">Notes, optional</span>
        <textarea
          className="field min-h-24 resize-y"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything gentle you want to remember"
        />
      </label>
      <div className="flex gap-3">
        <button className="primary-button flex-1" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : record ? 'Save changes' : 'Add start date'}
        </button>
        {onCancel ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
