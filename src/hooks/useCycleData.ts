import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppSettings, PeriodRecord } from '../types'
import {
  addRecord,
  deleteAllData,
  deleteRecord,
  exportData,
  getRecords,
  getSettings,
  importData,
  saveSettings,
  updateRecord,
} from '../lib/storage'
import { getLatestRecord, predictNextStartDate } from '../lib/prediction'

export const useCycleData = () => {
  const [records, setRecords] = useState<PeriodRecord[]>([])
  const [settings, setSettings] = useState<AppSettings>()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setError(undefined)
    const [nextRecords, nextSettings] = await Promise.all([
      getRecords(),
      getSettings(),
    ])
    setRecords(nextRecords)
    setSettings(nextSettings)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load data.')
      setIsLoading(false)
    })
  }, [refresh])

  const runMutation = async (mutation: () => Promise<void>) => {
    try {
      setError(undefined)
      await mutation()
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong.')
      throw cause
    }
  }

  const latestRecord = useMemo(() => getLatestRecord(records), [records])
  const predictedNextStartDate = useMemo(
    () =>
      predictNextStartDate(
        latestRecord?.startDate,
        settings?.expectedCycleLengthInDays ?? 28,
      ),
    [latestRecord?.startDate, settings?.expectedCycleLengthInDays],
  )

  return {
    records,
    settings,
    latestRecord,
    predictedNextStartDate,
    isLoading,
    error,
    addPeriodRecord: (startDate: string, notes?: string) =>
      runMutation(() => addRecord(startDate, notes)),
    updatePeriodRecord: (id: string, startDate: string, notes?: string) =>
      runMutation(() => updateRecord(id, startDate, notes)),
    deletePeriodRecord: (id: string) => runMutation(() => deleteRecord(id)),
    saveAppSettings: (nextSettings: AppSettings) =>
      runMutation(() => saveSettings(nextSettings)),
    deleteEverything: () => runMutation(deleteAllData),
    importCycleData: (payload: Parameters<typeof importData>[0]) =>
      runMutation(() => importData(payload)),
    exportCycleData: exportData,
  }
}
