import { useState } from 'react'

interface Fields {
  category: string
  monthlyLimit: number
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
}

export function BudgetForm({ onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')

  return (
    <form
      aria-label="Add budget"
      onSubmit={(e) => {
        e.preventDefault()
        const parsed = parseFloat(limit)
        if (!category.trim() || !isFinite(parsed) || parsed <= 0) return
        onSubmit({ category: category.trim(), monthlyLimit: parsed })
      }}
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
    >
      <div>
        <label htmlFor="budget-category" className="block text-xs text-[#8b949e] mb-1">Category</label>
        <input
          id="budget-category"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="e.g. Food, Transport, Entertainment"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="budget-limit" className="block text-xs text-[#8b949e] mb-1">Monthly limit ($)</label>
        <input
          id="budget-limit"
          type="number"
          min="0.01"
          step="0.01"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="0.00"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium">
          Add Budget
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}
