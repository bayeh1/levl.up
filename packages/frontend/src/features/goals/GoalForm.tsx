import { useState } from 'react'
import { PUZZLE_IMAGES } from './PuzzleImages'
import type { PuzzleImageId } from '@levl-up/shared'

interface Fields {
  title: string
  deadline: Date
  puzzleImageId: PuzzleImageId
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
}

export function GoalForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const today = new Date()
  const defaultDeadline = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [imageId, setImageId] = useState<PuzzleImageId>('mountain')

  return (
    <form
      aria-label="New goal form"
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        const [y, m, d] = deadline.split('-').map(Number)
        onSubmit({ title: title.trim(), deadline: new Date(y, m - 1, d), puzzleImageId: imageId })
      }}
    >
      <div>
        <label htmlFor="goal-title" className="block text-xs text-[#8b949e] mb-1">Goal title</label>
        <input
          id="goal-title"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="e.g. Read 10 books"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="goal-deadline" className="block text-xs text-[#8b949e] mb-1">Deadline</label>
        <input
          id="goal-deadline"
          type="date"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-2">Puzzle image</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(PUZZLE_IMAGES) as [PuzzleImageId, { label: string; gradient: string }][]).map(([id, { label, gradient }]) => (
            <button
              key={id}
              type="button"
              onClick={() => setImageId(id)}
              className={`rounded-lg p-1 border-2 transition-colors ${imageId === id ? 'border-[#ffd200]' : 'border-[#30363d]'}`}
            >
              <div className="h-10 rounded" style={{ backgroundImage: gradient }} />
              <div className="text-xs text-[#8b949e] mt-1">{label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium">
          Create Goal
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}
