import type { Puzzle } from './types'

const PUZZLES_URL = 'puzzles.json'

export async function loadPuzzles(): Promise<Puzzle[]> {
  const response = await fetch(PUZZLES_URL)
  if (!response.ok) {
    throw new Error('Failed to load puzzles')
  }
  const data = (await response.json()) as Puzzle[]
  return data
}

export async function loadRandomPuzzle(
  excludeId?: string | null,
): Promise<Puzzle> {
  const puzzles = await loadPuzzles()
  if (!puzzles.length) {
    throw new Error('No puzzles available')
  }
  let candidates = puzzles
  if (excludeId && puzzles.length > 1) {
    const filtered = puzzles.filter((puzzle) => puzzle.id !== excludeId)
    if (filtered.length) {
      candidates = filtered
    }
  }
  const index = Math.floor(Math.random() * candidates.length)
  return candidates[index]
}
