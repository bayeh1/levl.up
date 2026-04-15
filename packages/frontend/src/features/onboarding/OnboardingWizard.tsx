import { useState, useEffect } from 'react'
import { TaskForm } from '../tasks/TaskForm'
import { usePushSubscription } from '../notifications/usePushSubscription'
import { addTask, createTask } from '../../store/tasks'
import type { StreakContribution } from '@levl-up/shared'

interface Props {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const { subscribed, loading: pushLoading, error: pushError, subscribe } = usePushSubscription()
  const [quota, setQuota] = useState(() => localStorage.getItem('dailyQuota') ?? '1')

  function handleFinish() {
    localStorage.setItem('levlup-onboarded', '1')
    onComplete()
  }

  async function handleFirstTask(fields: { title: string; dueDate: Date; category: 'productivity' | 'finance'; streakContribution: StreakContribution }) {
    await addTask(createTask(fields))
    setStep(3)
  }

  function handleQuotaChange(value: string) {
    setQuota(value)
    localStorage.setItem('dailyQuota', value)
  }

  async function handleSubscribe() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    await subscribe(tz, '09:00', '20:00')
  }

  useEffect(() => {
    if (subscribed) handleFinish()
  }, [subscribed])

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117] overflow-y-auto">
      <div className="min-h-full flex flex-col p-6">
        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#ffd200]' : 'bg-[#21262d]'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold mb-2">Welcome to Levl.up</h1>
            <p className="text-[#8b949e] mb-6">Build streaks by completing daily tasks. How many tasks do you want to complete each day?</p>
            <label htmlFor="daily-quota" className="text-xs text-[#8b949e] mb-1 block">Daily task quota</label>
            <input
              id="daily-quota"
              type="number"
              min="1"
              max="20"
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm mb-6"
              value={quota}
              onChange={(e) => handleQuotaChange(e.target.value)}
            />
            <button
              onClick={() => setStep(2)}
              className="bg-[#ffd200] text-[#0d1117] py-3 rounded-xl font-bold"
            >
              Get started →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold mb-2">Add your first task</h1>
            <p className="text-[#8b949e] mb-4">Create a task to complete today and start your streak.</p>
            <TaskForm
              onSubmit={handleFirstTask}
              onCancel={() => setStep(3)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold mb-2">Enable notifications</h1>
            <p className="text-[#8b949e] mb-6">Get daily reminders and streak warnings so you never break your streak.</p>
            {pushError && <p role="alert" className="text-xs text-[#f85149] mb-4">{pushError}</p>}
            <button
              onClick={handleSubscribe}
              disabled={pushLoading || subscribed}
              className="bg-[#238636] text-white py-3 rounded-xl font-bold mb-3 disabled:opacity-50"
            >
              {pushLoading ? 'Enabling…' : subscribed ? 'Enabled ✓' : 'Enable Notifications'}
            </button>
            <button
              onClick={handleFinish}
              className="text-[#58a6ff] py-2 text-sm"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
