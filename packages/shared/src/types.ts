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
