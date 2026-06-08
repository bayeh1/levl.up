import { openDB, type IDBPDatabase } from 'idb'
import type { Task, Streak, Budget, SavingsGoal, Goal } from '@levl-up/shared'

export interface LevlUpDB {
  tasks: { key: string; value: Task }
  streaks: { key: string; value: Streak }
  budgets: { key: string; value: Budget }
  savingsGoals: { key: string; value: SavingsGoal }
  goals: { key: string; value: Goal }
}

let dbPromise: Promise<IDBPDatabase<LevlUpDB>> | null = null
let dbCounter = 0

function dbName(): string {
  return `levl-up-${dbCounter}`
}

export function getDB(): Promise<IDBPDatabase<LevlUpDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LevlUpDB>(dbName(), 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('tasks', { keyPath: 'id' })
          db.createObjectStore('streaks', { keyPath: 'date' })
          db.createObjectStore('budgets', { keyPath: 'id' })
          db.createObjectStore('savingsGoals', { keyPath: 'id' })
        }
        if (oldVersion < 2) {
          db.createObjectStore('goals', { keyPath: 'id' })
        }
      }
    })
  }
  return dbPromise
}

export function _resetDB(): void {
  dbCounter++
  dbPromise = null
}
