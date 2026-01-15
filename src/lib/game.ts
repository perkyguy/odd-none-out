export type GuessStatus =
  | 'idle'
  | 'correct'
  | 'incorrect'
  | 'last'
  | 'lost'

type IncorrectGuessResult = {
  revealedCount: number
  status: GuessStatus
}

export function applyIncorrectGuess(
  revealedCount: number,
  totalWords: number,
): IncorrectGuessResult {
  if (totalWords <= 0) {
    return { revealedCount, status: 'lost' }
  }

  if (revealedCount < totalWords) {
    const nextCount = Math.min(revealedCount + 1, totalWords)
    return {
      revealedCount: nextCount,
      status: nextCount === totalWords ? 'last' : 'incorrect',
    }
  }

  return { revealedCount, status: 'lost' }
}
