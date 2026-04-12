import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BudgetForm } from './BudgetForm'

const onSubmit = vi.fn()
const onCancel = vi.fn()

describe('BudgetForm', () => {
  beforeEach(() => {
    onSubmit.mockClear()
    onCancel.mockClear()
  })

  it('calls onSubmit with category and monthlyLimit', () => {
    render(<BudgetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Food' } })
    fireEvent.change(screen.getByLabelText(/monthly limit/i), { target: { value: '500' } })
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).toHaveBeenCalledWith({ category: 'Food', monthlyLimit: 500 })
  })

  it('calls onCancel when Cancel is clicked', () => {
    render(<BudgetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not submit with empty category', () => {
    render(<BudgetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit with zero limit', () => {
    render(<BudgetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Food' } })
    fireEvent.change(screen.getByLabelText(/monthly limit/i), { target: { value: '0' } })
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit with negative limit', () => {
    render(<BudgetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Food' } })
    fireEvent.change(screen.getByLabelText(/monthly limit/i), { target: { value: '-50' } })
    fireEvent.submit(screen.getByRole('form'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows error message on empty category', async () => {
    render(<BudgetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.submit(screen.getByRole('form'))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
