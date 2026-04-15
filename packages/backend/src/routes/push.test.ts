import { describe, it, expect, vi, beforeEach } from 'vitest'
import { app } from '../app'

vi.mock('../storage', () => ({
  saveSubscription: vi.fn().mockResolvedValue(undefined),
  removeSubscription: vi.fn().mockResolvedValue(undefined),
  getSubscriptions: vi.fn().mockResolvedValue([])
}))

vi.mock('../notify', () => ({
  sendPushNotification: vi.fn().mockResolvedValue(undefined)
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

describe('POST /push/notify', () => {
  beforeEach(async () => {
    const { getSubscriptions } = await import('../storage')
    vi.mocked(getSubscriptions).mockResolvedValue([validSub])
    const { sendPushNotification } = await import('../notify')
    vi.mocked(sendPushNotification).mockClear()
  })

  it('returns 400 when endpoint is missing', async () => {
    const res = await app.request('/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hello', body: 'World' })
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when title is missing', async () => {
    const res = await app.request('/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: validSub.endpoint, body: 'World' })
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when body is missing', async () => {
    const res = await app.request('/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: validSub.endpoint, title: 'Hello' })
    })
    expect(res.status).toBe(400)
  })

  it('returns 404 when endpoint not found in subscriptions', async () => {
    const { getSubscriptions } = await import('../storage')
    vi.mocked(getSubscriptions).mockResolvedValueOnce([])
    const res = await app.request('/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'https://unknown.endpoint', title: 'Hello', body: 'World' })
    })
    expect(res.status).toBe(404)
  })

  it('returns 200 and calls sendPushNotification when valid', async () => {
    const { sendPushNotification } = await import('../notify')
    const res = await app.request('/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: validSub.endpoint, title: 'Milestone!', body: 'You hit 25%' })
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(sendPushNotification).toHaveBeenCalledWith(validSub, { title: 'Milestone!', body: 'You hit 25%' })
  })
})
