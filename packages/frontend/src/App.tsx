import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { Dashboard } from './features/dashboard/Dashboard'
import { TasksTab } from './features/tasks/TasksTab'
import { FinanceTab } from './features/finance/FinanceTab'
import { SettingsTab } from './features/settings/SettingsTab'
import { AddToHomeScreen } from './features/notifications/AddToHomeScreen'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksTab />} />
          <Route path="/finance" element={<FinanceTab />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </div>
      <AddToHomeScreen />
      <TabBar />
    </BrowserRouter>
  )
}
