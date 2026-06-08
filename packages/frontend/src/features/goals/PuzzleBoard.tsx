import { getGridSize } from '../../store/goals'
import { PUZZLE_IMAGES } from './PuzzleImages'
import type { PuzzleImageId } from '@levl-up/shared'

interface Props {
  totalPieces: number
  revealedPieces: number
  imageId: PuzzleImageId
}

export function PuzzleBoard({ totalPieces, revealedPieces, imageId }: Props) {
  const gridSize = getGridSize(totalPieces)
  const tileSize = 48
  const boardPx = gridSize * tileSize
  const { gradient } = PUZZLE_IMAGES[imageId]

  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)` }}
    >
      {Array.from({ length: totalPieces }).map((_, i) => {
        const col = i % gridSize
        const row = Math.floor(i / gridSize)
        const revealed = i < revealedPieces
        return (
          <div
            key={i}
            data-tile={revealed ? 'revealed' : 'hidden'}
            style={
              revealed
                ? {
                    width: tileSize,
                    height: tileSize,
                    backgroundImage: gradient,
                    backgroundSize: `${boardPx}px ${boardPx}px`,
                    backgroundPosition: `-${col * tileSize}px -${row * tileSize}px`,
                  }
                : { width: tileSize, height: tileSize }
            }
            className={`rounded-sm ${revealed ? '' : 'bg-[#21262d]'}`}
          />
        )
      })}
    </div>
  )
}
