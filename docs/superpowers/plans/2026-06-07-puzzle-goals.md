# Puzzle Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Goals tab where users link tasks to goals and unlock puzzle pieces by completing them — breaking their streak resets the puzzle to zero.

**Architecture:** A new `Goal` entity lives in IndexedDB alongside tasks. Tasks gain an optional `goalId` field. Puzzle progress is computed dynamically (completed goal tasks / total goal tasks × piece count); streak break sets `lastResetAt` on all active goals so only post-reset completions count. Six CSS-gradient "images" are embedded as constants — no external assets.

**Tech Stack:** React 19, TypeScript, Tailwind v4, idb (IndexedDB), vitest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/shared/src/types.ts` | Modify | Add `Goal`, `PuzzleImageId`; add `goalId?` to `Task` |
| `packages/frontend/src/store/db.ts` | Modify | Add `goals` store, bump DB version to 2 |
| `packages/frontend/src/store/goals.ts` | Create | CRUD + `getPieceCount` + `getRevealedPieces` helpers |
| `packages/frontend/src/features/goals/PuzzleImages.ts` | Create | 6 CSS gradient definitions + display names |
| `packages/frontend/src/features/goals/PuzzleBoard.tsx` | Create | Grid of revealed/hidden tiles |
| `packages/frontend/src/features/goals/GoalForm.tsx` | Create | Create-goal form (title, deadline, image picker) |
| `packages/frontend/src/features/goals/GoalCard.tsx` | Create | Goal card with inline PuzzleBoard |
| `packages/frontend/src/features/goals/GoalsTab.tsx` | Create | Full tab: list goals, streak-break detection |
| `packages/frontend/src/features/tasks/TaskForm.tsx` | Modify | Add optional goal picker dropdown |
| `packages/frontend/src/components/TabBar.tsx` | Modify | Add Goals tab (🎯) between Tasks and Finance |
| `packages/frontend/src/App.tsx` | Modify | Add `/goals` route |

---

## Task 1 — Shared Types

**Files:**
- Modify: `packages/shared/src/types.ts`
- Test: none (type-only change; TypeScript compiler is the test)

- [ ] **Step 1: Add `PuzzleImageId`, `Goal`, update `Task`**

Open `packages/shared/src/types.ts`. The full file after changes:

```ts
export type StreakContribution = 'none' | 'partial' | 'full'

export type PuzzleImageId = 'mountain' | 'ocean' | 'forest' | 'space' | 'city' | 'abstract'

export interface Task {
  id: string
  title: string
  startDate: Date
  dueDate: Date
  completedDate?: Date
  category: 'productivity' | 'finance'
  completed: boolean
  streakContribution: StreakContribution
  goalId?: string
}

