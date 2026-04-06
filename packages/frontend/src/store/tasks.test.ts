import { describe, it, expect, beforeEach } from 'vitest'
import { addTask, getTasks, completeTask, deleteTask, createTask } from './tasks'
import { _resetDB } from './db'
import type { Task } from '@levl-up/shared'

beforeEach(() => { _resetDB() })

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test task',
  startDate: new Date('2026-04-05'),
  dueDate: new Date('2026-04-06'),
  category: 'productivity',
  completed: false,
  streakContribution: 'full',
  ...overrides
})

describe('tasks store', () => {
  it('adds and retrieves a task', async () => {
    await addTask(makeTask())
    const tasks = await getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Test task')
  })

  it('completes a task and sets completedDate', async () => {
    await addTask(makeTask())
    await completeTask('1')
    const tasks = await getTasks()
    expect(tasks[0].completed).toBe(true)
    expect(tasks[0].completedDate).toBeInstanceOf(Date)
  })

  it('deletes a task', async () => {
    await addTask(makeTask())
    await deleteTask('1')
    const tasks = await getTasks()
    expect(tasks).toHaveLength(0)
  })

  it('createTask generates id and sets startDate', () => {
    const task = createTask({ title: 'New', dueDate: new Date(), category: 'productivity', streakContribution: 'full' })
    expect(task.id).toBeTruthy()
    expect(task.startDate).toBeInstanceOf(Date)
    expect(task.completed).toBe(false)
  })
})
