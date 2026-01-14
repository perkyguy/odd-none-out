import { describe, expect, it } from 'vitest'

import { isMatch } from './match'
import type { Category } from './types'

describe('isMatch', () => {
  it('accepts head concept guesses from canonical and aliases', () => {
    const category: Category = {
      canonical: 'Dog breeds',
      aliases: ['breeds of dogs', 'dog breed', 'types of dogs'],
    }

    expect(isMatch('dog', category)).toBe(true)
    expect(isMatch('dogs', category)).toBe(true)
    expect(isMatch('types', category)).toBe(false)
    expect(isMatch('words', category)).toBe(false)
  })

  it('requires multiple concept hits for multi-token guesses', () => {
    const category: Category = {
      canonical: 'Dog breeds',
      aliases: ['breeds of dogs', 'dog breed'],
    }

    expect(isMatch('dog thing', category)).toBe(false)
    expect(isMatch('dog breed', category)).toBe(true)
  })

  it('accepts partial token matches for types of matchers', () => {
    const category: Category = {
      canonical: 'Dog breeds',
      matcher: {
        kind: 'TYPES_OF',
        token: 'dog breeds',
      },
    }

    expect(isMatch('dog', category)).toBe(true)
    expect(isMatch('breed', category)).toBe(true)
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
