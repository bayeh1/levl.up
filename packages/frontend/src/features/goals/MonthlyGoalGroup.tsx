import { GoalCard } from './GoalCard'
import type { Goal, Task } from '@levl-up/shared'

interface Props {
  monthlyGoal: Goal
  weeklyGoals: Goal[]
  tasks: Task[]
  onComplete: (id: string) => void
  onAddWeekly: (parentId: string) => void
}

export function MonthlyGoalGroup({ monthlyGoal, weeklyGoals, tasks, onComplete, onAddWeekly }: Props) {
  return (
    <div className="space-y-2">
      <GoalCard goal={monthlyGoal} tasks={tasks} onComplete={onComplete} />
      {weeklyGoals.length > 0 && (
        <div className="ml-4 border-l-2 border-[#30363d] pl-3 space-y-2">
          {weeklyGoals.map((g) => (
            <GoalCard key={g.id} goal={g} tasks={tasks} onComplete={onComplete} />
          ))}
        </div>
      )}
      <button
        onClick={() => onAddWeekly(monthlyGoal.id)}
        className="ml-4 text-sm text-[#58a6ff]"
      >
        + Add weekly goal
      </button>
    </div>
  )
}
