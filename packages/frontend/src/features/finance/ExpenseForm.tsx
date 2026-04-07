import { useState } from 'react'
import type { Budget } from '@levl-up/shared'

interface Props {
  budgets: Budget[]
  initialBudgetId?: string
  onSubmit: (budgetId: string, amount: number, note: string) => void
  onCancel: () => void
}

export function ExpenseForm({ budgets, initialBudgetId, onSubmit, onCancel }: Props) {
  const [budgetId, setBudgetId] = useState(initialBudgetId ?? budgets[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (amount) onSubmit(budgetId, parseFloat(amount), note) }}
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
    >
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Budget category</label>
        <select
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={budgetId}
          onChange={(e) => setBudgetId(e.target.value)}
        >
          {budgets.map((b) => <option key={b.id} value={b.id}>{b.category}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Amount ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Note (optional)</label>
        <input
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="What was this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium">
          Log Expense
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}
