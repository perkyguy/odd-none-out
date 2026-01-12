import { describe, expect, it } from 'vitest'

import { isMatch } from './match'
import type { Category } from './types'

describe('isMatch', () => {
  it('matches dog breed vs breeds of dogs', () => {
    const category: Category = {
      canonical: 'Breeds of dogs',
    }

    expect(isMatch('Dog breed', category)).toBe(true)
  })

  it('accepts token alone for words after matchers', () => {
    const category: Category = {
      canonical: 'Words after bread',
      matcher: {
        kind: 'WORDS_AFTER',
        token: 'bread',
        acceptTokenAlone: true,
      },
    }

    expect(isMatch('bread', category)).toBe(true)
  })

  it('matches starts with re against words starting with re', () => {
    const category: Category = {
      canonical: 'Words starting with re',
      matcher: {
        kind: 'STARTS_WITH',
        token: 're',
      },
    }

    expect(isMatch('starts with re', category)).toBe(true)
  })

  it('handles punctuation and plural variants', () => {
    const category: Category = {
      canonical: 'Cat toys',
    }

    expect(isMatch('cat-toy!', category)).toBe(true)
  })
})
