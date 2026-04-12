import { useState } from 'react'
import type { Task } from '@levl-up/shared'

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

interface Props {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onComplete, onDelete }: Props) {
  const [completing, setCompleting] = useState(false)

  function handleComplete() {
    setCompleting(true)
    onComplete(task.id)
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl p-4 border transition-colors duration-300 ${
      completing ? 'bg-[#1a3a27] border-[#3fb950]' : 'bg-[#161b22] border-[#30363d]'
    }`}>
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${task.completed ? 'line-through text-[#8b949e]' : 'text-[#e6edf3]'}`}>
          {task.title}
        </div>
        {task.completed && task.completedDate && (
          <div className="text-xs text-[#3fb950] mt-0.5">
            Completed in {formatDuration(new Date(task.completedDate).getTime() - new Date(task.startDate).getTime())}
          </div>
        )}
        <div className="text-xs text-[#8b949e] mt-0.5">
          Due {new Date(task.dueDate).toLocaleDateString()} · {task.category}
        </div>
      </div>
      {!task.completed && (
        <button
          aria-label="Complete"
          onClick={handleComplete}
          className="text-xs bg-[#238636] text-white px-3 py-1.5 rounded-lg font-medium shrink-0"
        >
          {completing ? '✓' : 'Complete'}
        </button>
      )}
      <button
        aria-label={`Delete ${task.title}`}
        onClick={() => onDelete(task.id)}
        className="text-[#8b949e] hover:text-[#f85149] text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  )
}
