import { openDB, type IDBPDatabase } from 'idb'
import type { Task, Streak, Budget, SavingsGoal } from '@levl-up/shared'

export interface LevlUpDB {
  tasks: { key: string; value: Task }
  streaks: { key: string; value: Streak }
  budgets: { key: string; value: Budget }
  savingsGoals: { key: string; value: SavingsGoal }
}

let dbPromise: Promise<IDBPDatabase<LevlUpDB>> | null = null
let dbCounter = 0

function dbName(): string {
  return `levl-up-${dbCounter}`
}

export function getDB(): Promise<IDBPDatabase<LevlUpDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LevlUpDB>(dbName(), 1, {
      upgrade(db) {
        db.createObjectStore('tasks', { keyPath: 'id' })
        db.createObjectStore('streaks', { keyPath: 'date' })
        db.createObjectStore('budgets', { keyPath: 'id' })
        db.createObjectStore('savingsGoals', { keyPath: 'id' })
      }
    })
  }
  return dbPromise
}

// Test helper — resets cached DB promise so next getDB() call opens fresh
export function _resetDB(): void {
  dbCounter++
  dbPromise = null
}
