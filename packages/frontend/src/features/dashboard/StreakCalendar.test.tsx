import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakCalendar } from './StreakCalendar'
import type { Streak } from '@levl-up/shared'

function makeStreak(date: string, completedCount: number, broken = false): Streak {
  return { date, completedCount, totalCount: completedCount, broken }
}

describe('StreakCalendar', () => {
  it('renders 30 day cells', () => {
    const { container } = render(<StreakCalendar streaks={[]} />)
    expect(container.querySelectorAll('.rounded-md')).toHaveLength(30)
  })

  it('renders grey cells for days with no record', () => {
    const { container } = render(<StreakCalendar streaks={[]} />)
    const cells = container.querySelectorAll('.rounded-md')
    cells.forEach((cell) => {
      expect(cell.className).toContain('bg-[#21262d]')
    })
  })

  it('renders green cell for a completed streak day', () => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const { container } = render(<StreakCalendar streaks={[makeStreak(dateStr, 2, false)]} />)
    const greenCell = container.querySelector('.bg-\\[\\#3fb950\\]')
    expect(greenCell).toBeInTheDocument()
  })

  it('renders red cell for a broken streak day', () => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const { container } = render(<StreakCalendar streaks={[makeStreak(dateStr, 0, true)]} />)
    const redCell = container.querySelector('.bg-\\[\\#f85149\\]')
    expect(redCell).toBeInTheDocument()
  })

  it('displays longest streak count', () => {
    const streaks: Streak[] = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      streaks.push(makeStreak(dateStr, 1, false))
    }
    render(<StreakCalendar streaks={streaks} />)
    expect(screen.getByText(/longest streak/i)).toBeInTheDocument()
    expect(screen.getByText('3 days')).toBeInTheDocument()
  })
})
