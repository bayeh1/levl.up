import type { Task } from '@levl-up/shared'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onComplete, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${task.completed ? 'line-through text-[#8b949e]' : 'text-[#e6edf3]'}`}>
          {task.title}
        </div>
        <div className="text-xs text-[#8b949e] mt-0.5">
          Due {new Date(task.dueDate).toLocaleDateString()} · {task.category}
        </div>
      </div>
      {!task.completed && (
        <button
          aria-label="Complete"
          onClick={() => onComplete(task.id)}
          className="text-xs bg-[#238636] text-white px-3 py-1.5 rounded-lg font-medium shrink-0"
        >
          Complete
        </button>
      )}
      <button
        aria-label="Delete"
        onClick={() => onDelete(task.id)}
        className="text-[#8b949e] hover:text-[#f85149] text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  )
}
