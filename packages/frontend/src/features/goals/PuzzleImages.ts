import type { PuzzleImageId } from '@levl-up/shared'

export const PUZZLE_IMAGES: Record<PuzzleImageId, { label: string; gradient: string }> = {
  mountain: {
    label: 'Mountain',
    gradient: 'linear-gradient(160deg, #0d1117 0%, #1a3a27 35%, #3fb950 65%, #58a6ff 100%)',
  },
  ocean: {
    label: 'Ocean',
    gradient: 'linear-gradient(180deg, #58a6ff 0%, #0d3a6e 50%, #0d1117 100%)',
  },
  forest: {
    label: 'Forest',
    gradient: 'linear-gradient(170deg, #0d1117 0%, #1a3a27 40%, #3fb950 70%, #ffd200 100%)',
  },
  space: {
    label: 'Space',
    gradient: 'radial-gradient(ellipse at 30% 40%, #6e40c9 0%, #0d1117 60%), linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)',
  },
  city: {
    label: 'City',
    gradient: 'linear-gradient(180deg, #0d1117 0%, #1a1a2e 40%, #58a6ff 70%, #ffd200 100%)',
  },
  abstract: {
    label: 'Abstract',
    gradient: 'linear-gradient(45deg, #f85149 0%, #ffd200 25%, #3fb950 50%, #58a6ff 75%, #6e40c9 100%)',
  },
}
