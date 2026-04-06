import { describe, it, expect, vi } from 'vitest'
import { app } from '../app'

vi.mock('../storage', () => ({
  saveSubscription: vi.fn().mockResolvedValue(undefined),
  removeSubscription: vi.fn().mockResolvedValue(undefined),
  getSubscriptions: vi.fn().mockResolvedValue([])
}))

const validSub = {
  endpoint: 'https://fcm.googleapis.com/test',
  keys: { p256dh: 'key', auth: 'auth' },
  timezone: 'America/Toronto',
  dailyReminderTime: '09:00',
  streakWarningTime: '20:00'
}

describe('POST /push/subscribe', () => {
  it('returns 201 on valid subscription', async () => {
    const res = await app.request('/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSub)
    })
    expect(res.status).toBe(201)
  })

  it('returns 400 when endpoint is missing', async () => {
    const res = await app.request('/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: { p256dh: 'k', auth: 'a' } })
    })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /push/unsubscribe', () => {
  it('returns 200 on valid unsubscribe', async () => {
    const res = await app.request('/push/unsubscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: validSub.endpoint })
    })
    expect(res.status).toBe(200)
  })

  it('returns 400 when endpoint is missing', async () => {
    const res = await app.request('/push/unsubscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    expect(res.status).toBe(400)
  })
})
