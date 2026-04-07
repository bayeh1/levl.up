import { useState } from 'react'
import type { StreakContribution } from '@levl-up/shared'

interface Fields {
  title: string
  dueDate: Date
  category: 'productivity' | 'finance'
  streakContribution: StreakContribution
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
}

export function TaskForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<'productivity' | 'finance'>('productivity')
  const [streakContribution, setStreakContribution] = useState<StreakContribution>('full')

  function handleSubmit() {
    if (!title.trim()) return
    onSubmit({ title: title.trim(), dueDate: new Date(dueDate), category, streakContribution })
  }

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3">
      <input
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <select
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value as 'productivity' | 'finance')}
      >
        <option value="productivity">Productivity</option>
        <option value="finance">Finance</option>
      </select>
      <select
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={streakContribution}
        onChange={(e) => setStreakContribution(e.target.value as StreakContribution)}
      >
        <option value="full">Full streak contribution</option>
        <option value="partial">Partial streak contribution</option>
        <option value="none">No streak contribution</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
        >
          Add Task
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
