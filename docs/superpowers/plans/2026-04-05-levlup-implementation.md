# Levl.up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Levl.up — a streak-based productivity and finance PWA with a Hono backend for push notifications, organized as an npm workspaces monorepo.

**Architecture:** Three packages in an npm workspace: `shared` (TypeScript types shared between frontend and backend), `backend` (Hono + Node.js server for push subscriptions and cron scheduling), and `frontend` (React 19 PWA with IndexedDB local storage). All personal data stays on-device; the backend only stores push subscriptions.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vite, vite-plugin-pwa, idb, react-router-dom v7 · Hono, Node.js, tsx, node-cron, web-push · npm workspaces, vitest, @testing-library/react

---

## File Map

### Root
- `package.json` — workspace root with `packages/*` workspaces
- `tsconfig.base.json` — shared TS config extended by each package
- `.gitignore`

### packages/shared
- `package.json`
- `tsconfig.json`
- `src/types.ts` — Task, StreakContribution, Streak, Budget, BudgetEntry, SavingsGoal, PushSubscription
- `src/index.ts` — re-exports

### packages/backend
- `package.json`
- `tsconfig.json`
- `src/app.ts` — Hono app definition (separated from server start for testability)
- `src/index.ts` — server entry point, starts scheduler
- `src/routes/push.ts` — POST /push/subscribe, DELETE /push/unsubscribe
- `src/storage.ts` — read/write push subscriptions to JSON file
- `src/notify.ts` — web-push send helper
- `src/scheduler.ts` — node-cron: daily reminder + streak warning per subscription timezone

### packages/frontend
- `package.json`
- `tsconfig.json`
- `vite.config.ts` — Vite + React + Tailwind + PWA plugin + vitest config
- `index.html`
- `src/main.tsx`
- `src/App.tsx` — router + bottom tab shell
- `src/index.css` — Tailwind import + dark body
- `src/test-setup.ts` — testing-library/jest-dom + fake-indexeddb
- `src/sw.ts` — service worker: push event, notification click
- `src/utils/crypto.ts` — re-export globalThis.crypto for testability
- `src/store/db.ts` — openDB setup, exports `getDB` and `_resetDB` (test helper)
- `src/store/tasks.ts` — addTask, getTasks, completeTask, deleteTask, createTask
- `src/store/finance.ts` — addBudget, getBudgets, logExpense, addSavingsGoal, getSavingsGoals, updateSavingsGoal
- `src/store/streaks.ts` — getTodayStreak, recordCompletion, getConsecutiveStreak, getStreakHealth, isStreakBroken
- `src/components/TabBar.tsx` — bottom nav with 4 tabs
- `src/features/dashboard/Dashboard.tsx` — streak HUD, health bar, quick stats, next task
- `src/features/dashboard/StreakCounter.tsx` — animated streak number + fire icon
- `src/features/dashboard/HealthBar.tsx` — linear decay progress bar
- `src/features/tasks/TasksTab.tsx` — task list grouped today/upcoming/overdue
- `src/features/tasks/TaskItem.tsx` — single task row
- `src/features/tasks/TaskForm.tsx` — add task form
- `src/features/finance/FinanceTab.tsx` — budgets + savings goals overview
- `src/features/finance/BudgetCard.tsx` — category spend bar
- `src/features/finance/SavingsGoalCard.tsx` — goal progress bar
- `src/features/finance/ExpenseForm.tsx` — log expense form
- `src/features/settings/SettingsTab.tsx` — notification times, daily quota, enable/disable push
- `src/features/notifications/usePushSubscription.ts` — hook for subscribe/unsubscribe
- `src/features/notifications/AddToHomeScreen.tsx` — iOS install prompt

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/shared/package.json`
- Create: `packages/backend/package.json`
- Create: `packages/frontend/package.json`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "levl-up",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:backend": "npm run dev --workspace=packages/backend",
    "dev:frontend": "npm run dev --workspace=packages/frontend",
    "test": "npm run test --workspaces --if-present"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
.superpowers/
*.local
packages/backend/.env
packages/backend/data/
packages/frontend/.env
```

- [ ] **Step 4: Create packages/shared/package.json**

