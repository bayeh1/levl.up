import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('push', (event: Event) => {
  const pushEvent = event as PushEvent
  const data = pushEvent.data?.json() ?? { title: 'Levl.up', body: 'Stay on track!' }
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  }
  pushEvent.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event: Event) => {
  const e = event as NotificationEvent
  e.notification.close()
  e.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).clients.openWindow('/')
  )
})
