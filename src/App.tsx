import { useMemo, useState } from 'react'
import { CalendarDays, Home, List, Settings } from 'lucide-react'
import { useCycleData } from './hooks/useCycleData'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { RecordsScreen } from './screens/RecordsScreen'
import { SettingsScreen } from './screens/SettingsScreen'

type Screen = 'home' | 'calendar' | 'records' | 'settings'

const navigation: Array<{
  id: Screen
  label: string
  icon: typeof Home
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'records', label: 'Records', icon: List },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const cycleData = useCycleData()

  const activeScreen = useMemo(() => {
    if (!cycleData.settings) {
      return null
    }

    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            latestRecord={cycleData.latestRecord}
            predictedNextStartDate={cycleData.predictedNextStartDate}
            settings={cycleData.settings}
            onAddRecord={cycleData.addPeriodRecord}
          />
        )
      case 'calendar':
        return (
          <CalendarScreen
            records={cycleData.records}
            predictedNextStartDate={cycleData.predictedNextStartDate}
          />
        )
      case 'records':
        return (
          <RecordsScreen
            records={cycleData.records}
            onUpdateRecord={cycleData.updatePeriodRecord}
            onDeleteRecord={cycleData.deletePeriodRecord}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            settings={cycleData.settings}
            predictedNextStartDate={cycleData.predictedNextStartDate}
            onSaveSettings={cycleData.saveAppSettings}
            onExportData={cycleData.exportCycleData}
            onImportData={cycleData.importCycleData}
            onDeleteAllData={cycleData.deleteEverything}
          />
        )
    }
  }, [cycleData, screen])

  return (
    <div className="app-shell">
      <main className="mx-auto min-h-dvh w-full max-w-xl px-4 pb-28 pt-5">
        {cycleData.error ? (
          <div
            className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            {cycleData.error}
          </div>
        ) : null}
        {cycleData.isLoading || !cycleData.settings ? (
          <section className="card text-center text-stone-600">Loading CycleKind...</section>
        ) : (
          activeScreen
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = screen === item.id

          return (
            <button
              key={item.id}
              className={isActive ? 'nav-button active' : 'nav-button'}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setScreen(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App