```json
{
  "name": "@levl-up/shared",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 5: Create packages/backend/package.json**

```json
{
  "name": "@levl-up/backend",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@levl-up/shared": "*",
    "hono": "^4.0.0",
    "@hono/node-server": "^1.0.0",
    "node-cron": "^3.0.0",
    "web-push": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/web-push": "^3.6.0",
    "@types/node-cron": "^3.0.0",
    "tsx": "^4.0.0",
    "vitest": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 6: Create packages/frontend/package.json**

```json
{
  "name": "@levl-up/frontend",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "@levl-up/shared": "*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.21.0",
    "workbox-precaching": "^7.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^24.0.0",
    "fake-indexeddb": "^6.0.0",
    "typescript": "^5.3.3",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

- [ ] **Step 7: Install all workspace dependencies**

Run from the repo root (inside `ProcrastinationApp/`):
```bash
npm install
```

Expected: `node_modules/` at root, workspace symlinks created at `node_modules/@levl-up/`.

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.base.json .gitignore packages/
git commit -m "feat: monorepo scaffold with npm workspaces"
```

---

## Task 2: Shared Types

**Files:**
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/src/types.test.ts`

- [ ] **Step 1: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 2: Write the failing test**

Create `packages/shared/src/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { Task, Streak, Budget, SavingsGoal } from './types'

describe('Shared types', () => {
  it('Task accepts all StreakContribution values', () => {
    const base = {
      id: '1', title: 'Test', startDate: new Date(), dueDate: new Date(),
      category: 'productivity' as const, completed: false
    }
    const none: Task = { ...base, streakContribution: 'none' }
    const partial: Task = { ...base, streakContribution: 'partial' }
    const full: Task = { ...base, streakContribution: 'full' }
    expect(none.streakContribution).toBe('none')
    expect(partial.streakContribution).toBe('partial')
    expect(full.streakContribution).toBe('full')
  })

  it('Streak tracks daily completions', () => {
    const streak: Streak = { date: '2026-04-05', completedCount: 3, totalCount: 5, broken: false }
    expect(streak.completedCount).toBeLessThanOrEqual(streak.totalCount)
  })

  it('Budget holds monthly spend entries', () => {
    const budget: Budget = {
      id: 'b1', category: 'food', monthlyLimit: 500,
      spent: [{ amount: 20, date: new Date(), note: 'lunch' }]
    }
    expect(budget.spent[0].amount).toBe(20)
  })

  it('SavingsGoal tracks progress toward target', () => {
    const goal: SavingsGoal = {
      id: 'g1', title: 'Emergency fund', targetAmount: 1000,
      currentAmount: 620, deadline: new Date(), linkedStreak: true
    }
    expect(goal.currentAmount).toBeLessThanOrEqual(goal.targetAmount)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm run test --workspace=packages/shared
```

Expected: FAIL — `Cannot find module './types'`

- [ ] **Step 4: Implement types**

Create `packages/shared/src/types.ts`:

```ts
export type StreakContribution = 'none' | 'partial' | 'full'

export interface Task {
  id: string
  title: string
  startDate: Date
  dueDate: Date
  completedDate?: Date
  category: 'productivity' | 'finance'
  completed: boolean
  streakContribution: StreakContribution
}

export interface Streak {
  date: string           // YYYY-MM-DD
  completedCount: number
  totalCount: number
  broken: boolean
}

export interface BudgetEntry {
  amount: number
  date: Date
  note?: string
}

export interface Budget {
  id: string
  category: string
  monthlyLimit: number
  spent: BudgetEntry[]
}

export interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  linkedStreak?: boolean
}

export interface PushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
  timezone: string
  dailyReminderTime: string   // HH:MM
  streakWarningTime: string   // HH:MM
}
```

Create `packages/shared/src/index.ts`:

```ts
export * from './types'
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test --workspace=packages/shared
```

Expected: PASS — 4 tests passing

- [ ] **Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat: shared TypeScript types package"
```

---

## Task 3: Backend Foundation

**Files:**
- Create: `packages/backend/tsconfig.json`
- Create: `packages/backend/src/app.ts`
- Create: `packages/backend/src/routes/push.ts` (stub)
- Create: `packages/backend/src/index.ts`
- Test: `packages/backend/src/app.test.ts`

- [ ] **Step 1: Create packages/backend/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 2: Write failing test for health endpoint**

Create `packages/backend/src/app.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { app } from './app'

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm run test --workspace=packages/backend
```

Expected: FAIL — `Cannot find module './app'`

- [ ] **Step 4: Create stub push route**

Create `packages/backend/src/routes/push.ts`:

```ts
import { Hono } from 'hono'

export const pushRoutes = new Hono()
```

- [ ] **Step 5: Implement Hono app**

Create `packages/backend/src/app.ts`:

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { pushRoutes } from './routes/push'

export const app = new Hono()

app.use('*', cors())
app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/push', pushRoutes)
```

Create `packages/backend/src/index.ts`:

```ts
import { serve } from '@hono/node-server'
import { app } from './app'
import { startScheduler } from './scheduler'

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`Levl.up backend running on http://localhost:${port}`)
  startScheduler()
})
```

Create a stub `packages/backend/src/scheduler.ts` (full implementation in Task 6):

```ts
export function startScheduler(): void {
  console.log('Scheduler started')
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
npm run test --workspace=packages/backend
```

Expected: PASS — 1 test passing

- [ ] **Step 7: Smoke-test dev server**

```bash
npm run dev:backend
```

Expected: `Levl.up backend running on http://localhost:3001`

In another terminal:
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"ok"}`

Stop the dev server (`Ctrl+C`).

- [ ] **Step 8: Commit**

```bash
git add packages/backend/
git commit -m "feat: Hono backend foundation with health endpoint"
```

---

## Task 4: Push Subscription Storage

**Files:**
- Create: `packages/backend/src/storage.ts`
- Test: `packages/backend/src/storage.test.ts`

Subscriptions are persisted to `data/subscriptions.json` relative to the backend package root. No database required for v1.

- [ ] **Step 1: Write failing tests**

Create `packages/backend/src/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveSubscription, removeSubscription, getSubscriptions } from './storage'
import type { PushSubscription } from '@levl-up/shared'
import { existsSync, unlinkSync } from 'fs'

const TEST_FILE = '/tmp/levlup-test-subscriptions.json'

const sub: PushSubscription = {
  endpoint: 'https://fcm.googleapis.com/test123',
  keys: { p256dh: 'key1', auth: 'auth1' },
  timezone: 'America/Toronto',
  dailyReminderTime: '09:00',
  streakWarningTime: '20:00'
}

beforeEach(() => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE)
})

