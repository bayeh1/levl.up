import { getDB } from './db'
import type { Streak } from '@levl-up/shared'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayStreak(): Promise<Streak | null> {
  const db = await getDB()
  return (await db.get('streaks', todayKey())) ?? null
}

export async function recordCompletion(dailyQuota: number): Promise<void> {
  const db = await getDB()
  const key = todayKey()
  const existing = await db.get('streaks', key)
  const current: Streak = existing ?? { date: key, completedCount: 0, totalCount: dailyQuota, broken: false }
  await db.put('streaks', { ...current, completedCount: current.completedCount + 1 })
}

export function isStreakBroken(streak: Streak): boolean {
  return streak.broken
}

/**
 * Returns a health value 0–1.
 * 1.0 = quota met. Decays linearly through the day based on seconds elapsed.
 */
export function getStreakHealth(completedToday: number, now: Date, dailyQuota = 1): number {
  if (completedToday >= dailyQuota) return 1
  const secondsInDay = 24 * 60 * 60
  const elapsed = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  return Math.max(0, 1 - elapsed / secondsInDay)
}

export async function getAllStreaks(): Promise<Streak[]> {
  const db = await getDB()
  return db.getAll('streaks')
}

export async function getConsecutiveStreak(): Promise<number> {
  const streaks = await getAllStreaks()
  const sorted = streaks.sort((a, b) => b.date.localeCompare(a.date))
  let count = 0
  let expected = todayKey()
  for (const s of sorted) {
    if (s.date !== expected || s.broken) break
    count++
    const d = new Date(s.date)
    d.setDate(d.getDate() - 1)
    expected = d.toISOString().slice(0, 10)
  }
  return count
}
