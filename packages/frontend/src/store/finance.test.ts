import { describe, it, expect, beforeEach } from 'vitest'
import { addBudget, getBudgets, logExpense, addSavingsGoal, getSavingsGoals, updateSavingsGoal } from './finance'
import { _resetDB } from './db'

beforeEach(() => { _resetDB() })

describe('finance store', () => {
  it('adds and retrieves a budget', async () => {
    await addBudget({ id: 'b1', category: 'Food', monthlyLimit: 500, spent: [] })
    const budgets = await getBudgets()
    expect(budgets).toHaveLength(1)
    expect(budgets[0].category).toBe('Food')
  })

  it('logs an expense to a budget', async () => {
    await addBudget({ id: 'b1', category: 'Food', monthlyLimit: 500, spent: [] })
    await logExpense('b1', { amount: 20, date: new Date(), note: 'lunch' })
    const budgets = await getBudgets()
    expect(budgets[0].spent).toHaveLength(1)
    expect(budgets[0].spent[0].amount).toBe(20)
  })

  it('adds and updates a savings goal', async () => {
    await addSavingsGoal({ id: 'g1', title: 'Fund', targetAmount: 1000, currentAmount: 0, deadline: new Date() })
    await updateSavingsGoal('g1', 200)
    const goals = await getSavingsGoals()
    expect(goals[0].currentAmount).toBe(200)
  })
})
