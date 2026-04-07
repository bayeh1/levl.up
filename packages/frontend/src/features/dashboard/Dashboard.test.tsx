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
