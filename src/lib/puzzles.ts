import type { Puzzle } from './types'

const PUZZLES_URL = '/puzzles.json'

export async function loadPuzzles(): Promise<Puzzle[]> {
  const response = await fetch(PUZZLES_URL)
  if (!response.ok) {
    throw new Error('Failed to load puzzles')
  }
  const data = (await response.json()) as Puzzle[]
  return data
}

export async function loadRandomPuzzle(): Promise<Puzzle> {
  const puzzles = await loadPuzzles()
  if (!puzzles.length) {
    throw new Error('No puzzles available')
  }
  const index = Math.floor(Math.random() * puzzles.length)
  return puzzles[index]
}
