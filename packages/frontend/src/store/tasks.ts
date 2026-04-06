import { getDB } from './db'
import { crypto } from '../utils/crypto'
import type { Task, StreakContribution } from '@levl-up/shared'

export async function addTask(task: Task): Promise<void> {
  const db = await getDB()
  await db.put('tasks', task)
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDB()
  return db.getAll('tasks')
}

export async function completeTask(id: string): Promise<void> {
  const db = await getDB()
  const task = await db.get('tasks', id)
  if (!task) return
  await db.put('tasks', { ...task, completed: true, completedDate: new Date() })
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('tasks', id)
}

export function createTask(fields: {
  title: string
  dueDate: Date
  category: 'productivity' | 'finance'
  streakContribution: StreakContribution
}): Task {
  return {
    ...fields,
    id: crypto.randomUUID(),
    startDate: new Date(),
    completed: false
  }
}
