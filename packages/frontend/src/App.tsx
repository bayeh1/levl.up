import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { Dashboard } from './features/dashboard/Dashboard'
import { TasksTab } from './features/tasks/TasksTab'
import { FinanceTab } from './features/finance/FinanceTab'
import { SettingsTab } from './features/settings/SettingsTab'
import { GoalsTab } from './features/goals/GoalsTab'
import { AddToHomeScreen } from './features/notifications/AddToHomeScreen'
import { OnboardingWizard } from './features/onboarding/OnboardingWizard'

export function App() {
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('levlup-onboarded'))

  return (
    <BrowserRouter>
      <div className="min-h-dvh pb-16">
        {!onboarded && <OnboardingWizard onComplete={() => setOnboarded(true)} />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksTab />} />
          <Route path="/goals" element={<GoalsTab />} />
          <Route path="/finance" element={<FinanceTab />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </div>
      <AddToHomeScreen />
      <TabBar />
    </BrowserRouter>
  )
}