export interface Goal {
  id: string
  title: string
  deadline: Date
  createdAt: Date
  puzzleImageId: PuzzleImageId
  completed: boolean
  lastResetAt?: string  // YYYY-MM-DD UTC; tasks completed before this don't count toward puzzle
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

export interface AppPushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
  timezone: string
  dailyReminderTime: string   // HH:MM
  streakWarningTime: string   // HH:MM
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/bayeh/Documents/VibeCoding2025/ProcrastinationApp
npm run test --workspace=packages/shared 2>&1 | tail -5
```

Expected: `Tests  4 passed`

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat: add Goal type and PuzzleImageId to shared types"
```

---

## Task 2 — Database Schema

**Files:**
- Modify: `packages/frontend/src/store/db.ts`

- [ ] **Step 1: Update `LevlUpDB` and bump version to 2**

Full replacement of `packages/frontend/src/store/db.ts`:

```ts
import { openDB, type IDBPDatabase } from 'idb'
import type { Task, Streak, Budget, SavingsGoal, Goal } from '@levl-up/shared'

export interface LevlUpDB {
  tasks: { key: string; value: Task }
  streaks: { key: string; value: Streak }
  budgets: { key: string; value: Budget }
  savingsGoals: { key: string; value: SavingsGoal }
  goals: { key: string; value: Goal }
}

let dbPromise: Promise<IDBPDatabase<LevlUpDB>> | null = null
let dbCounter = 0

function dbName(): string {
  return `levl-up-${dbCounter}`
}

export function getDB(): Promise<IDBPDatabase<LevlUpDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LevlUpDB>(dbName(), 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('tasks', { keyPath: 'id' })
          db.createObjectStore('streaks', { keyPath: 'date' })
          db.createObjectStore('budgets', { keyPath: 'id' })
          db.createObjectStore('savingsGoals', { keyPath: 'id' })
        }
        if (oldVersion < 2) {
          db.createObjectStore('goals', { keyPath: 'id' })
        }
      }
    })
  }
  return dbPromise
}

export function _resetDB(): void {
  dbCounter++
  dbPromise = null
}
```

- [ ] **Step 2: Run all frontend tests to confirm nothing broke**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep -E "Tests|FAIL"
```

Expected: `Tests  48 passed`

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/store/db.ts
git commit -m "feat: add goals object store to IndexedDB (version 2)"
```

---

## Task 3 — Goals Store

**Files:**
- Create: `packages/frontend/src/store/goals.ts`
- Create: `packages/frontend/src/store/goals.test.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/frontend/src/store/goals.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { addGoal, getGoals, updateGoal, resetGoalProgress, getPieceCount, getRevealedPieces } from './goals'
import { _resetDB } from './db'
import type { Goal, Task } from '@levl-up/shared'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: 'Test Goal',
    deadline: new Date(Date.now() + 30 * 86400000), // 30 days from now
    createdAt: new Date(),
    puzzleImageId: 'mountain',
    completed: false,
    ...overrides
  }
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    startDate: new Date(),
    dueDate: new Date(),
    category: 'productivity',
    completed: false,
    streakContribution: 'full',
    goalId: 'g1',
    ...overrides
  }
}

describe('getPieceCount', () => {
  it('returns 4 for 7-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 7 * 86400000) })
    expect(getPieceCount(goal)).toBe(4)
  })
  it('returns 9 for 14-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 14 * 86400000) })
    expect(getPieceCount(goal)).toBe(9)
  })
  it('returns 16 for 30-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 30 * 86400000) })
    expect(getPieceCount(goal)).toBe(16)
  })
  it('returns 25 for 60-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 60 * 86400000) })
    expect(getPieceCount(goal)).toBe(25)
  })
  it('returns 36 for 90-day goal', () => {
    const goal = makeGoal({ deadline: new Date(Date.now() + 90 * 86400000) })
    expect(getPieceCount(goal)).toBe(36)
  })
})

describe('getRevealedPieces', () => {
  it('returns 0 with no tasks', () => {
    expect(getRevealedPieces(makeGoal(), [])).toBe(0)
  })

  it('returns 0 when no tasks are completed', () => {
    const tasks = [makeTask({ completed: false }), makeTask({ id: 't2', completed: false })]
    expect(getRevealedPieces(makeGoal(), tasks)).toBe(0)
  })

  it('returns proportional pieces when tasks completed', () => {
    // 30-day goal = 16 pieces; 2 of 4 tasks completed = 8 pieces
    const goal = makeGoal({ deadline: new Date(Date.now() + 30 * 86400000) })
    const tasks = [
      makeTask({ id: 't1', completed: true, completedDate: new Date() }),
      makeTask({ id: 't2', completed: true, completedDate: new Date() }),
      makeTask({ id: 't3', completed: false }),
      makeTask({ id: 't4', completed: false }),
    ]
    expect(getRevealedPieces(goal, tasks)).toBe(8)
  })

  it('returns 0 after streak reset (completedDate before lastResetAt)', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const goal = makeGoal({ lastResetAt: new Date().toISOString().slice(0, 10) })
    const tasks = [
      makeTask({ id: 't1', completed: true, completedDate: new Date(Date.now() - 86400000) }),
    ]
    expect(getRevealedPieces(goal, tasks)).toBe(0)
  })
})

describe('goals store', () => {
  beforeEach(() => _resetDB())

  it('stores and retrieves a goal', async () => {
    const goal = makeGoal()
    await addGoal(goal)
    const all = await getGoals()
    expect(all).toHaveLength(1)
    expect(all[0].title).toBe('Test Goal')
  })

  it('updateGoal patches fields', async () => {
    await addGoal(makeGoal())
    await updateGoal('g1', { completed: true })
    const all = await getGoals()
    expect(all[0].completed).toBe(true)
  })

  it('resetGoalProgress sets lastResetAt to today', async () => {
    await addGoal(makeGoal())
    await resetGoalProgress('g1')
    const all = await getGoals()
    const today = new Date().toISOString().slice(0, 10)
    expect(all[0].lastResetAt).toBe(today)
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
npm run test --workspace=packages/frontend -- --reporter=verbose 2>&1 | grep "goals.test" | head -5
```

Expected: FAIL (module not found)

- [ ] **Step 3: Implement `packages/frontend/src/store/goals.ts`**

```ts
import { getDB } from './db'
import type { Goal, Task } from '@levl-up/shared'

export async function addGoal(goal: Goal): Promise<void> {
  const db = await getDB()
  await db.put('goals', goal)
}

export async function getGoals(): Promise<Goal[]> {
  const db = await getDB()
  return db.getAll('goals')
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const db = await getDB()
  const goal = await db.get('goals', id)
  if (!goal) return
  await db.put('goals', { ...goal, ...updates })
}

export async function resetGoalProgress(id: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  await updateGoal(id, { lastResetAt: today })
}

export function getPieceCount(goal: Goal): number {
  const days = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime()) / 86400000
  )
  if (days <= 7) return 4
  if (days <= 14) return 9
  if (days <= 30) return 16
  if (days <= 60) return 25
  return 36
}

export function getGridSize(pieceCount: number): number {
  return Math.round(Math.sqrt(pieceCount))  // 2, 3, 4, 5, or 6
}

export function getRevealedPieces(goal: Goal, tasks: Task[]): number {
  const goalTasks = tasks.filter((t) => t.goalId === goal.id)
  if (goalTasks.length === 0) return 0
  const since = goal.lastResetAt ?? '2000-01-01'
  const completed = goalTasks.filter(
    (t) =>
      t.completed &&
      t.completedDate &&
      new Date(t.completedDate).toISOString().slice(0, 10) >= since
  ).length
  const totalPieces = getPieceCount(goal)
  return Math.min(totalPieces, Math.floor((completed / goalTasks.length) * totalPieces))
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep -E "Tests|FAIL"
```

Expected: `Tests  63 passed` (48 existing + 15 new)

- [ ] **Step 5: Commit**

```bash
git add packages/frontend/src/store/goals.ts packages/frontend/src/store/goals.test.ts
git commit -m "feat: goals store with puzzle piece helpers"
```

---

## Task 4 — PuzzleImages + PuzzleBoard

**Files:**
- Create: `packages/frontend/src/features/goals/PuzzleImages.ts`
- Create: `packages/frontend/src/features/goals/PuzzleBoard.tsx`
- Create: `packages/frontend/src/features/goals/PuzzleBoard.test.tsx`

- [ ] **Step 1: Write failing PuzzleBoard test**

Create `packages/frontend/src/features/goals/PuzzleBoard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PuzzleBoard } from './PuzzleBoard'

describe('PuzzleBoard', () => {
  it('renders the correct total number of tiles', () => {
    const { container } = render(
      <PuzzleBoard totalPieces={9} revealedPieces={0} imageId="mountain" />
    )
    expect(container.querySelectorAll('[data-tile]')).toHaveLength(9)
  })

  it('marks revealed tiles correctly', () => {
    const { container } = render(
      <PuzzleBoard totalPieces={9} revealedPieces={3} imageId="ocean" />
    )
    expect(container.querySelectorAll('[data-tile="revealed"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-tile="hidden"]')).toHaveLength(6)
  })

  it('renders all revealed when revealedPieces equals totalPieces', () => {
    const { container } = render(
      <PuzzleBoard totalPieces={4} revealedPieces={4} imageId="forest" />
    )
    expect(container.querySelectorAll('[data-tile="hidden"]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep "PuzzleBoard" | head -3
```

Expected: FAIL (module not found)

- [ ] **Step 3: Create `PuzzleImages.ts`**

```ts
import type { PuzzleImageId } from '@levl-up/shared'

export const PUZZLE_IMAGES: Record<PuzzleImageId, { label: string; gradient: string }> = {
  mountain: {
    label: 'Mountain',
    gradient: 'linear-gradient(160deg, #0d1117 0%, #1a3a27 35%, #3fb950 65%, #58a6ff 100%)',
  },
  ocean: {
    label: 'Ocean',
    gradient: 'linear-gradient(180deg, #58a6ff 0%, #0d3a6e 50%, #0d1117 100%)',
  },
  forest: {
    label: 'Forest',
    gradient: 'linear-gradient(170deg, #0d1117 0%, #1a3a27 40%, #3fb950 70%, #ffd200 100%)',
  },
  space: {
    label: 'Space',
    gradient: 'radial-gradient(ellipse at 30% 40%, #6e40c9 0%, #0d1117 60%), linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)',
  },
  city: {
    label: 'City',
    gradient: 'linear-gradient(180deg, #0d1117 0%, #1a1a2e 40%, #58a6ff 70%, #ffd200 100%)',
  },
  abstract: {
    label: 'Abstract',
    gradient: 'linear-gradient(45deg, #f85149 0%, #ffd200 25%, #3fb950 50%, #58a6ff 75%, #6e40c9 100%)',
  },
}
```

- [ ] **Step 4: Create `PuzzleBoard.tsx`**

```tsx
import { getGridSize } from '../../store/goals'
import { PUZZLE_IMAGES } from './PuzzleImages'
import type { PuzzleImageId } from '@levl-up/shared'

interface Props {
  totalPieces: number
  revealedPieces: number
  imageId: PuzzleImageId
}

export function PuzzleBoard({ totalPieces, revealedPieces, imageId }: Props) {
  const gridSize = getGridSize(totalPieces)
  const tileSize = 48  // px
  const boardPx = gridSize * tileSize
  const { gradient } = PUZZLE_IMAGES[imageId]

  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)` }}
    >
      {Array.from({ length: totalPieces }).map((_, i) => {
        const col = i % gridSize
        const row = Math.floor(i / gridSize)
        const revealed = i < revealedPieces
        return (
          <div
            key={i}
            data-tile={revealed ? 'revealed' : 'hidden'}
            style={
              revealed
                ? {
                    width: tileSize,
                    height: tileSize,
                    backgroundImage: gradient,
                    backgroundSize: `${boardPx}px ${boardPx}px`,
                    backgroundPosition: `-${col * tileSize}px -${row * tileSize}px`,
                  }
                : { width: tileSize, height: tileSize }
            }
            className={`rounded-sm ${revealed ? '' : 'bg-[#21262d]'}`}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep -E "Tests|FAIL"
```

Expected: `Tests  66 passed`

- [ ] **Step 6: Commit**

```bash
git add packages/frontend/src/features/goals/PuzzleImages.ts packages/frontend/src/features/goals/PuzzleBoard.tsx packages/frontend/src/features/goals/PuzzleBoard.test.tsx
git commit -m "feat: PuzzleBoard component with 6 embedded gradient images"
```

---

## Task 5 — GoalForm + GoalCard

**Files:**
- Create: `packages/frontend/src/features/goals/GoalForm.tsx`
- Create: `packages/frontend/src/features/goals/GoalForm.test.tsx`
- Create: `packages/frontend/src/features/goals/GoalCard.tsx`
- Create: `packages/frontend/src/features/goals/GoalCard.test.tsx`

- [ ] **Step 1: Write failing GoalForm tests**

Create `packages/frontend/src/features/goals/GoalForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GoalForm } from './GoalForm'

const onSubmit = vi.fn()
const onCancel = vi.fn()

describe('GoalForm', () => {
  beforeEach(() => { onSubmit.mockClear(); onCancel.mockClear() })

  it('calls onSubmit with title, deadline, imageId', () => {
    render(<GoalForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.change(screen.getByLabelText(/goal title/i), { target: { value: 'Read 10 books' } })
    fireEvent.change(screen.getByLabelText(/deadline/i), { target: { value: '2026-12-31' } })
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Read 10 books', puzzleImageId: expect.any(String) })
    )
  })

  it('does not submit with empty title', () => {
    render(<GoalForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onCancel', () => {
    render(<GoalForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Write failing GoalCard tests**

Create `packages/frontend/src/features/goals/GoalCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalCard } from './GoalCard'
import type { Goal, Task } from '@levl-up/shared'

const goal: Goal = {
  id: 'g1',
  title: 'Run a marathon',
  deadline: new Date(Date.now() + 30 * 86400000),
  createdAt: new Date(),
  puzzleImageId: 'mountain',
  completed: false,
}

describe('GoalCard', () => {
  it('renders goal title', () => {
    render(<GoalCard goal={goal} tasks={[]} />)
    expect(screen.getByText('Run a marathon')).toBeInTheDocument()
  })

  it('shows 0 revealed pieces with no tasks', () => {
    render(<GoalCard goal={goal} tasks={[]} />)
    expect(screen.getByText(/0\s*\/\s*\d+\s*pieces/i)).toBeInTheDocument()
  })

  it('shows completed badge when goal is completed', () => {
    render(<GoalCard goal={{ ...goal, completed: true }} tasks={[]} />)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run to confirm tests fail**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep -E "GoalForm|GoalCard" | head -5
```

Expected: FAIL (module not found)

- [ ] **Step 4: Create `GoalForm.tsx`**

```tsx
import { useState } from 'react'
import { PUZZLE_IMAGES } from './PuzzleImages'
import type { PuzzleImageId } from '@levl-up/shared'

interface Fields {
  title: string
  deadline: Date
  puzzleImageId: PuzzleImageId
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
}

export function GoalForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const today = new Date()
  const defaultDeadline = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [imageId, setImageId] = useState<PuzzleImageId>('mountain')

  return (
    <form
      aria-label="New goal form"
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        const [y, m, d] = deadline.split('-').map(Number)
        onSubmit({ title: title.trim(), deadline: new Date(y, m - 1, d), puzzleImageId: imageId })
      }}
    >
      <div>
        <label htmlFor="goal-title" className="block text-xs text-[#8b949e] mb-1">Goal title</label>
        <input
          id="goal-title"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="e.g. Read 10 books"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="goal-deadline" className="block text-xs text-[#8b949e] mb-1">Deadline</label>
        <input
          id="goal-deadline"
          type="date"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-2">Puzzle image</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(PUZZLE_IMAGES) as [PuzzleImageId, { label: string; gradient: string }][]).map(([id, { label, gradient }]) => (
            <button
              key={id}
              type="button"
              onClick={() => setImageId(id)}
              className={`rounded-lg p-1 border-2 transition-colors ${imageId === id ? 'border-[#ffd200]' : 'border-[#30363d]'}`}
            >
              <div className="h-10 rounded" style={{ backgroundImage: gradient }} />
              <div className="text-xs text-[#8b949e] mt-1">{label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium">
          Create Goal
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 5: Create `GoalCard.tsx`**

```tsx
import { getPieceCount, getRevealedPieces } from '../../store/goals'
import { PuzzleBoard } from './PuzzleBoard'
import type { Goal, Task } from '@levl-up/shared'

interface Props {
  goal: Goal
  tasks: Task[]
}

export function GoalCard({ goal, tasks }: Props) {
  const totalPieces = getPieceCount(goal)
  const revealed = getRevealedPieces(goal, tasks)

  return (
    <div className={`bg-[#161b22] rounded-xl p-4 border ${goal.completed ? 'border-[#ffd200]' : 'border-[#30363d]'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium text-[#e6edf3]">{goal.title}</div>
          <div className="text-xs text-[#8b949e] mt-0.5">
            Due {new Date(goal.deadline).toLocaleDateString()}
          </div>
        </div>
        {goal.completed && (
          <span className="text-xs bg-[#ffd200] text-[#0d1117] px-2 py-0.5 rounded-full font-medium">
            Completed ✓
          </span>
        )}
      </div>
      <PuzzleBoard totalPieces={totalPieces} revealedPieces={revealed} imageId={goal.puzzleImageId} />
      <div className="text-xs text-[#8b949e] mt-2">
        {revealed} / {totalPieces} pieces
        {goal.lastResetAt && !goal.completed && (
          <span className="text-[#f85149] ml-2">— streak reset {goal.lastResetAt}</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run tests**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep -E "Tests|FAIL"
```

Expected: `Tests  72 passed`

- [ ] **Step 7: Commit**

```bash
git add packages/frontend/src/features/goals/GoalForm.tsx packages/frontend/src/features/goals/GoalForm.test.tsx packages/frontend/src/features/goals/GoalCard.tsx packages/frontend/src/features/goals/GoalCard.test.tsx
git commit -m "feat: GoalForm and GoalCard components"
```

---

## Task 6 — GoalsTab

**Files:**
- Create: `packages/frontend/src/features/goals/GoalsTab.tsx`
- Create: `packages/frontend/src/features/goals/GoalsTab.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `packages/frontend/src/features/goals/GoalsTab.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalsTab } from './GoalsTab'

vi.mock('../../store/goals', () => ({
  getGoals: vi.fn().mockResolvedValue([]),
  addGoal: vi.fn().mockResolvedValue(undefined),
  updateGoal: vi.fn().mockResolvedValue(undefined),
  resetGoalProgress: vi.fn().mockResolvedValue(undefined),
  getPieceCount: vi.fn().mockReturnValue(16),
  getRevealedPieces: vi.fn().mockReturnValue(0),
  getGridSize: vi.fn().mockReturnValue(4),
}))

vi.mock('../../store/tasks', () => ({
  getTasks: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../store/streaks', () => ({
  getTodayStreak: vi.fn().mockResolvedValue(null),
}))

describe('GoalsTab', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the Goals heading', async () => {
    render(<GoalsTab />)
    expect(await screen.findByText('Goals')).toBeInTheDocument()
  })

  it('shows empty state when no goals', async () => {
    render(<GoalsTab />)
    expect(await screen.findByText(/no goals yet/i)).toBeInTheDocument()
  })

  it('shows Add goal button', async () => {
    render(<GoalsTab />)
    expect(await screen.findByText(/\+ add goal/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep "GoalsTab" | head -3
```

Expected: FAIL (module not found)

- [ ] **Step 3: Create `GoalsTab.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import { SkeletonCard } from '../../components/SkeletonCard'
import { getGoals, addGoal, updateGoal, resetGoalProgress, getRevealedPieces, getPieceCount } from '../../store/goals'
import { getTasks } from '../../store/tasks'
import { getTodayStreak } from '../../store/streaks'
import type { Goal, Task, PuzzleImageId } from '@levl-up/shared'

export function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    try {
      const [allGoals, allTasks, todayStreak] = await Promise.all([
        getGoals(),
        getTasks(),
        getTodayStreak(),
      ])

      // Streak break: reset puzzle progress on all active goals not yet reset today
      if (todayStreak?.broken) {
        const today = new Date().toISOString().slice(0, 10)
        await Promise.all(
          allGoals
            .filter((g) => !g.completed && g.lastResetAt !== today)
            .map((g) => resetGoalProgress(g.id))
        )
        // Reload after reset
        const refreshed = await getGoals()
        setGoals(refreshed)
      } else {
        setGoals(allGoals)
      }

      // Auto-complete goals where all linked tasks are done
      const incomplete = allGoals.filter((g) => !g.completed)
      for (const g of incomplete) {
        const goalTasks = allTasks.filter((t) => t.goalId === g.id)
        if (goalTasks.length > 0 && goalTasks.every((t) => t.completed)) {
          await updateGoal(g.id, { completed: true })
        }
      }

      setTasks(allTasks)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAddGoal(fields: { title: string; deadline: Date; puzzleImageId: PuzzleImageId }) {
    await addGoal({
      id: crypto.randomUUID(),
      ...fields,
      createdAt: new Date(),
      completed: false,
    })
    setShowForm(false)
    await load()
  }

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Goals</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[#58a6ff]"
          >
            + Add goal
          </button>
        )}
      </div>

      {showForm && (
        <GoalForm
          onSubmit={handleAddGoal}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">Loading goals…</span>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {goals.length === 0 && !showForm && (
            <p className="text-[#8b949e] text-sm">No goals yet</p>
          )}

          {activeGoals.length > 0 && (
            <section className="space-y-3">
              {activeGoals.map((g) => (
                <GoalCard key={g.id} goal={g} tasks={tasks} />
              ))}
            </section>
          )}

          {completedGoals.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-[#8b949e] mb-2">Completed</h2>
              <div className="space-y-3">
                {completedGoals.map((g) => (
                  <GoalCard key={g.id} goal={g} tasks={tasks} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test --workspace=packages/frontend 2>&1 | grep -E "Tests|FAIL"
```

Expected: `Tests  75 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/frontend/src/features/goals/GoalsTab.tsx packages/frontend/src/features/goals/GoalsTab.test.tsx
git commit -m "feat: GoalsTab with streak-break detection and auto-complete"
```

---

## Task 7 — Wire Up (TaskForm + TabBar + App)

**Files:**
- Modify: `packages/frontend/src/features/tasks/TaskForm.tsx`
- Modify: `packages/frontend/src/components/TabBar.tsx`
- Modify: `packages/frontend/src/App.tsx`

- [ ] **Step 1: Add `goalId` to TaskForm**

The existing `TaskForm.tsx` has a `Fields` interface and a `Props` interface. Make the following changes:

Add `goalId?: string` to the `Fields` interface. Add `goals?: Goal[]` to `Props` (so the parent can pass available goals). Add a select dropdown for goal if any goals are provided.

Full replacement of `packages/frontend/src/features/tasks/TaskForm.tsx`:

```tsx
import { useState } from 'react'
import type { StreakContribution, Goal } from '@levl-up/shared'

interface Fields {
  title: string
  dueDate: Date
  category: 'productivity' | 'finance'
  streakContribution: StreakContribution
  goalId?: string
}

interface Props {
  onSubmit: (fields: Fields) => void
  onCancel: () => void
  goals?: Goal[]
}

export function TaskForm({ onSubmit, onCancel, goals = [] }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [category, setCategory] = useState<'productivity' | 'finance'>('productivity')
  const [streakContribution, setStreakContribution] = useState<StreakContribution>('full')
  const [goalId, setGoalId] = useState<string>('')

  function handleSubmit() {
    if (!title.trim()) return
    const [y, m, d] = dueDate.split('-').map(Number)
    const localDueDate = new Date(y, m - 1, d)
    onSubmit({
      title: title.trim(),
      dueDate: localDueDate,
      category,
      streakContribution,
      goalId: goalId || undefined,
    })
  }

  return (
    <form
      className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] space-y-3"
      onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
    >
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Title</label>
        <input
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Due date</label>
        <input
          type="date"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Category</label>
        <select
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as 'productivity' | 'finance')}
        >
          <option value="productivity">Productivity</option>
          <option value="finance">Finance</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b949e] mb-1">Streak contribution</label>
        <select
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
          value={streakContribution}
          onChange={(e) => setStreakContribution(e.target.value as StreakContribution)}
        >
          <option value="full">Full streak contribution</option>
          <option value="partial">Partial streak contribution</option>
          <option value="none">No streak contribution</option>
        </select>
      </div>
      {goals.length > 0 && (
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Link to goal (optional)</label>
          <select
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
          >
            <option value="">— None —</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
      )}
      <div className="text-xs text-[#8b949e] px-1">
        Started: {new Date().toLocaleString()}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-[#238636] text-white py-2 rounded-lg text-sm font-medium"
        >
          Add Task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#21262d] text-[#8b949e] py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Update TasksTab to load and pass goals**

In `packages/frontend/src/features/tasks/TasksTab.tsx`, import `getGoals` and `Goal` type, add goals state, load goals alongside tasks, pass `goals` prop to `TaskForm`.

The `load()` function becomes:
```ts
async function load() {
  try {
    const [fetchedTasks, fetchedGoals] = await Promise.all([getTasks(), getGoals()])
    setTasks(fetchedTasks)
    setGoals(fetchedGoals.filter((g) => !g.completed))
  } finally {
    setLoading(false)
  }
}
```

Add `const [goals, setGoals] = useState<Goal[]>([])` to state declarations.

Add imports:
```ts
import { getGoals } from '../../store/goals'
import type { Goal } from '@levl-up/shared'
```

Pass to TaskForm:
```tsx
{showForm && <TaskForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} goals={goals} />}
```

Also update `handleAdd` to accept and pass through `goalId`:
```ts
async function handleAdd(fields: { title: string; dueDate: Date; category: 'productivity' | 'finance'; streakContribution: StreakContribution; goalId?: string }) {
  await addTask(createTask(fields))
  setShowForm(false)
  await load()
}
```

And update `createTask` call — `createTask` already spreads fields so `goalId` will be included automatically since `Task` now has `goalId?: string`.

- [ ] **Step 3: Update TabBar**

Full replacement of `packages/frontend/src/components/TabBar.tsx`:

```tsx
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🔥' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
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
            `flex flex-col items-center py-2 px-3 text-xs ${isActive ? 'text-[#ffd200]' : 'text-[#8b949e]'}`
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

- [ ] **Step 4: Add `/goals` route to App.tsx**

In `packages/frontend/src/App.tsx`, add:
```tsx
import { GoalsTab } from './features/goals/GoalsTab'
```

And add the route inside `<Routes>`:
```tsx
<Route path="/goals" element={<GoalsTab />} />
```

- [ ] **Step 5: Run all tests**

```bash
npm run test --workspaces 2>&1 | grep -E "Tests|Test Files|FAIL"
```

Expected: all tests passing (backend + frontend + shared)

- [ ] **Step 6: Commit**

```bash
git add packages/frontend/src/features/tasks/TaskForm.tsx packages/frontend/src/features/tasks/TasksTab.tsx packages/frontend/src/components/TabBar.tsx packages/frontend/src/App.tsx
git commit -m "feat: wire Goals tab — TaskForm goal picker, TabBar, App routing"
```

---

## Verification

```bash
# Full test suite
npm run test --workspaces

# Start both servers
npm run dev:backend
npm run dev:frontend  # http://localhost:5173
```

**Manual smoke test:**
- [ ] Fresh app: Goals tab shows "No goals yet" + "+ Add goal"
- [ ] Create a 30-day goal → puzzle shows 4×4 grid, all dark
- [ ] Create a task, link it to the goal via dropdown
- [ ] Complete the task → goal card shows 1+ pieces revealed
- [ ] `localStorage.clear()` → onboarding wizard appears; complete it
- [ ] Simulate streak break via Settings → all goal puzzles reset to 0 dark tiles on next Goals tab visit
- [ ] Complete all tasks linked to a goal → goal moves to Completed section with gold border
