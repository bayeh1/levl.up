import { describe, it, expect, beforeEach } from 'vitest'
import { saveSubscription, removeSubscription, getSubscriptions } from './storage'
import type { AppPushSubscription } from '@levl-up/shared'
import { existsSync, unlinkSync } from 'fs'

const TEST_FILE = '/tmp/levlup-test-subscriptions.json'

const sub: AppPushSubscription = {
  endpoint: 'https://fcm.googleapis.com/test123',
  keys: { p256dh: 'key1', auth: 'auth1' },
  timezone: 'America/Toronto',
  dailyReminderTime: '09:00',
  streakWarningTime: '20:00'
}

beforeEach(() => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE)
})

describe('storage', () => {
  it('saves and retrieves a subscription', async () => {
    await saveSubscription(sub, TEST_FILE)
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toHaveLength(1)
    expect(subs[0].endpoint).toBe(sub.endpoint)
  })

  it('updates existing subscription on duplicate endpoint', async () => {
    await saveSubscription(sub, TEST_FILE)
    await saveSubscription({ ...sub, dailyReminderTime: '10:00' }, TEST_FILE)
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toHaveLength(1)
    expect(subs[0].dailyReminderTime).toBe('10:00')
  })

  it('removes a subscription by endpoint', async () => {
    await saveSubscription(sub, TEST_FILE)
    await removeSubscription(sub.endpoint, TEST_FILE)
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toHaveLength(0)
  })

  it('returns empty array when file does not exist', async () => {
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toEqual([])
  })
})
