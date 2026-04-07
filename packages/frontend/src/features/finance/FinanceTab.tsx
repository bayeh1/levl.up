import { useEffect, useState } from 'react'
import { BudgetCard } from './BudgetCard'
import { SavingsGoalCard } from './SavingsGoalCard'
import { ExpenseForm } from './ExpenseForm'
import { getBudgets, getSavingsGoals, logExpense, updateSavingsGoal } from '../../store/finance'
import type { Budget, SavingsGoal } from '@levl-up/shared'

export function FinanceTab() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [logBudgetId, setLogBudgetId] = useState<string | null>(null)

  async function load() {
    const [b, g] = await Promise.all([getBudgets(), getSavingsGoals()])
    setBudgets(b)
    setGoals(g)
  }

  useEffect(() => { load() }, [])

  async function handleLogExpense(budgetId: string, amount: number, note: string) {
    await logExpense(budgetId, { amount, date: new Date(), note })
    setLogBudgetId(null)
    await load()
  }

  async function handleContribute(goalId: string) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const amountStr = prompt('How much are you contributing? ($)')
    if (!amountStr || isNaN(parseFloat(amountStr))) return
    await updateSavingsGoal(goalId, goal.currentAmount + parseFloat(amountStr))
    await load()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Finance</h1>

      {logBudgetId && (
        <ExpenseForm
          budgets={budgets}
          initialBudgetId={logBudgetId}
          onSubmit={handleLogExpense}
          onCancel={() => setLogBudgetId(null)}
        />
      )}

      <section>
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Budgets</h2>
        <div className="space-y-2">
          {budgets.length === 0 && <p className="text-[#8b949e] text-sm">No budgets yet</p>}
          {budgets.map((b) => <BudgetCard key={b.id} budget={b} onLogExpense={setLogBudgetId} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Savings Goals</h2>
        <div className="space-y-2">
          {goals.length === 0 && <p className="text-[#8b949e] text-sm">No savings goals yet</p>}
          {goals.map((g) => <SavingsGoalCard key={g.id} goal={g} onContribute={handleContribute} />)}
        </div>
      </section>
    </div>
  )
}
