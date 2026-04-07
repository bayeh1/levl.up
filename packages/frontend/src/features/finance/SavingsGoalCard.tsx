import type { SavingsGoal } from '@levl-up/shared'

interface Props {
  goal: SavingsGoal
  onContribute: (goalId: string) => void
}

export function SavingsGoalCard({ goal, onContribute }: Props) {
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{goal.title}</span>
        {goal.linkedStreak && <span className="text-xs text-[#ffd200]">🔥 streak linked</span>}
      </div>
      <div
        role="progressbar"
        aria-label={`${goal.title} savings progress`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-[#21262d] rounded-full h-2 mb-1"
      >
        <div className="h-2 rounded-full bg-[#3fb950] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[#8b949e]">
        <span>${goal.currentAmount} / ${goal.targetAmount}</span>
        <button onClick={() => onContribute(goal.id)} className="text-[#58a6ff]">+ Contribute</button>
      </div>
    </div>
  )
}
