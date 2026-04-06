import { getDB } from './db'
import type { Budget, BudgetEntry, SavingsGoal } from '@levl-up/shared'

export async function addBudget(budget: Budget): Promise<void> {
  const db = await getDB()
  await db.put('budgets', budget)
}

export async function getBudgets(): Promise<Budget[]> {
  const db = await getDB()
  return db.getAll('budgets')
}

export async function logExpense(budgetId: string, entry: BudgetEntry): Promise<void> {
  const db = await getDB()
  const budget = await db.get('budgets', budgetId)
  if (!budget) return
  await db.put('budgets', { ...budget, spent: [...budget.spent, entry] })
}

export async function addSavingsGoal(goal: SavingsGoal): Promise<void> {
  const db = await getDB()
  await db.put('savingsGoals', goal)
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const db = await getDB()
  return db.getAll('savingsGoals')
}

export async function updateSavingsGoal(id: string, newAmount: number): Promise<void> {
  const db = await getDB()
  const goal = await db.get('savingsGoals', id)
  if (!goal) return
  await db.put('savingsGoals', { ...goal, currentAmount: newAmount })
}
