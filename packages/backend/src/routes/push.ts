import { Hono } from 'hono'
import { saveSubscription, removeSubscription, getSubscriptions } from '../storage'
import { sendPushNotification } from '../notify'
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

pushRoutes.post('/notify', async (c) => {
  const body = await c.req.json()
  const { endpoint, title, body: msgBody } = body
  if (!endpoint || !title || !msgBody) return c.json({ error: 'Missing fields' }, 400)
  const subs = await getSubscriptions()
  const sub = subs.find((s) => s.endpoint === endpoint)
  if (!sub) return c.json({ error: 'Not found' }, 404)
  try {
    await sendPushNotification(sub, { title, body: msgBody })
  } catch {
    // expired subscription — silently ignore
  }
  return c.json({ ok: true })
})
