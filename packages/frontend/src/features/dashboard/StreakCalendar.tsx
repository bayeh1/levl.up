import type { Streak } from '@levl-up/shared'

interface Props {
  streaks: Streak[]
}

export function StreakCalendar({ streaks }: Props) {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    days.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - i)).toISOString().slice(0, 10))
  }

  const streakMap = new Map(streaks.map((s) => [s.date, s]))

  let longest = 0
  let current = 0
  for (const day of days) {
    const s = streakMap.get(day)
    if (s && s.completedCount > 0 && !s.broken) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }

  return (
    <div className="px-4 mb-4">
      <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
        <div className="text-xs uppercase tracking-wide text-[#8b949e] mb-3">30-Day History</div>
        <div className="grid grid-cols-10 gap-1">
          {days.map((day) => {
            const s = streakMap.get(day)
            let bg = 'bg-[#21262d]'
            if (s && s.broken) bg = 'bg-[#f85149]'
            else if (s && s.completedCount > 0) bg = 'bg-[#3fb950]'
            return <div key={day} className={`w-7 h-7 rounded-md ${bg}`} title={day} />
          })}
        </div>
        <div className="text-xs text-[#8b949e] mt-3">Longest streak: <span className="text-[#ffd200] font-medium">{longest} days</span></div>
      </div>
    </div>
  )
}
