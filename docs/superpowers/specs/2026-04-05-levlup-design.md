# Levl.up — Design Spec

**Date:** 2026-04-05  
**Status:** Approved

---

## Overview

Levl.up is a mobile-first PWA that combats procrastination through streak-based gamification. It combines a task planner and personal finance tracker, nudging users to complete daily tasks and savings/budget goals through visible streak momentum, push notifications, and streak decay mechanics.

---

## Goals

- Help users overcome procrastination via game-like daily accountability
- Track productivity tasks and finance goals (budgets + savings) in one place
- Run as an installable PWA on iOS and Android (home screen icon, no app store)
- Deliver reliable push notifications even when the app is closed
- Store all personal data locally on-device (local-first); cloud sync and social features come in a future phase

---

## Non-Goals (v1)

- User accounts / authentication
- Cloud sync or cross-device data sharing
- Social features (sharing streaks/goals with friends)
- Desktop layout (designed for later, same backend)
- Native iOS/Android apps

---

## Gamification Model

**Core mechanic: Streaks & Momentum**

- A streak increments when the user meets their daily task quota (default: 1 task/day, configurable in Settings)
- The streak counter tracks consecutive days — breaking a day resets it to 0
- Completing finance tasks (log an expense, contribute to a savings goal) also feeds the streak
- Each day the streak "health bar" starts full and decays linearly from midnight to midnight if no tasks are completed
- Health fully decayed by midnight → streak is broken, counter resets to 0
- A streak-at-risk push notification fires at a user-configured warning time (default 8pm) if no tasks have been completed that day

---

## Data Model (IndexedDB, local-only)

### Task
```ts
type StreakContribution = 'none' | 'partial' | 'full'

Task {
  id: string
  title: string
  startDate: Date              // when the task was created/started
  dueDate: Date                // deadline
  completedDate?: Date         // when it was marked done (duration = completedDate - startDate)
  category: 'productivity' | 'finance'
  completed: boolean
  streakContribution: StreakContribution  // how much this task counts toward the streak
}
```

### Streak
```ts
Streak {
  date: string            // YYYY-MM-DD
  completedCount: number
  totalCount: number
  broken: boolean
}
```

### Budget
```ts
Budget {
  id: string
  category: string
  monthlyLimit: number
  spent: { amount: number; date: Date; note?: string }[]
}
```

### Savings Goal
```ts
SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  linkedStreak?: boolean  // completing a contribution counts toward streak
}
```

### Push Subscription (backend only)
```ts
PushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
  timezone: string
  dailyReminderTime: string   // HH:MM
  streakWarningTime: string   // HH:MM, default "20:00"
}
```

---

## Features

### Dashboard (Home tab)
- Streak counter front and center with fire icon
- Health bar showing today's decay status
- Quick-glance stats: tasks completed today (x/y), savings goal progress (%)
- "Next task" card showing the most urgent pending task
- Tapping stats drills into Tasks or Finance tabs

### Tasks tab
- List of tasks grouped by today / upcoming / overdue
- Add task: title, start date (auto-set to now), due date, category, streak toggle
- Mark complete → triggers streak update and completion animation
- Task detail shows duration (completedDate − startDate)

### Finance tab
- Budget overview: categories with spend bars vs monthly limit
- Log expense: amount, category, note
- Savings goals list with progress bars
- Add/edit savings goal: title, target, deadline, link to streak

### Settings tab
- Daily reminder time picker
- Streak warning time picker
- Notification permission prompt + "Add to Home Screen" guide (iOS)
- Reset streak (with confirmation)

### Push Notifications
- Daily check-in reminder at user-configured time
- Streak-at-risk warning if no activity by warning time
- Savings goal milestone reached (25%, 50%, 75%, 100%)

---

## Architecture

### Frontend
```
React 19 + TypeScript + Tailwind v4 + Vite

Dependencies:
- vite-plugin-pwa       service worker + manifest generation
- idb                   IndexedDB wrapper
- react-router-dom      tab navigation
```

### Backend
```
Hono + Node.js

Dependencies:
- node-cron             schedule daily reminder jobs per timezone
- web-push              send push notifications to subscriptions

Routes:
- POST /subscribe       register a push subscription
- DELETE /unsubscribe   remove a push subscription
```

### Project Structure (Monorepo — npm workspaces)
```
levl-up/
├── package.json              # Workspace root
├── tsconfig.base.json        # Shared TS config
└── packages/
    ├── shared/               # Shared TypeScript types
    │   └── src/
    │       └── types.ts      # Task, Budget, SavingsGoal, PushSubscription...
    │
    ├── frontend/             # React PWA
    │   ├── src/
    │   │   ├── features/
    │   │   │   ├── dashboard/     Streak HUD, daily summary
    │   │   │   ├── tasks/         Task list, add/complete
    │   │   │   ├── finance/       Budgets, savings goals
    │   │   │   └── settings/      Notification prefs
    │   │   ├── store/             IndexedDB models
    │   │   └── sw.ts              Service worker (push handler)
    │   └── public/
    │       └── manifest.json      PWA manifest
    │
    └── backend/              # Hono + Node.js
        └── src/
            ├── routes/
            │   └── push.ts        Subscribe/unsubscribe endpoints
            └── scheduler.ts       Cron jobs per timezone
```

### Deployment
- Frontend: Netlify or Vercel (free tier)
- Backend: Railway or Render (free tier, always-on Node server)

---

## iOS PWA Constraints

- Push notifications require iOS 16.4+ and the app must be added to the Home Screen
- On first launch, show a one-time prompt guiding the user through "Add to Home Screen"
- Notification permission is only requestable after Add to Home Screen on iOS

---

## Future Phase (v2)

- User accounts (email/password auth)
- Cloud sync — same backend, data moves from IndexedDB to server DB
- Social: share streaks and savings goals with friends
- Desktop responsive layout
- Analytics: task completion trends, average time-to-complete, budget patterns
