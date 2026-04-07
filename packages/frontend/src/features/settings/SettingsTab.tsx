import { useState } from 'react'
import { usePushSubscription } from '../notifications/usePushSubscription'
import { resetStreak } from '../../store/streaks'

export function SettingsTab() {
  const [reminderTime, setReminderTime] = useState('09:00')
  const [warningTime, setWarningTime] = useState('20:00')
  const [dailyQuota, setDailyQuota] = useState(() => localStorage.getItem('dailyQuota') ?? '1')
  const [confirmReset, setConfirmReset] = useState(false)
  const { subscribed, loading, error, subscribe, unsubscribe } = usePushSubscription()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">Push Notifications</h2>
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="reminder-time" className="text-sm">Daily reminder</label>
            <input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3]"
            />
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="warning-time" className="text-sm">Streak warning</label>
            <input
              id="warning-time"
              type="time"
              value={warningTime}
              onChange={(e) => setWarningTime(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3]"
            />
          </div>
          <div className="text-xs text-[#8b949e]">Timezone: {timezone}</div>
          {error && <p role="alert" className="text-xs text-[#f85149]">{error}</p>}
          {subscribed ? (
            <button
              onClick={unsubscribe}
              disabled={loading}
              className="w-full bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
            >
              {loading ? 'Loading\u2026' : 'Disable Notifications'}
            </button>
          ) : (
            <button
              onClick={() => subscribe(timezone, reminderTime, warningTime)}
              disabled={loading}
              className="w-full bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
            >
              {loading ? 'Enabling\u2026' : 'Enable Notifications'}
            </button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">Daily Streak Goal</h2>
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] flex justify-between items-center">
          <label htmlFor="daily-quota" className="text-sm">Tasks per day to maintain streak</label>
          <input
            id="daily-quota"
            type="number"
            min="1"
            max="20"
            value={dailyQuota}
            onChange={(e) => { setDailyQuota(e.target.value); localStorage.setItem('dailyQuota', e.target.value) }}
            className="w-16 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3] text-center"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">iOS Install Guide</h2>
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-2">
          <p className="text-sm font-medium">To enable push notifications on iPhone:</p>
          <ol className="text-sm text-[#8b949e] space-y-1 list-decimal list-inside">
            <li>Tap the Share button in Safari</li>
            <li>Tap "Add to Home Screen"</li>
            <li>Open the app from your home screen</li>
            <li>Come back to Settings and tap Enable Notifications</li>
          </ol>
          <p className="text-xs text-[#8b949e]">Requires iOS 16.4+</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-[#f85149]">Danger Zone</h2>
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#f85149]/30 space-y-3">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full bg-[#21262d] text-[#f85149] py-2 rounded-lg text-sm border border-[#f85149]/30"
            >
              Reset Streak
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[#f85149]">Are you sure? This will break your current streak.</p>
              <div className="flex gap-2">
                <button
                  onClick={async () => { await resetStreak(); setConfirmReset(false) }}
                  className="flex-1 bg-[#f85149] text-white py-2 rounded-lg text-sm font-medium"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