describe('storage', () => {
  it('saves and retrieves a subscription', async () => {
    await saveSubscription(sub, TEST_FILE)
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toHaveLength(1)
    expect(subs[0].endpoint).toBe(sub.endpoint)
  })

  it('updates existing subscription on duplicate endpoint', async () => {
    await saveSubscription(sub, TEST_FILE)
    await saveSubscription({ ...sub, dailyReminderTime: '10:00' }, TEST_FILE)
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toHaveLength(1)
    expect(subs[0].dailyReminderTime).toBe('10:00')
  })

  it('removes a subscription by endpoint', async () => {
    await saveSubscription(sub, TEST_FILE)
    await removeSubscription(sub.endpoint, TEST_FILE)
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toHaveLength(0)
  })

  it('returns empty array when file does not exist', async () => {
    const subs = await getSubscriptions(TEST_FILE)
    expect(subs).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test --workspace=packages/backend
```

Expected: FAIL — `Cannot find module './storage'`

- [ ] **Step 3: Implement storage**

Create `packages/backend/src/storage.ts`:

```ts
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { PushSubscription } from '@levl-up/shared'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DEFAULT_FILE = resolve(__dirname, '../../data/subscriptions.json')

export async function getSubscriptions(file = DEFAULT_FILE): Promise<PushSubscription[]> {
  if (!existsSync(file)) return []
  const raw = await readFile(file, 'utf-8')
  return JSON.parse(raw) as PushSubscription[]
}

export async function saveSubscription(sub: PushSubscription, file = DEFAULT_FILE): Promise<void> {
  const subs = await getSubscriptions(file)
  const idx = subs.findIndex((s) => s.endpoint === sub.endpoint)
  if (idx >= 0) {
    subs[idx] = sub
  } else {
    subs.push(sub)
  }
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(subs, null, 2))
}

export async function removeSubscription(endpoint: string, file = DEFAULT_FILE): Promise<void> {
  const subs = await getSubscriptions(file)
  const filtered = subs.filter((s) => s.endpoint !== endpoint)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(filtered, null, 2))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test --workspace=packages/backend
```

Expected: PASS — 5 tests passing (1 health + 4 storage)

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/storage.ts packages/backend/src/storage.test.ts
git commit -m "feat: push subscription file storage"
```

---

## Task 5: Push Subscription Routes

**Files:**
- Modify: `packages/backend/src/routes/push.ts`
- Test: `packages/backend/src/routes/push.test.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/backend/src/routes/push.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test --workspace=packages/backend
```

Expected: FAIL — subscribe/unsubscribe routes return 404

- [ ] **Step 3: Implement push routes**

Replace `packages/backend/src/routes/push.ts`:

```ts
import { Hono } from 'hono'
import { saveSubscription, removeSubscription } from '../storage'
import type { PushSubscription } from '@levl-up/shared'

export const pushRoutes = new Hono()

pushRoutes.post('/subscribe', async (c) => {
  const body = await c.req.json()
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return c.json({ error: 'Missing required fields: endpoint, keys.p256dh, keys.auth' }, 400)
  }
  const sub: PushSubscription = {
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test --workspace=packages/backend
```

Expected: PASS — 9 tests passing

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/routes/
git commit -m "feat: push subscribe/unsubscribe endpoints"
```

---

## Task 6: Push Notification Sender + Scheduler

**Files:**
- Create: `packages/backend/src/notify.ts`
- Modify: `packages/backend/src/scheduler.ts`
- Create: `packages/backend/.env.example`
- Test: `packages/backend/src/notify.test.ts`

- [ ] **Step 1: Generate VAPID keys**

Run once and save the output — you'll use these values in the next step:

```bash
npx web-push generate-vapid-keys
```

Expected output (your values will differ):
```
Public Key: BFd3...
Private Key: abc1...
```

- [ ] **Step 2: Create packages/backend/.env**

```
VAPID_PUBLIC_KEY=<paste_public_key_here>
VAPID_PRIVATE_KEY=<paste_private_key_here>
VAPID_SUBJECT=mailto:you@example.com
```

- [ ] **Step 3: Create packages/backend/.env.example**

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com
```

- [ ] **Step 4: Write failing test for notify**

Create `packages/backend/src/notify.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 })
  }
}))

import { sendPushNotification } from './notify'
import type { PushSubscription } from '@levl-up/shared'

const sub: PushSubscription = {
  endpoint: 'https://fcm.googleapis.com/test',
  keys: { p256dh: 'key', auth: 'auth' },
  timezone: 'UTC',
  dailyReminderTime: '09:00',
  streakWarningTime: '20:00'
}

describe('sendPushNotification', () => {
  it('calls web-push sendNotification with serialized payload', async () => {
    const webpush = (await import('web-push')).default
    await sendPushNotification(sub, { title: 'Test', body: 'Hello' })
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify({ title: 'Test', body: 'Hello' })
    )
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

```bash
npm run test --workspace=packages/backend
```

Expected: FAIL — `Cannot find module './notify'`

- [ ] **Step 6: Implement notify.ts**

Create `packages/backend/src/notify.ts`:

```ts
import webpush from 'web-push'
import type { PushSubscription } from '@levl-up/shared'

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
  sub: PushSubscription,
  payload: NotificationPayload
): Promise<void> {
  await webpush.sendNotification(
    { endpoint: sub.endpoint, keys: sub.keys },
    JSON.stringify(payload)
  )
}
```

- [ ] **Step 7: Implement scheduler.ts**

Replace `packages/backend/src/scheduler.ts`:

```ts
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
```

- [ ] **Step 8: Run all backend tests**

```bash
npm run test --workspace=packages/backend
```

Expected: PASS — 10 tests passing

- [ ] **Step 9: Commit**

```bash
git add packages/backend/src/notify.ts packages/backend/src/notify.test.ts packages/backend/src/scheduler.ts packages/backend/.env.example
git commit -m "feat: push notification sender and daily/warning cron scheduler"
```

---

## Task 7: Frontend PWA Scaffold

**Files:**
- Create: `packages/frontend/tsconfig.json`
- Create: `packages/frontend/vite.config.ts`
- Create: `packages/frontend/index.html`
- Create: `packages/frontend/src/main.tsx`
- Create: `packages/frontend/src/index.css`
- Create: `packages/frontend/src/sw.ts`
- Create: `packages/frontend/src/test-setup.ts`

- [ ] **Step 1: Create packages/frontend/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      injectManifest: { swSrc: 'src/sw.ts' },
      manifest: {
        name: 'Levl.up',
        short_name: 'Levl.up',
        description: 'Level up your productivity and finances',
        theme_color: '#ffd200',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts']
  }
})
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#ffd200" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>Levl.up</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create src/index.css**

```css
@import "tailwindcss";

:root { color-scheme: dark; }

body {
  background-color: #0d1117;
  color: #e6edf3;
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  min-height: 100dvh;
}
```

- [ ] **Step 5: Create src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 6: Create stub App.tsx**

```tsx
export function App() {
  return <div className="p-4 text-[#ffd200] text-2xl font-bold">Levl.up</div>
}
```

- [ ] **Step 7: Create src/sw.ts (service worker)**

```ts
import { cleanupOutdatedCaches } from 'workbox-precaching'

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
```

- [ ] **Step 8: Create src/test-setup.ts**

```ts
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
```

- [ ] **Step 9: Smoke-test dev server**

```bash
npm run dev:frontend
```

Expected: Vite starts on http://localhost:5173. Open in browser — dark page with yellow "Levl.up" text, no console errors.

Stop with `Ctrl+C`.

- [ ] **Step 10: Commit**

```bash
git add packages/frontend/
git commit -m "feat: frontend PWA scaffold with Vite, React, Tailwind"
```

---

## Task 8: IndexedDB Store

**Files:**
- Create: `packages/frontend/src/utils/crypto.ts`
- Create: `packages/frontend/src/store/db.ts`
- Create: `packages/frontend/src/store/tasks.ts`
- Create: `packages/frontend/src/store/finance.ts`
- Create: `packages/frontend/src/store/streaks.ts`
- Test: `packages/frontend/src/store/tasks.test.ts`
- Test: `packages/frontend/src/store/finance.test.ts`
- Test: `packages/frontend/src/store/streaks.test.ts`

- [ ] **Step 1: Create src/utils/crypto.ts**

```ts
export const crypto = globalThis.crypto
```

- [ ] **Step 2: Create src/store/db.ts**

```ts
import { openDB, type IDBPDatabase } from 'idb'
import type { Task, Streak, Budget, SavingsGoal } from '@levl-up/shared'

export interface LevlUpDB {
  tasks: { key: string; value: Task }
  streaks: { key: string; value: Streak }
  budgets: { key: string; value: Budget }
  savingsGoals: { key: string; value: SavingsGoal }
}

let dbPromise: Promise<IDBPDatabase<LevlUpDB>> | null = null

export function getDB(): Promise<IDBPDatabase<LevlUpDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LevlUpDB>('levl-up', 1, {
      upgrade(db) {
        db.createObjectStore('tasks', { keyPath: 'id' })
        db.createObjectStore('streaks', { keyPath: 'date' })
        db.createObjectStore('budgets', { keyPath: 'id' })
        db.createObjectStore('savingsGoals', { keyPath: 'id' })
      }
    })
  }
  return dbPromise
}

// Test helper — resets cached DB promise so next getDB() call opens fresh
export function _resetDB(): void {
  dbPromise = null
}
```

- [ ] **Step 3: Write failing tests for tasks store**

Create `packages/frontend/src/store/tasks.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { addTask, getTasks, completeTask, deleteTask, createTask } from './tasks'
import { _resetDB } from './db'
import type { Task } from '@levl-up/shared'

beforeEach(() => { _resetDB() })

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test task',
  startDate: new Date('2026-04-05'),
  dueDate: new Date('2026-04-06'),
  category: 'productivity',
  completed: false,
  streakContribution: 'full',
  ...overrides
})

