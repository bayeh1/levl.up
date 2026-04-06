import { Hono } from 'hono'
import { saveSubscription, removeSubscription } from '../storage'
import type { AppPushSubscription } from '@levl-up/shared'

export const pushRoutes = new Hono()

pushRoutes.post('/subscribe', async (c) => {
  const body = await c.req.json()
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return c.json({ error: 'Missing required fields: endpoint, keys.p256dh, keys.auth' }, 400)
  }
  const sub: AppPushSubscription = {
    endpoint: body.endpoint,
    keys: body.keys,
    timezone: body.timezone ?? 'UTC',
    dailyReminderTime: body.dailyReminderTime ?? '09:00',
    streakWarningTime: body.streakWarningTime ?? '20:00'
  }
  await saveSubscription(sub)
  return c.json({ ok: true }, 201)
})

pushRoutes.delete('/unsubscribe', async (c) => {
  const body = await c.req.json()
  if (!body.endpoint) return c.json({ error: 'Missing endpoint' }, 400)
  await removeSubscription(body.endpoint)
  return c.json({ ok: true })
})
