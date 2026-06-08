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