describe('tasks store', () => {
  it('adds and retrieves a task', async () => {
    await addTask(makeTask())
    const tasks = await getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Test task')
  })

  it('completes a task and sets completedDate', async () => {
    await addTask(makeTask())
    await completeTask('1')
    const tasks = await getTasks()
    expect(tasks[0].completed).toBe(true)
    expect(tasks[0].completedDate).toBeInstanceOf(Date)
  })

  it('deletes a task', async () => {
    await addTask(makeTask())
    await deleteTask('1')
    const tasks = await getTasks()
    expect(tasks).toHaveLength(0)
  })

  it('createTask generates id and sets startDate', () => {
    const task = createTask({ title: 'New', dueDate: new Date(), category: 'productivity', streakContribution: 'full' })
    expect(task.id).toBeTruthy()
    expect(task.startDate).toBeInstanceOf(Date)
    expect(task.completed).toBe(false)
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npm run test --workspace=packages/frontend
```

Expected: FAIL — `Cannot find module './tasks'`

- [ ] **Step 5: Implement tasks store**

Create `packages/frontend/src/store/tasks.ts`:

```ts
import { getDB } from './db'
import { crypto } from '../utils/crypto'
import type { Task, StreakContribution } from '@levl-up/shared'

export async function addTask(task: Task): Promise<void> {
  const db = await getDB()
  await db.put('tasks', task)
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDB()
  return db.getAll('tasks')
}

export async function completeTask(id: string): Promise<void> {
  const db = await getDB()
  const task = await db.get('tasks', id)
  if (!task) return
  await db.put('tasks', { ...task, completed: true, completedDate: new Date() })
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('tasks', id)
}

export function createTask(fields: {
  title: string
  dueDate: Date
  category: 'productivity' | 'finance'
  streakContribution: StreakContribution
}): Task {
  return {
    ...fields,
    id: crypto.randomUUID(),
    startDate: new Date(),
    completed: false
  }
}
```

- [ ] **Step 6: Run tasks tests to verify they pass**

```bash
npm run test --workspace=packages/frontend
```

Expected: PASS — 4 tests passing

- [ ] **Step 7: Write failing tests for finance store**

Create `packages/frontend/src/store/finance.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { addBudget, getBudgets, logExpense, addSavingsGoal, getSavingsGoals, updateSavingsGoal } from './finance'
import { _resetDB } from './db'

beforeEach(() => { _resetDB() })

describe('finance store', () => {
  it('adds and retrieves a budget', async () => {
    await addBudget({ id: 'b1', category: 'Food', monthlyLimit: 500, spent: [] })
    const budgets = await getBudgets()
    expect(budgets).toHaveLength(1)
    expect(budgets[0].category).toBe('Food')
  })

  it('logs an expense to a budget', async () => {
    await addBudget({ id: 'b1', category: 'Food', monthlyLimit: 500, spent: [] })
    await logExpense('b1', { amount: 20, date: new Date(), note: 'lunch' })
    const budgets = await getBudgets()
    expect(budgets[0].spent).toHaveLength(1)
    expect(budgets[0].spent[0].amount).toBe(20)
  })

  it('adds and updates a savings goal', async () => {
    await addSavingsGoal({ id: 'g1', title: 'Fund', targetAmount: 1000, currentAmount: 0, deadline: new Date() })
    await updateSavingsGoal('g1', 200)
    const goals = await getSavingsGoals()
    expect(goals[0].currentAmount).toBe(200)
  })
})
```

- [ ] **Step 8: Implement finance store**

Create `packages/frontend/src/store/finance.ts`:

```ts
import { getDB } from './db'
import type { Budget, BudgetEntry, SavingsGoal } from '@levl-up/shared'

export async function addBudget(budget: Budget): Promise<void> {
  const db = await getDB()
  await db.put('budgets', budget)
}

export async function getBudgets(): Promise<Budget[]> {
  const db = await getDB()
  return db.getAll('budgets')
}

export async function logExpense(budgetId: string, entry: BudgetEntry): Promise<void> {
  const db = await getDB()
  const budget = await db.get('budgets', budgetId)
  if (!budget) return
  await db.put('budgets', { ...budget, spent: [...budget.spent, entry] })
}

export async function addSavingsGoal(goal: SavingsGoal): Promise<void> {
  const db = await getDB()
  await db.put('savingsGoals', goal)
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const db = await getDB()
  return db.getAll('savingsGoals')
}

export async function updateSavingsGoal(id: string, newAmount: number): Promise<void> {
  const db = await getDB()
  const goal = await db.get('savingsGoals', id)
  if (!goal) return
  await db.put('savingsGoals', { ...goal, currentAmount: newAmount })
}
```

- [ ] **Step 9: Write failing tests for streaks store**

Create `packages/frontend/src/store/streaks.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getTodayStreak, recordCompletion, isStreakBroken, getStreakHealth, getConsecutiveStreak } from './streaks'
import { _resetDB } from './db'

beforeEach(() => { _resetDB() })

describe('streaks store', () => {
  it('returns null for today if no streak recorded', async () => {
    expect(await getTodayStreak()).toBeNull()
  })

  it('records a completion and creates streak entry', async () => {
    await recordCompletion(3)
    const streak = await getTodayStreak()
    expect(streak?.completedCount).toBe(1)
    expect(streak?.broken).toBe(false)
  })

  it('increments completedCount on subsequent completions', async () => {
    await recordCompletion(3)
    await recordCompletion(3)
    const streak = await getTodayStreak()
    expect(streak?.completedCount).toBe(2)
  })

  it('marks streak as broken when broken flag is true', () => {
    const broken = { date: '2026-04-04', completedCount: 0, totalCount: 3, broken: true }
    expect(isStreakBroken(broken)).toBe(true)
  })

  it('getStreakHealth returns 1 when quota is met', () => {
    expect(getStreakHealth(3, new Date('2026-04-05T18:00:00'), 3)).toBe(1)
  })

  it('getStreakHealth returns value between 0 and 1 when quota not met', () => {
    const health = getStreakHealth(0, new Date('2026-04-05T12:00:00'), 3)
    expect(health).toBeGreaterThan(0)
    expect(health).toBeLessThan(1)
  })

  it('getConsecutiveStreak returns 0 with no data', async () => {
    expect(await getConsecutiveStreak()).toBe(0)
  })
})
```

- [ ] **Step 10: Implement streaks store**

Create `packages/frontend/src/store/streaks.ts`:

```ts
import { getDB } from './db'
import type { Streak } from '@levl-up/shared'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayStreak(): Promise<Streak | null> {
  const db = await getDB()
  return (await db.get('streaks', todayKey())) ?? null
}

export async function recordCompletion(dailyQuota: number): Promise<void> {
  const db = await getDB()
  const key = todayKey()
  const existing = await db.get('streaks', key)
  const current: Streak = existing ?? { date: key, completedCount: 0, totalCount: dailyQuota, broken: false }
  await db.put('streaks', { ...current, completedCount: current.completedCount + 1 })
}

export function isStreakBroken(streak: Streak): boolean {
  return streak.broken
}

/**
 * Returns a health value 0–1.
 * 1.0 = quota met. Decays linearly through the day based on seconds elapsed.
 */
export function getStreakHealth(completedToday: number, now: Date, dailyQuota = 1): number {
  if (completedToday >= dailyQuota) return 1
  const secondsInDay = 24 * 60 * 60
  const elapsed = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  return Math.max(0, 1 - elapsed / secondsInDay)
}

export async function getAllStreaks(): Promise<Streak[]> {
  const db = await getDB()
  return db.getAll('streaks')
}

export async function getConsecutiveStreak(): Promise<number> {
  const streaks = await getAllStreaks()
  const sorted = streaks.sort((a, b) => b.date.localeCompare(a.date))
  let count = 0
  let expected = todayKey()
  for (const s of sorted) {
    if (s.date !== expected || s.broken) break
    count++
    const d = new Date(s.date)
    d.setDate(d.getDate() - 1)
    expected = d.toISOString().slice(0, 10)
  }
  return count
}
```

- [ ] **Step 11: Run all frontend tests**

```bash
npm run test --workspace=packages/frontend
```

Expected: PASS — 15 tests passing

- [ ] **Step 12: Commit**

```bash
git add packages/frontend/src/store/ packages/frontend/src/utils/
git commit -m "feat: IndexedDB store for tasks, finance, and streaks"
```

---

## Task 9: App Shell + Routing

**Files:**
- Modify: `packages/frontend/src/App.tsx`
- Create: `packages/frontend/src/components/TabBar.tsx`
- Create: `packages/frontend/src/features/dashboard/Dashboard.tsx` (stub)
- Create: `packages/frontend/src/features/tasks/TasksTab.tsx` (stub)
- Create: `packages/frontend/src/features/finance/FinanceTab.tsx` (stub)
- Create: `packages/frontend/src/features/settings/SettingsTab.tsx` (stub)
- Create: `packages/frontend/src/features/notifications/AddToHomeScreen.tsx`

- [ ] **Step 1: Create TabBar component**

Create `packages/frontend/src/components/TabBar.tsx`:

```tsx
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🔥' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/settings', label: 'Settings', icon: '⚙️' }
]

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] flex justify-around pb-safe z-40">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-4 text-xs ${isActive ? 'text-[#ffd200]' : 'text-[#8b949e]'}`
          }
        >
          <span className="text-xl">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Create stub feature components**

