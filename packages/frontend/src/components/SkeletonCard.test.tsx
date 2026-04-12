import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkeletonCard } from './SkeletonCard'

describe('SkeletonCard', () => {
  it('renders 2 lines by default', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2)
  })

  it('renders the specified number of lines', () => {
    const { container } = render(<SkeletonCard lines={4} />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })
})
