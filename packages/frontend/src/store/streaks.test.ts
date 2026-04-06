import { describe, it, expect, beforeEach } from 'vitest'
import { getTodayStreak, recordCompletion, isStreakBroken, getStreakHealth, getConsecutiveStreak } from './streaks'
import { _resetDB } from './db'

beforeEach(() => { _resetDB() })

describe('streaks store', () => {
  it('returns null for today if no streak recorded', async () => {
    expect(await getTodayStreak()).toBeNull()
  })

  it('records a completion and creates streak entry', async () => {
    await recordCompletion(3)
    const streak = await getTodayStreak()
    expect(streak?.completedCount).toBe(1)
    expect(streak?.broken).toBe(false)
  })

  it('increments completedCount on subsequent completions', async () => {
    await recordCompletion(3)
    await recordCompletion(3)
    const streak = await getTodayStreak()
    expect(streak?.completedCount).toBe(2)
  })

  it('marks streak as broken when broken flag is true', () => {
    const broken = { date: '2026-04-04', completedCount: 0, totalCount: 3, broken: true }
    expect(isStreakBroken(broken)).toBe(true)
  })

  it('getStreakHealth returns 1 when quota is met', () => {
    expect(getStreakHealth(3, new Date('2026-04-05T18:00:00'), 3)).toBe(1)
  })

  it('getStreakHealth returns value between 0 and 1 when quota not met', () => {
    const health = getStreakHealth(0, new Date('2026-04-05T12:00:00'), 3)
    expect(health).toBeGreaterThan(0)
    expect(health).toBeLessThan(1)
  })

  it('getConsecutiveStreak returns 0 with no data', async () => {
    expect(await getConsecutiveStreak()).toBe(0)
  })
})