Create `packages/frontend/src/features/dashboard/Dashboard.tsx`:
```tsx
export function Dashboard() {
  return <div className="p-4"><h1 className="text-2xl font-bold text-[#ffd200]">Today</h1></div>
}
```

Create `packages/frontend/src/features/tasks/TasksTab.tsx`:
```tsx
export function TasksTab() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Tasks</h1></div>
}
```

Create `packages/frontend/src/features/finance/FinanceTab.tsx`:
```tsx
export function FinanceTab() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Finance</h1></div>
}
```

Create `packages/frontend/src/features/settings/SettingsTab.tsx`:
```tsx
export function SettingsTab() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Settings</h1></div>
}
```

- [ ] **Step 3: Create AddToHomeScreen prompt**

Create `packages/frontend/src/features/notifications/AddToHomeScreen.tsx`:

```tsx
import { useEffect, useState } from 'react'

export function AddToHomeScreen() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('a2hs-dismissed')
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS && !isStandalone && !dismissed) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-[#161b22] border border-[#ffd200] rounded-xl p-4 z-50 shadow-xl">
      <button
        onClick={() => { setShow(false); localStorage.setItem('a2hs-dismissed', '1') }}
        className="absolute top-2 right-3 text-[#8b949e] text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
      <p className="text-sm font-semibold mb-1">Install Levl.up on your iPhone</p>
      <p className="text-xs text-[#8b949e]">
        Tap <strong className="text-[#e6edf3]">Share</strong> then{' '}
        <strong className="text-[#e6edf3]">"Add to Home Screen"</strong> to get push
        notifications and the full app experience.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Wire up App.tsx**

Replace `packages/frontend/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { Dashboard } from './features/dashboard/Dashboard'
import { TasksTab } from './features/tasks/TasksTab'
import { FinanceTab } from './features/finance/FinanceTab'
import { SettingsTab } from './features/settings/SettingsTab'
import { AddToHomeScreen } from './features/notifications/AddToHomeScreen'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksTab />} />
          <Route path="/finance" element={<FinanceTab />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </div>
      <AddToHomeScreen />
      <TabBar />
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Smoke test in browser**

```bash
npm run dev:frontend
```

Open http://localhost:5173. Expected: dark app with bottom tab bar, tapping tabs navigates between pages.

- [ ] **Step 6: Commit**

```bash
git add packages/frontend/src/App.tsx packages/frontend/src/components/ packages/frontend/src/features/
git commit -m "feat: app shell with bottom tab navigation and iOS install prompt"
```

---

## Task 10: Dashboard Feature

**Files:**
- Modify: `packages/frontend/src/features/dashboard/Dashboard.tsx`
- Create: `packages/frontend/src/features/dashboard/StreakCounter.tsx`
- Create: `packages/frontend/src/features/dashboard/HealthBar.tsx`
- Test: `packages/frontend/src/features/dashboard/Dashboard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/frontend/src/features/dashboard/Dashboard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from './Dashboard'

vi.mock('../../store/streaks', () => ({
  getTodayStreak: vi.fn().mockResolvedValue(null),
  getConsecutiveStreak: vi.fn().mockResolvedValue(7),
  getStreakHealth: vi.fn().mockReturnValue(0.6)
}))

vi.mock('../../store/tasks', () => ({
  getTasks: vi.fn().mockResolvedValue([
    {
      id: '1', title: 'Morning workout', completed: false,
      dueDate: new Date(), startDate: new Date(),
      category: 'productivity', streakContribution: 'full'
    }
  ])
}))

describe('Dashboard', () => {
  it('renders streak count', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(await screen.findByText('7')).toBeInTheDocument()
  })

  it('renders next task title', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(await screen.findByText('Morning workout')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test --workspace=packages/frontend
```

Expected: FAIL — Dashboard renders stub, not streak data

- [ ] **Step 3: Implement StreakCounter**

Create `packages/frontend/src/features/dashboard/StreakCounter.tsx`:

```tsx
interface Props { count: number }

export function StreakCounter({ count }: Props) {
  return (
    <div className="flex flex-col items-center py-8">
      <span className="text-5xl">🔥</span>
      <span className="text-7xl font-black text-[#ffd200] leading-none mt-2">{count}</span>
      <span className="text-xs text-[#8b949e] tracking-widest mt-2 uppercase">Day Streak</span>
    </div>
  )
}
```

- [ ] **Step 4: Implement HealthBar**

Create `packages/frontend/src/features/dashboard/HealthBar.tsx`:

```tsx
interface Props { health: number }  // 0–1

export function HealthBar({ health }: Props) {
  const pct = Math.round(health * 100)
  const color = health > 0.5 ? '#3fb950' : health > 0.25 ? '#ffd200' : '#f85149'
  return (
    <div className="px-6 pb-4">
      <div className="flex justify-between text-xs text-[#8b949e] mb-1">
        <span>Streak health</span>
        <span>{pct}%</span>
      </div>
      <div className="bg-[#21262d] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement Dashboard**

Replace `packages/frontend/src/features/dashboard/Dashboard.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StreakCounter } from './StreakCounter'
import { HealthBar } from './HealthBar'
import { getConsecutiveStreak, getTodayStreak, getStreakHealth } from '../../store/streaks'
import { getTasks } from '../../store/tasks'
import type { Task } from '@levl-up/shared'

