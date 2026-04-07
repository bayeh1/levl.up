import { useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = globalThis.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushSubscription() {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function subscribe(timezone: string, dailyReminderTime: string, streakWarningTime: string) {
    setLoading(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      const json = sub.toJSON()
      await fetch(`${BACKEND_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          timezone,
          dailyReminderTime,
          streakWarningTime
        })
      })
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to subscribe to notifications')
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch(`${BACKEND_URL}/push/unsubscribe`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint })
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }

  return { subscribed, loading, error, subscribe, unsubscribe }
}
