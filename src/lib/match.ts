import type { Category, CategoryMatcher } from './types'

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'to',
  'that',
  'which',
  'comes',
  'come',
  'words',
  'things',
])

const PUNCTUATION_REGEX = /[^a-z0-9]+/g

export function normalize(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(PUNCTUATION_REGEX, ' ')
    .trim()

  const tokens = cleaned.split(/\s+/).filter(Boolean)
  const normalized = tokens
    .filter((token) => !STOPWORDS.has(token))
    .map(singularize)
    .filter(Boolean)
    .sort()

  return normalized.join(' ')
}

export function isMatch(guess: string, category: Category): boolean {
  const normalizedGuess = normalize(guess)
  if (!normalizedGuess) {
    return false
  }

  if (normalizedGuess === normalize(category.canonical)) {
    return true
  }

  if (category.aliases?.some((alias) => normalize(alias) === normalizedGuess)) {
    return true
  }

  if (category.matcher) {
    return matcherPatterns(category.matcher).some(
      (pattern) => normalize(pattern) === normalizedGuess,
    )
  }

  return false
}

function singularize(token: string): string {
  if (token.length > 3 && token.endsWith('ies')) {
    return `${token.slice(0, -3)}y`
  }

  if (
    token.length > 3 &&
    token.endsWith('s') &&
    !token.endsWith('ss') &&
    !token.endsWith('us')
  ) {
    return token.slice(0, -1)
  }

  return token
}

function matcherPatterns(matcher: CategoryMatcher): string[] {
  switch (matcher.kind) {
    case 'WORDS_AFTER': {
      const patterns = [`words after ${matcher.token}`, `after ${matcher.token}`]
      if (matcher.acceptTokenAlone) {
        patterns.push(matcher.token)
      }
      return patterns
    }
    case 'TYPES_OF': {
      const patterns = [
        `types of ${matcher.token}`,
        `kinds of ${matcher.token}`,
        `${matcher.token} types`,
      ]
      if (matcher.acceptTokenAlone) {
        patterns.push(matcher.token)
      }
      return patterns
    }
    case 'STARTS_WITH':
      return [
        `starts with ${matcher.token}`,
        `words starting with ${matcher.token}`,
        `begin with ${matcher.token}`,
      ]
    case 'ENDS_WITH':
      return [
        `ends with ${matcher.token}`,
        `words ending with ${matcher.token}`,
        `finish with ${matcher.token}`,
      ]
  }
}
