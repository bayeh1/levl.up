import { getPieceCount, getRevealedPieces } from '../../store/goals'
import { PuzzleBoard } from './PuzzleBoard'
import type { Goal, Task } from '@levl-up/shared'

interface Props {
  goal: Goal
  tasks: Task[]
  onComplete?: (id: string) => void
}

export function GoalCard({ goal, tasks, onComplete }: Props) {
  const totalPieces = getPieceCount(goal)
  const revealed = getRevealedPieces(goal, tasks)

  return (
    <div className={`bg-[#161b22] rounded-xl p-4 border ${goal.completed ? 'border-[#ffd200]' : 'border-[#30363d]'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#e6edf3]">{goal.title}</span>
            {goal.period && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${goal.period === 'monthly' ? 'bg-[#1f3d57] text-[#58a6ff]' : 'bg-[#1a3a27] text-[#3fb950]'}`}>
                {goal.period === 'monthly' ? 'Monthly' : 'Weekly'}
              </span>
            )}
          </div>
          <div className="text-xs text-[#8b949e] mt-0.5">
            Due {new Date(goal.deadline).toLocaleDateString()}
          </div>
        </div>
        {goal.completed && (
          <span className="text-xs bg-[#ffd200] text-[#0d1117] px-2 py-0.5 rounded-full font-medium">
            Completed ✓
          </span>
        )}
      </div>
      <PuzzleBoard totalPieces={totalPieces} revealedPieces={revealed} imageId={goal.puzzleImageId} />
      <div className="text-xs text-[#8b949e] mt-2">
        {revealed} / {totalPieces} pieces
        {goal.lastResetAt && !goal.completed && (
          <span className="text-[#f85149] ml-2">— streak reset {goal.lastResetAt}</span>
        )}
      </div>
      {onComplete && !goal.completed && (
        <button
          onClick={() => onComplete(goal.id)}
          className="mt-2 text-xs text-[#58a6ff]"
        >
          Mark complete
        </button>
      )}
    </div>
  )
}
