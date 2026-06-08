import { describe, it, expect, beforeEach } from 'vitest'
import { addGoal, getGoals, updateGoal, resetGoalProgress, getPieceCount, getRevealedPieces } from './goals'
import { _resetDB } from './db'
import type { Goal, Task } from '@levl-up/shared'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: 'Test Goal',
    deadline: new Date(Date.now() + 30 * 86400000),
    createdAt: new Date(),
    puzzleImageId: 'mountain',
    completed: false,
    ...overrides
  }
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    startDate: new Date(),
    dueDate: new Date(),
    category: 'productivity',
    completed: false,
    streakContribution: 'full',
    goalId: 'g1',
    ...overrides
  }
}

describe('getPieceCount', () => {
  it('returns 4 for 7-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 7 * 86400000) })
    expect(getPieceCount(goal)).toBe(4)
  })
  it('returns 9 for 14-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 14 * 86400000) })
    expect(getPieceCount(goal)).toBe(9)
  })
  it('returns 16 for 30-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 30 * 86400000) })
    expect(getPieceCount(goal)).toBe(16)
  })
  it('returns 25 for 60-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 60 * 86400000) })
    expect(getPieceCount(goal)).toBe(25)
  })
  it('returns 36 for 90-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 90 * 86400000) })
    expect(getPieceCount(goal)).toBe(36)
  })
})

describe('getRevealedPieces', () => {
  it('returns 0 with no tasks', () => {
    expect(getRevealedPieces(makeGoal(), [])).toBe(0)
  })

  it('returns 0 when no tasks are completed', () => {
    const tasks = [makeTask({ completed: false }), makeTask({ id: 't2', completed: false })]
    expect(getRevealedPieces(makeGoal(), tasks)).toBe(0)
  })

  it('returns proportional pieces when tasks completed', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 30 * 86400000) })
    const tasks = [
      makeTask({ id: 't1', completed: true, completedDate: new Date() }),
      makeTask({ id: 't2', completed: true, completedDate: new Date() }),
      makeTask({ id: 't3', completed: false }),
      makeTask({ id: 't4', completed: false }),
    ]
    expect(getRevealedPieces(goal, tasks)).toBe(8)
  })

  it('returns 0 after streak reset (completedDate before lastResetAt)', () => {
    const goal = makeGoal({ lastResetAt: new Date().toISOString().slice(0, 10) })
    const tasks = [
      makeTask({ id: 't1', completed: true, completedDate: new Date(Date.now() - 86400000) }),
    ]
    expect(getRevealedPieces(goal, tasks)).toBe(0)
  })
})

describe('goals store', () => {
  beforeEach(() => _resetDB())

  it('stores and retrieves a goal', async () => {
    const goal = makeGoal()
    await addGoal(goal)
    const all = await getGoals()
    expect(all).toHaveLength(1)
    expect(all[0].title).toBe('Test Goal')
  })

  it('updateGoal patches fields', async () => {
    await addGoal(makeGoal())
    await updateGoal('g1', { completed: true })
    const all = await getGoals()
    expect(all[0].completed).toBe(true)
  })

  it('resetGoalProgress sets lastResetAt to today', async () => {
    await addGoal(makeGoal())
    await resetGoalProgress('g1')
    const all = await getGoals()
    const today = new Date().toISOString().slice(0, 10)
    expect(all[0].lastResetAt).toBe(today)
  })
})
