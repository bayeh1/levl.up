import type { Budget } from '@levl-up/shared'

interface Props {
  budget: Budget
  onLogExpense: (budgetId: string) => void
}

export function BudgetCard({ budget, onLogExpense }: Props) {
  const totalSpent = budget.spent.reduce((sum, e) => sum + e.amount, 0)
  const pct = Math.min(100, Math.round((totalSpent / budget.monthlyLimit) * 100))
  const color = pct < 70 ? '#3fb950' : pct < 90 ? '#ffd200' : '#f85149'

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{budget.category}</span>
        <button onClick={() => onLogExpense(budget.id)} className="text-xs text-[#58a6ff]">
          + Log expense
        </button>
      </div>
      <div
        role="progressbar"
        aria-label={`${budget.category} budget`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-[#21262d] rounded-full h-2 mb-1"
      >
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-xs text-[#8b949e]">
        <span>${totalSpent} spent</span>
        <span>${budget.monthlyLimit} limit</span>
      </div>
    </div>
  )
}
