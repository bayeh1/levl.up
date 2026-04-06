import cron from 'node-cron'
import { getSubscriptions } from './storage'
import { sendPushNotification } from './notify'

export function startScheduler(): void {
  // Runs every minute — checks each subscription's local time
  cron.schedule('* * * * *', async () => {
    const subs = await getSubscriptions()
    const now = new Date()

    for (const sub of subs) {
      const localTime = now.toLocaleTimeString('en-GB', {
        timeZone: sub.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })

      if (localTime === sub.dailyReminderTime) {
        sendPushNotification(sub, {
          title: 'Time to Levl.up! 🔥',
          body: 'Check in and keep your streak alive.'
        }).catch(console.error)
      }

      if (localTime === sub.streakWarningTime) {
        sendPushNotification(sub, {
          title: 'Streak at risk! ⚠️',
          body: "You haven't checked in today. Don't break your streak!"
        }).catch(console.error)
      }
    }
  })

  console.log('Scheduler started')
}
