import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('renders the Add Goal button', async () => {
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByText('+ Add goal')).toBeInTheDocument()
  })

  it('shows Add a budget CTA when budgets are empty', async () => {
    const { getBudgets } = await import('../../store/finance')
    vi.mocked(getBudgets).mockResolvedValueOnce([])
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByText('+ Add a budget')).toBeInTheDocument()
  })

  it('shows Add Budget button', async () => {
    render(<MemoryRouter><FinanceTab /></MemoryRouter>)
    expect(await screen.findByRole('button', { name: /add budget/i })).toBeInTheDocument()
  })
})

describe('FinanceTab milestone push notifications', () => {
  const mockEndpoint = 'https://fcm.googleapis.com/mock-endpoint'
  const mockFetch = vi.fn().mockResolvedValue({ ok: true })

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockClear()

    const mockGetSubscription = vi.fn().mockResolvedValue({ endpoint: mockEndpoint })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: mockGetSubscription
          }
        })
      }
    })
  })

  it('calls /push/notify when a milestone quarter is crossed', async () => {
    // Goal: targetAmount=1000, currentAmount=0 → contributing 300 crosses 25% (quarter 1)
    const { getSavingsGoals, updateSavingsGoal } = await import('../../store/finance')
    vi.mocked(getSavingsGoals).mockResolvedValue([
      { id: 'g1', title: 'Emergency Fund', targetAmount: 1000, currentAmount: 0, deadline: new Date() }
    ])
    vi.mocked(updateSavingsGoal).mockResolvedValue(undefined)

    render(<MemoryRouter><FinanceTab /></MemoryRouter>)

    // Wait for component to load and show contribute button
    const contributeBtn = await screen.findByRole('button', { name: /contribute/i })
    fireEvent.click(contributeBtn)

    // Fill in the contribution amount
    const input = await screen.findByLabelText(/contribution amount/i)
    fireEvent.change(input, { target: { value: '300' } })

    // Submit the form
    const submitBtn = screen.getByRole('button', { name: /^contribute$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/push/notify'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(mockEndpoint)
        })
      )
    })
  })

  it('does NOT call /push/notify when no milestone quarter is crossed', async () => {
    // Goal: targetAmount=1000, currentAmount=620 → contributing 10 stays in quarter 2 (50-75%)
    const { getSavingsGoals, updateSavingsGoal } = await import('../../store/finance')
    vi.mocked(getSavingsGoals).mockResolvedValue([
      { id: 'g1', title: 'Emergency Fund', targetAmount: 1000, currentAmount: 620, deadline: new Date() }
    ])
    vi.mocked(updateSavingsGoal).mockResolvedValue(undefined)

    render(<MemoryRouter><FinanceTab /></MemoryRouter>)

    const contributeBtn = await screen.findByRole('button', { name: /contribute/i })
    fireEvent.click(contributeBtn)

    const input = await screen.findByLabelText(/contribution amount/i)
    fireEvent.change(input, { target: { value: '10' } })

    const submitBtn = screen.getByRole('button', { name: /^contribute$/i })
    fireEvent.click(submitBtn)

    // Give time for any async calls
    await waitFor(() => {
      expect(updateSavingsGoal).toHaveBeenCalled()
    })

    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/push/notify'),
      expect.anything()
    )
  })
})
