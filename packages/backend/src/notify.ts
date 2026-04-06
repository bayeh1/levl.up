import webpush from 'web-push'
import type { AppPushSubscription } from '@levl-up/shared'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:admin@levlup.app',
  process.env.VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? ''
)

export interface NotificationPayload {
  title: string
  body: string
}

export async function sendPushNotification(
  sub: AppPushSubscription,
  payload: NotificationPayload
): Promise<void> {
  await webpush.sendNotification(
    { endpoint: sub.endpoint, keys: sub.keys },
    JSON.stringify(payload)
  )
}
