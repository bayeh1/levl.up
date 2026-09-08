import cron from 'node-cron'
import { getSubscriptions } from './storage'
import { sendPushNotification } from './notify'

const lastHourlySent = new Map<string, string>()

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

      const localTimeParts = localTime.split(':').map(Number)
      const localHour = localTimeParts[0]
      const localMinute = localTimeParts[1]
      const localDay = new Date(now.toLocaleString('en-US', { timeZone: sub.timezone })).getDay()

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

      // Hourly progress notification
      if (sub.hourlyProgressEnabled ?? false) {
        const [startH] = (sub.hourlyProgressStart ?? '08:00').split(':').map(Number)
        const [endH] = (sub.hourlyProgressEnd ?? '21:00').split(':').map(Number)
        if (localMinute === 0 && localHour >= startH && localHour <= endH) {
          const dedupKey = `${sub.endpoint}:${localHour}`
          if (lastHourlySent.get(sub.endpoint) !== dedupKey) {
            lastHourlySent.set(sub.endpoint, dedupKey)
            try {
              await sendPushNotification(sub, {
                title: 'Progress Check 🔥',
                body: 'How are your tasks going? Keep the streak alive!',
              })
            } catch {
              // expired subscription — ignore
            }
          }
        }
      }

      // Weekly check-in (Sunday at 19:00 local time)
      if ((sub.weeklyCheckInEnabled ?? false) && localDay === 0 && localHour === 19 && localMinute === 0) {
        try {
          await sendPushNotification(sub, {
            title: 'Weekly Check-in 📋',
            body: "Sunday evening — review this week's goals and plan next week!",
          })
        } catch {
          // expired subscription — ignore
        }
      }
    }
  })

  console.log('Scheduler started')
}
