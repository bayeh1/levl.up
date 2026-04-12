import { useEffect, useState } from 'react'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { SavingsGoalCard } from './SavingsGoalCard'
import { ExpenseForm } from './ExpenseForm'
import { SavingsGoalForm } from './SavingsGoalForm'
import { getBudgets, getSavingsGoals, logExpense, updateSavingsGoal, addSavingsGoal, addBudget } from '../../store/finance'
import type { Budget, SavingsGoal } from '@levl-up/shared'

function ContributeForm({ onSubmit, onCancel }: { onSubmit: (amount: number) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState('')
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const n = parseFloat(amount); if (isFinite(n) && n > 0) onSubmit(n) }}
      className="bg-[#161b22] rounded-xl p-4 border border-[#ffd200] space-y-3"
    >
      <div>
        <label htmlFor="contribute-amount" className="block text-xs text-[#8b949e] mb-1">Contribution amount ($)</label>
        <input id="contribute-amount" type="number" min="0.01" step="0.01" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium">Contribute</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  )
}

export function FinanceTab() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [logBudgetId, setLogBudgetId] = useState<string | null>(null)
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)

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
    setContributeGoalId(goalId)
  }

  async function handleContributeSubmit(goalId: string, amount: number) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    await updateSavingsGoal(goalId, goal.currentAmount + amount)
    setContributeGoalId(null)
    await load()
  }

  async function handleAddBudget(fields: { category: string; monthlyLimit: number }) {
    try {
      await addBudget({ id: crypto.randomUUID(), ...fields, spent: [] })
      setShowBudgetForm(false)
      await load()
    } catch (err) {
      console.error('Failed to add budget:', err)
    }
  }

  async function handleAddGoal(fields: { title: string; targetAmount: number; deadline: Date; linkedStreak: boolean }) {
    await addSavingsGoal({
      id: crypto.randomUUID(),
      ...fields,
      currentAmount: 0,
    })
    setShowGoalForm(false)
    await load()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Finance</h1>

      {logBudgetId && (
        <ExpenseForm
          key={logBudgetId}
          budgets={budgets}
          initialBudgetId={logBudgetId}
          onSubmit={handleLogExpense}
          onCancel={() => setLogBudgetId(null)}
        />
      )}

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">Budgets</h2>
          {!showBudgetForm && (
            <button
              onClick={() => setShowBudgetForm(true)}
              className="text-xs text-[#58a6ff]"
              aria-label="Add budget"
            >
              + Add budget
            </button>
          )}
        </div>
        {showBudgetForm && (
          <BudgetForm onSubmit={handleAddBudget} onCancel={() => setShowBudgetForm(false)} />
        )}
        <div className="space-y-2">
          {budgets.length === 0 && <p className="text-[#8b949e] text-sm">No budgets yet</p>}
          {budgets.map((b) => <BudgetCard key={b.id} budget={b} onLogExpense={setLogBudgetId} />)}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">Savings Goals</h2>
          <button onClick={() => setShowGoalForm(true)} className="text-xs text-[#58a6ff]">+ Add goal</button>
        </div>
        {showGoalForm && (
          <SavingsGoalForm
            onSubmit={handleAddGoal}
            onCancel={() => setShowGoalForm(false)}
          />
        )}
        {contributeGoalId && (
          <ContributeForm
            onSubmit={(amount) => handleContributeSubmit(contributeGoalId, amount)}
            onCancel={() => setContributeGoalId(null)}
          />
        )}
        <div className="space-y-2">
          {goals.length === 0 && <p className="text-[#8b949e] text-sm">No savings goals yet</p>}
          {goals.map((g) => <SavingsGoalCard key={g.id} goal={g} onContribute={handleContribute} />)}
        </div>
      </section>
    </div>
  )
}
