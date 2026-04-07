import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FinanceTab } from './FinanceTab'

vi.mock('../../store/finance', () => ({
  getBudgets: vi.fn().mockResolvedValue([
    { id: 'b1', category: 'Food', monthlyLimit: 500, spent: [{ amount: 120, date: new Date() }] }
  ]),
  getSavingsGoals: vi.fn().mockResolvedValue([
    { id: 'g1', title: 'Emergency Fund', targetAmount: 1000, currentAmount: 620, deadline: new Date() }
  ]),
  logExpense: vi.fn().mockResolvedValue(undefined),
  addBudget: vi.fn().mockResolvedValue(undefined),
  addSavingsGoal: vi.fn().mockResolvedValue(undefined),
  updateSavingsGoal: vi.fn().mockResolvedValue(undefined)
}))

describe('FinanceTab', () => {
  it('renders budget category name', async () => {
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByText('Food')).toBeInTheDocument()
  })

  it('renders savings goal title', async () => {
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByText('Emergency Fund')).toBeInTheDocument()
  })
})
