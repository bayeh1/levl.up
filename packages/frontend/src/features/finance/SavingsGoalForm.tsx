import { useState } from 'react'

interface Fields {
  title: string
  targetAmount: number
  deadline: Date
  linkedStreak: boolean
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
}

export function SavingsGoalForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const today = new Date()
  const defaultDeadline = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [linkedStreak, setLinkedStreak] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const parsed = parseFloat(target)
        if (!title.trim() || !isFinite(parsed) || parsed <= 0) return
        const [y, m, d] = deadline.split('-').map(Number)
        onSubmit({ title: title.trim(), targetAmount: parsed, deadline: new Date(y, m - 1, d), linkedStreak })
      }}
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
    >
      <div>
        <label htmlFor="goal-title" className="block text-xs text-[#8b949e] mb-1">Goal title</label>
        <input id="goal-title" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm" placeholder="e.g. Emergency Fund" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label htmlFor="goal-target" className="block text-xs text-[#8b949e] mb-1">Target amount ($)</label>
        <input id="goal-target" type="number" min="0.01" step="0.01" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div>
        <label htmlFor="goal-deadline" className="block text-xs text-[#8b949e] mb-1">Deadline</label>
        <input id="goal-deadline" type="date" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#e6edf3] cursor-pointer">
        <input type="checkbox" checked={linkedStreak} onChange={(e) => setLinkedStreak(e.target.checked)} className="rounded" />
        Link to streak 🔥
      </label>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium">Add Goal</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  )
}
