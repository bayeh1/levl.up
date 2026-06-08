import { getDB } from './db'
import type { Goal, Task } from '@levl-up/shared'

export async function addGoal(goal: Goal): Promise<void> {
  const db = await getDB()
  await db.put('goals', goal)
}

export async function getGoals(): Promise<Goal[]> {
  const db = await getDB()
  return db.getAll('goals')
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const db = await getDB()
  const goal = await db.get('goals', id)
  if (!goal) return
  await db.put('goals', { ...goal, ...updates })
}

export async function resetGoalProgress(id: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  await updateGoal(id, { lastResetAt: today })
}

export function getPieceCount(goal: Goal): number {
  const days = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime()) / 86400000
  )
  if (days <= 7) return 4
  if (days <= 14) return 9
  if (days <= 30) return 16
  if (days <= 60) return 25
  return 36
}

export function getGridSize(pieceCount: number): number {
  return Math.round(Math.sqrt(pieceCount))
}

export function getRevealedPieces(goal: Goal, tasks: Task[]): number {
  const goalTasks = tasks.filter((t) => t.goalId === goal.id)
  if (goalTasks.length === 0) return 0
  const since = goal.lastResetAt ?? '2000-01-01'
  const completed = goalTasks.filter(
    (t) =>
      t.completed &&
      t.completedDate &&
      new Date(t.completedDate).toISOString().slice(0, 10) >= since
  ).length
  const totalPieces = getPieceCount(goal)
  return Math.min(totalPieces, Math.floor((completed / goalTasks.length) * totalPieces))
}
