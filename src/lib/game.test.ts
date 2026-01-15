import { describe, expect, it } from 'vitest'

import { applyIncorrectGuess } from './game'

describe('applyIncorrectGuess', () => {
  it('keeps playing after revealing the final word', () => {
    const result = applyIncorrectGuess(4, 5)

    expect(result.revealedCount).toBe(5)
    expect(result.status).toBe('last')
  })

  it('marks the round lost after the final guess', () => {
    const result = applyIncorrectGuess(5, 5)

    expect(result.revealedCount).toBe(5)
    expect(result.status).toBe('lost')
  })
})
