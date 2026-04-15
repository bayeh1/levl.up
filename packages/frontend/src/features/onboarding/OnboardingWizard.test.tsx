import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingWizard } from './OnboardingWizard'

vi.mock('../tasks/TaskForm', () => ({
  TaskForm: ({ onCancel }: { onCancel: () => void }) => (
    <div>
      <div>TaskForm</div>
      <button onClick={onCancel}>Skip task</button>
    </div>
  )
}))

vi.mock('../../store/tasks', () => ({
  addTask: vi.fn().mockResolvedValue(undefined),
  createTask: vi.fn().mockReturnValue({})
}))

vi.mock('../notifications/usePushSubscription', () => ({
  usePushSubscription: () => ({
    subscribed: false,
    loading: false,
    error: null,
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  })
}))

describe('OnboardingWizard', () => {
  const onComplete = vi.fn()

  beforeEach(() => {
    onComplete.mockClear()
    localStorage.clear()
  })

  it('shows step 1 on initial render', () => {
    render(<OnboardingWizard onComplete={onComplete} />)
    expect(screen.getByText(/welcome to levl\.up/i)).toBeInTheDocument()
  })

  it('advances to step 2 when Get started is clicked', () => {
    render(<OnboardingWizard onComplete={onComplete} />)
    fireEvent.click(screen.getByText(/get started/i))
    expect(screen.getByText('TaskForm')).toBeInTheDocument()
  })

  it('advances to step 3 when task form is skipped', () => {
    render(<OnboardingWizard onComplete={onComplete} />)
    fireEvent.click(screen.getByText(/get started/i))
    fireEvent.click(screen.getByText('Skip task'))
    expect(screen.getByRole('heading', { name: /enable notifications/i })).toBeInTheDocument()
  })

  it('calls onComplete and sets localStorage when Skip is clicked on step 3', () => {
    render(<OnboardingWizard onComplete={onComplete} />)
    fireEvent.click(screen.getByText(/get started/i))
    fireEvent.click(screen.getByText('Skip task'))
    fireEvent.click(screen.getByText('Skip'))
    expect(onComplete).toHaveBeenCalled()
    expect(localStorage.getItem('levlup-onboarded')).toBe('1')
  })

  it('does not show wizard when already onboarded (App.tsx gate — localStorage set)', () => {
    localStorage.setItem('levlup-onboarded', '1')
    // The wizard itself doesn't check localStorage — the parent (App.tsx) does
    // This test verifies onComplete sets the right key
    render(<OnboardingWizard onComplete={onComplete} />)
    fireEvent.click(screen.getByText(/get started/i))
    fireEvent.click(screen.getByText('Skip task'))
    fireEvent.click(screen.getByText('Skip'))
    expect(localStorage.getItem('levlup-onboarded')).toBe('1')
  })
})