export function Dashboard() {
  const [streak, setStreak] = useState(0)
  const [health, setHealth] = useState(1)
  const [completedToday, setCompletedToday] = useState(0)
  const [totalToday, setTotalToday] = useState(0)
  const [nextTask, setNextTask] = useState<Task | null>(null)

  useEffect(() => {
    async function load() {
      const [consecutive, todayStreak, tasks] = await Promise.all([
        getConsecutiveStreak(),
        getTodayStreak(),
        getTasks()
      ])
      setStreak(consecutive)
      const completed = todayStreak?.completedCount ?? 0
      setCompletedToday(completed)
      const todayStr = new Date().toDateString()
      const todayPending = tasks.filter(
        (t) => !t.completed && new Date(t.dueDate).toDateString() === todayStr
      )
      setTotalToday(todayPending.length)
      setNextTask(todayPending[0] ?? null)
      setHealth(getStreakHealth(completed, new Date()))
    }
    load()
  }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#1a1a2e] to-[#0d1117]">
      <StreakCounter count={streak} />
      <HealthBar health={health} />

      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <Link to="/tasks" className="bg-[#161b22] rounded-xl p-4 text-center border border-[#30363d]">
          <div className="text-2xl font-bold text-[#58a6ff]">{completedToday}/{totalToday}</div>
          <div className="text-xs text-[#8b949e] mt-1">Tasks Today</div>
        </Link>
        <Link to="/finance" className="bg-[#161b22] rounded-xl p-4 text-center border border-[#30363d]">
          <div className="text-2xl font-bold text-[#3fb950]">💰</div>
          <div className="text-xs text-[#8b949e] mt-1">Finance</div>
        </Link>
      </div>

      {nextTask && (
        <div className="mx-4 bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
          <div className="text-xs text-[#8b949e] mb-1 uppercase tracking-wide">Next Task</div>
          <div className="font-semibold text-[#ffd200]">{nextTask.title}</div>
          <div className="text-xs text-[#8b949e] mt-1">Due today · streaks on completion</div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run tests**

```bash
npm run test --workspace=packages/frontend
```

Expected: PASS — 17 tests passing

- [ ] **Step 7: Commit**

```bash
git add packages/frontend/src/features/dashboard/
git commit -m "feat: dashboard with streak HUD, health bar, and next task card"
```

---

## Task 11: Tasks Feature

**Files:**
- Modify: `packages/frontend/src/features/tasks/TasksTab.tsx`
- Create: `packages/frontend/src/features/tasks/TaskItem.tsx`
- Create: `packages/frontend/src/features/tasks/TaskForm.tsx`
- Test: `packages/frontend/src/features/tasks/TasksTab.test.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/frontend/src/features/tasks/TasksTab.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TasksTab } from './TasksTab'
import type { Task } from '@levl-up/shared'

const mockTask: Task = {
  id: '1', title: 'Morning workout',
  startDate: new Date(), dueDate: new Date(),
  category: 'productivity', completed: false, streakContribution: 'full'
}

vi.mock('../../store/tasks', () => ({
  getTasks: vi.fn().mockResolvedValue([mockTask]),
  completeTask: vi.fn().mockResolvedValue(undefined),
  addTask: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  createTask: vi.fn().mockImplementation((fields) => ({
    ...fields, id: '2', startDate: new Date(), completed: false
  }))
}))

vi.mock('../../store/streaks', () => ({
  recordCompletion: vi.fn().mockResolvedValue(undefined)
}))

describe('TasksTab', () => {
  it('renders task title', async () => {
    render(<MemoryRouter><TasksTab /></MemoryRouter>)
    expect(await screen.findByText('Morning workout')).toBeInTheDocument()
  })

  it('shows complete button for incomplete task', async () => {
    render(<MemoryRouter><TasksTab /></MemoryRouter>)
    expect(await screen.findByRole('button', { name: /complete/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test --workspace=packages/frontend
```

Expected: FAIL — TasksTab renders stub

- [ ] **Step 3: Implement TaskItem**

Create `packages/frontend/src/features/tasks/TaskItem.tsx`:

```tsx
import type { Task } from '@levl-up/shared'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onComplete, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${task.completed ? 'line-through text-[#8b949e]' : 'text-[#e6edf3]'}`}>
          {task.title}
        </div>
        <div className="text-xs text-[#8b949e] mt-0.5">
          Due {new Date(task.dueDate).toLocaleDateString()} · {task.category}
        </div>
      </div>
      {!task.completed && (
        <button
          aria-label="Complete"
          onClick={() => onComplete(task.id)}
          className="text-xs bg-[#238636] text-white px-3 py-1.5 rounded-lg font-medium shrink-0"
        >
          Complete
        </button>
      )}
      <button
        aria-label="Delete"
        onClick={() => onDelete(task.id)}
        className="text-[#8b949e] hover:text-[#f85149] text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Implement TaskForm**

Create `packages/frontend/src/features/tasks/TaskForm.tsx`:

```tsx
import { useState } from 'react'
import type { StreakContribution } from '@levl-up/shared'

interface Fields {
  title: string
  dueDate: Date
  category: 'productivity' | 'finance'
  streakContribution: StreakContribution
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
}

export function TaskForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<'productivity' | 'finance'>('productivity')
  const [streakContribution, setStreakContribution] = useState<StreakContribution>('full')

  function handleSubmit() {
    if (!title.trim()) return
    onSubmit({ title: title.trim(), dueDate: new Date(dueDate), category, streakContribution })
  }

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3">
      <input
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <select
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value as 'productivity' | 'finance')}
      >
        <option value="productivity">Productivity</option>
        <option value="finance">Finance</option>
      </select>
      <select
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={streakContribution}
        onChange={(e) => setStreakContribution(e.target.value as StreakContribution)}
      >
        <option value="full">Full streak contribution</option>
        <option value="partial">Partial streak contribution</option>
        <option value="none">No streak contribution</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
        >
          Add Task
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement TasksTab**

Replace `packages/frontend/src/features/tasks/TasksTab.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { getTasks, addTask, completeTask, deleteTask, createTask } from '../../store/tasks'
import { recordCompletion } from '../../store/streaks'
import type { Task, StreakContribution } from '@levl-up/shared'

export function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)

  async function load() { setTasks(await getTasks()) }

  useEffect(() => { load() }, [])

  async function handleComplete(id: string) {
    await completeTask(id)
    const task = tasks.find((t) => t.id === id)
    if (task?.streakContribution !== 'none') await recordCompletion(1)
    await load()
  }

  async function handleAdd(fields: { title: string; dueDate: Date; category: 'productivity' | 'finance'; streakContribution: StreakContribution }) {
    await addTask(createTask(fields))
    setShowForm(false)
    await load()
  }

  const todayStr = new Date().toDateString()
  const todayTasks = tasks.filter((t) => new Date(t.dueDate).toDateString() === todayStr)
  const overdueTasks = tasks.filter((t) => !t.completed && new Date(t.dueDate) < new Date() && new Date(t.dueDate).toDateString() !== todayStr)
  const upcomingTasks = tasks.filter((t) => new Date(t.dueDate) > new Date() && new Date(t.dueDate).toDateString() !== todayStr)

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#238636] text-white px-4 py-1.5 rounded-lg text-sm font-medium"
        >
          + Add
        </button>
      </div>

      {showForm && <TaskForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}

      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-[#f85149] mb-2">Overdue</h2>
          <div className="space-y-2">
            {overdueTasks.map((t) => <TaskItem key={t.id} task={t} onComplete={handleComplete} onDelete={async (id) => { await deleteTask(id); load() }} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Today</h2>
        <div className="space-y-2">
          {todayTasks.length === 0 && <p className="text-[#8b949e] text-sm">No tasks for today</p>}
          {todayTasks.map((t) => <TaskItem key={t.id} task={t} onComplete={handleComplete} onDelete={async (id) => { await deleteTask(id); load() }} />)}
        </div>
      </section>

      {upcomingTasks.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Upcoming</h2>
          <div className="space-y-2">
            {upcomingTasks.map((t) => <TaskItem key={t.id} task={t} onComplete={handleComplete} onDelete={async (id) => { await deleteTask(id); load() }} />)}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run tests**

```bash
npm run test --workspace=packages/frontend
```

Expected: PASS — 19 tests passing

- [ ] **Step 7: Commit**

```bash
git add packages/frontend/src/features/tasks/
git commit -m "feat: tasks tab with add, complete, delete grouped by today/upcoming/overdue"
```

---

## Task 12: Finance Feature

**Files:**
- Modify: `packages/frontend/src/features/finance/FinanceTab.tsx`
- Create: `packages/frontend/src/features/finance/BudgetCard.tsx`
- Create: `packages/frontend/src/features/finance/SavingsGoalCard.tsx`
- Create: `packages/frontend/src/features/finance/ExpenseForm.tsx`
- Test: `packages/frontend/src/features/finance/FinanceTab.test.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/frontend/src/features/finance/FinanceTab.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FinanceTab } from './FinanceTab'

vi.mock('../../store/finance', () => ({
  getBudgets: vi.fn().mockResolvedValue([
    { id: 'b1', category: 'Food', monthlyLimit: 500, spent: [{ amount: 120, date: new Date() }] }
  ]),
  getSavingsGoals: vi.fn().mockResolvedValue([
    { id: 'g1', title: 'Emergency Fund', targetAmount: 1000, currentAmount: 620, deadline: new Date() }
  ]),
  logExpense: vi.fn().mockResolvedValue(undefined),
  addBudget: vi.fn().mockResolvedValue(undefined),
  addSavingsGoal: vi.fn().mockResolvedValue(undefined),
  updateSavingsGoal: vi.fn().mockResolvedValue(undefined)
}))

describe('FinanceTab', () => {
  it('renders budget category name', async () => {
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByText('Food')).toBeInTheDocument()
  })

  it('renders savings goal title', async () => {
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByText('Emergency Fund')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test --workspace=packages/frontend
```

Expected: FAIL — FinanceTab renders stub

- [ ] **Step 3: Implement BudgetCard**

Create `packages/frontend/src/features/finance/BudgetCard.tsx`:

```tsx
import type { Budget } from '@levl-up/shared'

interface Props {
  budget: Budget
  onLogExpense: (budgetId: string) => void
}

export function BudgetCard({ budget, onLogExpense }: Props) {
  const totalSpent = budget.spent.reduce((sum, e) => sum + e.amount, 0)
  const pct = Math.min(100, Math.round((totalSpent / budget.monthlyLimit) * 100))
  const color = pct < 70 ? '#3fb950' : pct < 90 ? '#ffd200' : '#f85149'

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{budget.category}</span>
        <button onClick={() => onLogExpense(budget.id)} className="text-xs text-[#58a6ff]">
          + Log expense
        </button>
      </div>
      <div className="bg-[#21262d] rounded-full h-2 mb-1">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-xs text-[#8b949e]">
        <span>${totalSpent} spent</span>
        <span>${budget.monthlyLimit} limit</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement SavingsGoalCard**

Create `packages/frontend/src/features/finance/SavingsGoalCard.tsx`:

```tsx
import type { SavingsGoal } from '@levl-up/shared'

interface Props {
  goal: SavingsGoal
  onContribute: (goalId: string) => void
}

export function SavingsGoalCard({ goal, onContribute }: Props) {
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{goal.title}</span>
        {goal.linkedStreak && <span className="text-xs text-[#ffd200]">🔥 streak linked</span>}
      </div>
      <div className="bg-[#21262d] rounded-full h-2 mb-1">
        <div className="h-2 rounded-full bg-[#3fb950] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[#8b949e]">
        <span>${goal.currentAmount} / ${goal.targetAmount}</span>
        <button onClick={() => onContribute(goal.id)} className="text-[#58a6ff]">+ Contribute</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement ExpenseForm**

Create `packages/frontend/src/features/finance/ExpenseForm.tsx`:

```tsx
import { useState } from 'react'
import type { Budget } from '@levl-up/shared'

interface Props {
  budgets: Budget[]
  initialBudgetId?: string
  onSubmit: (budgetId: string, amount: number, note: string) => void
  onCancel: () => void
}

export function ExpenseForm({ budgets, initialBudgetId, onSubmit, onCancel }: Props) {
  const [budgetId, setBudgetId] = useState(initialBudgetId ?? budgets[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3">
      <select
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        value={budgetId}
        onChange={(e) => setBudgetId(e.target.value)}
      >
        {budgets.map((b) => <option key={b.id} value={b.id}>{b.category}</option>)}
      </select>
      <input
        type="number"
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        placeholder="Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => amount && onSubmit(budgetId, parseFloat(amount), note)}
          className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
        >
          Log Expense
        </button>
        <button onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Implement FinanceTab**

Replace `packages/frontend/src/features/finance/FinanceTab.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { BudgetCard } from './BudgetCard'
import { SavingsGoalCard } from './SavingsGoalCard'
import { ExpenseForm } from './ExpenseForm'
import { getBudgets, getSavingsGoals, logExpense, updateSavingsGoal } from '../../store/finance'
import type { Budget, SavingsGoal } from '@levl-up/shared'

export function FinanceTab() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [logBudgetId, setLogBudgetId] = useState<string | null>(null)

  async function load() {
    const [b, g] = await Promise.all([getBudgets(), getSavingsGoals()])
    setBudgets(b)
    setGoals(g)
  }

  useEffect(() => { load() }, [])

  async function handleLogExpense(budgetId: string, amount: number, note: string) {
    await logExpense(budgetId, { amount, date: new Date(), note })
    setLogBudgetId(null)
    await load()
  }

  async function handleContribute(goalId: string) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const amountStr = prompt('How much are you contributing? ($)')
    if (!amountStr || isNaN(parseFloat(amountStr))) return
    await updateSavingsGoal(goalId, goal.currentAmount + parseFloat(amountStr))
    await load()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Finance</h1>

      {logBudgetId && (
        <ExpenseForm
          budgets={budgets}
          initialBudgetId={logBudgetId}
          onSubmit={handleLogExpense}
          onCancel={() => setLogBudgetId(null)}
        />
      )}

      <section>
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Budgets</h2>
        <div className="space-y-2">
          {budgets.length === 0 && <p className="text-[#8b949e] text-sm">No budgets yet</p>}
          {budgets.map((b) => <BudgetCard key={b.id} budget={b} onLogExpense={setLogBudgetId} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Savings Goals</h2>
        <div className="space-y-2">
          {goals.length === 0 && <p className="text-[#8b949e] text-sm">No savings goals yet</p>}
          {goals.map((g) => <SavingsGoalCard key={g.id} goal={g} onContribute={handleContribute} />)}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 7: Run tests**

```bash
npm run test --workspace=packages/frontend
```

Expected: PASS — 21 tests passing

- [ ] **Step 8: Commit**

```bash
git add packages/frontend/src/features/finance/
git commit -m "feat: finance tab with budget tracking and savings goals"
```

---

## Task 13: Settings + Push Subscription

**Files:**
- Modify: `packages/frontend/src/features/settings/SettingsTab.tsx`
- Create: `packages/frontend/src/features/notifications/usePushSubscription.ts`
- Create: `packages/frontend/.env.example`
- Test: `packages/frontend/src/features/notifications/usePushSubscription.test.ts`

The VAPID public key from Task 6 goes in the frontend `.env`.

- [ ] **Step 1: Create packages/frontend/.env**

```
VITE_VAPID_PUBLIC_KEY=<paste_public_key_from_task_6>
VITE_BACKEND_URL=http://localhost:3001
```

- [ ] **Step 2: Create packages/frontend/.env.example**

```
VITE_VAPID_PUBLIC_KEY=
VITE_BACKEND_URL=http://localhost:3001
```

- [ ] **Step 3: Write failing test for usePushSubscription utility**

Create `packages/frontend/src/features/notifications/usePushSubscription.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { urlBase64ToUint8Array } from './usePushSubscription'

describe('urlBase64ToUint8Array', () => {
  it('converts a base64url string to Uint8Array', () => {
    const result = urlBase64ToUint8Array('dGVzdA')  // 'test' in base64url
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles padding correctly', () => {
    // 'te' in base64url = 'dGU'
    const result = urlBase64ToUint8Array('dGU')
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npm run test --workspace=packages/frontend
```

Expected: FAIL — `Cannot find module './usePushSubscription'`

- [ ] **Step 5: Implement usePushSubscription**

Create `packages/frontend/src/features/notifications/usePushSubscription.ts`:

```ts
import { useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
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
```

- [ ] **Step 6: Implement SettingsTab**

Replace `packages/frontend/src/features/settings/SettingsTab.tsx`:

```tsx
import { useState } from 'react'
import { usePushSubscription } from '../notifications/usePushSubscription'

export function SettingsTab() {
  const [reminderTime, setReminderTime] = useState('09:00')
  const [warningTime, setWarningTime] = useState('20:00')
  const [dailyQuota, setDailyQuota] = useState('1')
  const { subscribed, loading, error, subscribe, unsubscribe } = usePushSubscription()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">Push Notifications</h2>
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm">Daily reminder</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3]"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm">Streak warning</label>
            <input
              type="time"
              value={warningTime}
              onChange={(e) => setWarningTime(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3]"
            />
          </div>
          <div className="text-xs text-[#8b949e]">Timezone: {timezone}</div>
          {error && <p className="text-xs text-[#f85149]">{error}</p>}
          {subscribed ? (
            <button
              onClick={unsubscribe}
              disabled={loading}
              className="w-full bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
            >
              {loading ? 'Loading…' : 'Disable Notifications'}
            </button>
          ) : (
            <button
              onClick={() => subscribe(timezone, reminderTime, warningTime)}
              disabled={loading}
              className="w-full bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
            >
              {loading ? 'Enabling…' : 'Enable Notifications'}
            </button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-[#8b949e]">Daily Streak Goal</h2>
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] flex justify-between items-center">
          <label className="text-sm">Tasks per day to maintain streak</label>
          <input
            type="number"
            min="1"
            max="20"
            value={dailyQuota}
            onChange={(e) => setDailyQuota(e.target.value)}
            className="w-16 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3] text-center"
          />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 7: Run all tests**

```bash
npm run test --workspaces
```

Expected: PASS — all tests passing across all three packages

- [ ] **Step 8: Commit**

```bash
git add packages/frontend/src/features/settings/ packages/frontend/src/features/notifications/ packages/frontend/.env.example packages/backend/.env.example
git commit -m "feat: settings tab with push subscription and notification time config"
```

---

## Task 14: Final Integration Check

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

Expected: all tests pass with no failures

- [ ] **Step 2: Start backend**

Terminal 1:
```bash
npm run dev:backend
```

Expected: `Levl.up backend running on http://localhost:3001` and `Scheduler started`

- [ ] **Step 3: Start frontend**

Terminal 2:
```bash
npm run dev:frontend
```

Expected: Vite running on http://localhost:5173

- [ ] **Step 4: Manual smoke test checklist**

Open http://localhost:5173 on desktop and on your phone (replace localhost with your machine's local IP):

- [ ] Dashboard shows 🔥 streak counter and health bar
- [ ] Tasks tab: add a task, it appears in Today section
- [ ] Complete a task: it shows strikethrough
- [ ] Finance tab: budgets and savings goals sections visible
- [ ] Settings tab: time pickers render, timezone detected correctly
- [ ] `curl http://localhost:3001/health` returns `{"status":"ok"}`
- [ ] On iOS Safari: visit the local IP URL → Add to Home Screen prompt appears

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: final integration verified"
```
