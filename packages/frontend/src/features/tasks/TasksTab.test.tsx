import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TasksTab } from './TasksTab'

vi.mock('../../store/tasks', () => ({
  getTasks: vi.fn().mockResolvedValue([{
    id: '1', title: 'Morning workout',
    startDate: new Date(), dueDate: new Date(),
    category: 'productivity', completed: false, streakContribution: 'full'
  }]),
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
