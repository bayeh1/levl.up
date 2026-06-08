import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PuzzleBoard } from './PuzzleBoard'

describe('PuzzleBoard', () => {
  it('renders the correct total number of tiles', () => {
    const { container } = render(
      <PuzzleBoard totalPieces={9} revealedPieces={0} imageId="mountain" />
    )
    expect(container.querySelectorAll('[data-tile]')).toHaveLength(9)
  })

  it('marks revealed tiles correctly', () => {
    const { container } = render(
      <PuzzleBoard totalPieces={9} revealedPieces={3} imageId="ocean" />
    )
    expect(container.querySelectorAll('[data-tile="revealed"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-tile="hidden"]')).toHaveLength(6)
  })

  it('renders all revealed when revealedPieces equals totalPieces', () => {
    const { container } = render(
      <PuzzleBoard totalPieces={4} revealedPieces={4} imageId="forest" />
    )
    expect(container.querySelectorAll('[data-tile="hidden"]')).toHaveLength(0)
  })
})
