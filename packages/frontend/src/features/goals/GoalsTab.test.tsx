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
