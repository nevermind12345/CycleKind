import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { PeriodRecord } from '../types'
import { PeriodForm } from '../components/PeriodForm'
import { formatFriendlyDate } from '../lib/date'
import { getCycleLengthFromPrevious } from '../lib/prediction'

type RecordsScreenProps = {
  records: PeriodRecord[]
  onUpdateRecord: (id: string, startDate: string, notes?: string) => Promise<void>
  onDeleteRecord: (id: string) => Promise<void>
}

export function RecordsScreen({
  records,
  onUpdateRecord,
  onDeleteRecord,
}: RecordsScreenProps) {
  const [editingRecord, setEditingRecord] = useState<PeriodRecord>()
  const oldestFirst = useMemo(
    () => [...records].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [records],
  )

  useEffect(() => {
    if (!editingRecord) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditingRecord(undefined)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingRecord])

  return (
    <div className="screen-stack">
      {editingRecord ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingRecord(undefined)
            }
          }}
        >
          <section
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-record-title"
          >
            <h2 id="edit-record-title" className="section-title mb-4">
              Edit record
            </h2>
            <PeriodForm
              record={editingRecord}
              onCancel={() => setEditingRecord(undefined)}
              onSubmit={async (startDate, notes) => {
                await onUpdateRecord(editingRecord.id, startDate, notes)
                setEditingRecord(undefined)
              }}
            />
          </section>
        </div>
      ) : null}

      <section className="card" aria-labelledby="records-title">
        <h2 id="records-title" className="section-title">
          Period records
        </h2>
        <p className="mt-1 text-sm text-stone-600">Newest records are shown first.</p>

        {records.length === 0 ? (
          <div className="empty-card mt-5">
            No period start dates yet. Add one from the Home screen when you are
            ready.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {records.map((record) => {
              const oldestIndex = oldestFirst.findIndex((item) => item.id === record.id)
              const previous = oldestFirst[oldestIndex - 1]
              const cycleLength = getCycleLengthFromPrevious(record, previous)

              return (
                <article key={record.id} className="record-row">
                  <div>
                    <h3 className="font-semibold text-stone-900">
                      {formatFriendlyDate(record.startDate)}
                    </h3>
                    <p className="text-sm text-stone-600">
                      {cycleLength
                        ? `${cycleLength} days since previous recorded start`
                        : 'First recorded start'}
                    </p>
                    {record.notes ? (
                      <p className="mt-2 text-sm text-stone-700">{record.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Edit record"
                      onClick={() => setEditingRecord(record)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="icon-button danger-icon"
                      type="button"
                      aria-label="Delete record"
                      onClick={() => {
                        if (confirm('Delete this period start date?')) {
                          onDeleteRecord(record.id).catch(() => {
                            // The parent hook owns the visible error message.
                          })
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
