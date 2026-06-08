import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalCard } from './GoalCard'
import type { Goal } from '@levl-up/shared'

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

  it('shows 0 / N pieces with no tasks', () => {
    render(<GoalCard goal={goal} tasks={[]} />)
    expect(screen.getByText(/0\s*\/\s*\d+\s*pieces/i)).toBeInTheDocument()
  })

  it('shows completed badge when goal is completed', () => {
    render(<GoalCard goal={{ ...goal, completed: true }} tasks={[]} />)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })
})
