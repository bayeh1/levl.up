import { describe, it, expect } from 'vitest'
import type { Task, Streak, Budget, SavingsGoal } from './types'

describe('Shared types', () => {
  it('Task accepts all StreakContribution values', () => {
    const base = {
      id: '1', title: 'Test', startDate: new Date(), dueDate: new Date(),
      category: 'productivity' as const, completed: false
    }
    const none: Task = { ...base, streakContribution: 'none' }
    const partial: Task = { ...base, streakContribution: 'partial' }
    const full: Task = { ...base, streakContribution: 'full' }
    expect(none.streakContribution).toBe('none')
    expect(partial.streakContribution).toBe('partial')
    expect(full.streakContribution).toBe('full')
  })

  it('Streak tracks daily completions', () => {
    const streak: Streak = { date: '2026-04-05', completedCount: 3, totalCount: 5, broken: false }
    expect(streak.completedCount).toBeLessThanOrEqual(streak.totalCount)
  })

  it('Budget holds monthly spend entries', () => {
    const budget: Budget = {
      id: 'b1', category: 'food', monthlyLimit: 500,
      spent: [{ amount: 20, date: new Date(), note: 'lunch' }]
    }
    expect(budget.spent[0].amount).toBe(20)
  })

  it('SavingsGoal tracks progress toward target', () => {
    const goal: SavingsGoal = {
      id: 'g1', title: 'Emergency fund', targetAmount: 1000,
      currentAmount: 620, deadline: new Date(), linkedStreak: true
    }
    expect(goal.currentAmount).toBeLessThanOrEqual(goal.targetAmount)
  })
})
