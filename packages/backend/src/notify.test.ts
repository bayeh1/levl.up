import { describe, it, expect, vi } from 'vitest'

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 })
  }
}))

import { sendPushNotification } from './notify'
import type { AppPushSubscription } from '@levl-up/shared'

const sub: AppPushSubscription = {
  endpoint: 'https://fcm.googleapis.com/test',
  keys: { p256dh: 'key', auth: 'auth' },
  timezone: 'UTC',
  dailyReminderTime: '09:00',
  streakWarningTime: '20:00'
}

describe('sendPushNotification', () => {
  it('calls web-push sendNotification with serialized payload', async () => {
    const webpush = (await import('web-push')).default
    await sendPushNotification(sub, { title: 'Test', body: 'Hello' })
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify({ title: 'Test', body: 'Hello' })
    )
  })
})
