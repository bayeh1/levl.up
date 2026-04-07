import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TasksTab } from './TasksTab'
import { completeTask } from '../../store/tasks'
import { recordCompletion } from '../../store/streaks'

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

  it('does not call recordCompletion when streakContribution is none', async () => {
    const { getTasks } = await import('../../store/tasks')
    vi.mocked(getTasks).mockResolvedValueOnce([{
      id: '3', title: 'No streak task',
      startDate: new Date(), dueDate: new Date(),
      category: 'productivity', completed: false, streakContribution: 'none'
    }])
    render(<MemoryRouter><TasksTab /></MemoryRouter>)
    const completeBtn = await screen.findByRole('button', { name: /complete/i })
    fireEvent.click(completeBtn)
    await vi.waitFor(() => {
      expect(completeTask).toHaveBeenCalledWith('3')
    })
    expect(recordCompletion).not.toHaveBeenCalled()
  })

  it('calls completeTask when Complete button is clicked', async () => {
    render(<MemoryRouter><TasksTab /></MemoryRouter>)
    const completeBtn = await screen.findByRole('button', { name: /complete/i })
    fireEvent.click(completeBtn)
    await vi.waitFor(() => {
      expect(completeTask).toHaveBeenCalledWith('1')
    })
  })
})
