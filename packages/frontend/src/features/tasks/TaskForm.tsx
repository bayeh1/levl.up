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
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [category, setCategory] = useState<'productivity' | 'finance'>('productivity')
  const [streakContribution, setStreakContribution] = useState<StreakContribution>('full')

  function handleSubmit() {
    if (!title.trim()) return
    const [y, m, d] = dueDate.split('-').map(Number)
    const localDueDate = new Date(y, m - 1, d)
    onSubmit({ title: title.trim(), dueDate: localDueDate, category, streakContribution })
  }

  return (
    <form
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
      onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
    >
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Title</label>
        <input
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Due date</label>
        <input
          type="date"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Category</label>
        <select
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as 'productivity' | 'finance')}
        >
          <option value="productivity">Productivity</option>
          <option value="finance">Finance</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Streak contribution</label>
        <select
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={streakContribution}
          onChange={(e) => setStreakContribution(e.target.value as StreakContribution)}
        >
          <option value="full">Full streak contribution</option>
          <option value="partial">Partial streak contribution</option>
          <option value="none">No streak contribution</option>
        </select>
      </div>
      <div className="text-xs text-[#8b949e] px-1">
        Started: {new Date().toLocaleString()}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
        >
          Add Task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
