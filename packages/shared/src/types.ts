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
  date: string
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
  dailyReminderTime: string
  streakWarningTime: string
}
