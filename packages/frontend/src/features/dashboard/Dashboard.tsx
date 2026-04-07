import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StreakCounter } from './StreakCounter'
import { HealthBar } from './HealthBar'
import { getConsecutiveStreak, getTodayStreak, getStreakHealth } from '../../store/streaks'
import { getTasks } from '../../store/tasks'
import { getSavingsGoals } from '../../store/finance'
import type { Task } from '@levl-up/shared'

export function Dashboard() {
  const [streak, setStreak] = useState(0)
  const [health, setHealth] = useState(1)
  const [completedToday, setCompletedToday] = useState(0)
  const [totalToday, setTotalToday] = useState(0)
  const [nextTask, setNextTask] = useState<Task | null>(null)
  const [savingsProgress, setSavingsProgress] = useState(0)

  useEffect(() => {
    async function load() {
      const [consecutive, todayStreak, tasks, savingsGoals] = await Promise.all([
        getConsecutiveStreak(),
        getTodayStreak(),
        getTasks(),
        getSavingsGoals()
      ])
      setStreak(consecutive)
      const completed = todayStreak?.completedCount ?? 0
      setCompletedToday(completed)
      const todayStr = new Date().toDateString()
      const todayPending = tasks
        .filter((t) => !t.completed && new Date(t.dueDate).toDateString() === todayStr)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      setTotalToday(todayPending.length)
      setNextTask(todayPending[0] ?? null)
      setHealth(getStreakHealth(completed, new Date()))
      if (savingsGoals.length > 0) {
        const avg = Math.round(
          savingsGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount) * 100, 0) /
            savingsGoals.length
        )
        setSavingsProgress(avg)
      } else {
        setSavingsProgress(0)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#1a1a2e] to-[#0d1117]">
      <StreakCounter count={streak} />
      <HealthBar health={health} />

      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <Link to="/tasks" className="bg-[#161b22] rounded-xl p-4 text-center border border-[#30363d]">
          <div className="text-2xl font-bold text-[#58a6ff]">{completedToday}/{totalToday}</div>
          <div className="text-xs text-[#8b949e] mt-1">Tasks Today</div>
        </Link>
        <Link to="/finance" className="bg-[#161b22] rounded-xl p-4 text-center border border-[#30363d]">
          <div className="text-2xl font-bold text-[#3fb950]">{savingsProgress}%</div>
          <div className="text-xs text-[#8b949e] mt-1">Savings</div>
        </Link>
      </div>

      {nextTask && (
        <Link to="/tasks" className="mx-4 bg-[#161b22] rounded-xl p-4 border border-[#30363d] block">
          <div className="text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Next Task</div>
          <div className="font-semibold text-[#ffd200]">{nextTask.title}</div>
          <div className="text-xs text-[#8b949e] mt-1">Due today · streaks on completion</div>
        </Link>
      )}
    </div>
  )
}
