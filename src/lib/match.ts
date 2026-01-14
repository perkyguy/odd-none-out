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

const BLOCKED_CONCEPT_TOKENS = new Set([
  'thing',
  'things',
  'word',
  'words',
  'type',
  'types',
  'kind',
  'kinds',
  'after',
  'before',
  'starts',
  'start',
  'starting',
  'ends',
  'end',
  'ending',
  'with',
  'come',
  'comes',
  'that',
  'which',
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
    const matcherHit = matcherPatterns(category.matcher).some(
      (pattern) => normalize(pattern) === normalizedGuess,
    )
    if (matcherHit) {
      return true
    }
  }

  return conceptFallbackMatch(guess, category)
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

function tokenizeNormalized(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

function filterConceptTokens(tokens: string[]): string[] {
  return tokens.filter(
    (token) => token.length >= 3 && !BLOCKED_CONCEPT_TOKENS.has(token),
  )
}

function conceptTokensFromText(text: string): string[] {
  const normalized = normalize(text)
  if (!normalized) {
    return []
  }
  return filterConceptTokens(tokenizeNormalized(normalized))
}

function conceptFallbackMatch(guess: string, category: Category): boolean {
  const normalizedGuess = normalize(guess)
  const guessTokens = tokenizeNormalized(normalizedGuess)
  if (!guessTokens.length) {
    return false
  }

  const filteredGuessTokens = filterConceptTokens(guessTokens)
  if (!filteredGuessTokens.length) {
    return false
  }

  const categoryTokens = new Set<string>()
  conceptTokensFromText(category.canonical).forEach((token) =>
    categoryTokens.add(token),
  )
  category.aliases?.forEach((alias) => {
    conceptTokensFromText(alias).forEach((token) => categoryTokens.add(token))
  })
  category.concepts?.forEach((concept) => {
    conceptTokensFromText(concept).forEach((token) => categoryTokens.add(token))
  })

  if (!categoryTokens.size) {
    return false
  }

  const uniqueGuessTokens = new Set(filteredGuessTokens)
  let hits = 0
  uniqueGuessTokens.forEach((token) => {
    if (categoryTokens.has(token)) {
      hits += 1
    }
  })

  const requiredHits = guessTokens.length >= 2 ? 2 : 1
  return hits >= requiredHits
}

function matcherPatterns(matcher: CategoryMatcher): string[] {
  switch (matcher.kind) {
    case 'WORDS_AFTER': {
      const patterns = new Set([
        `words after ${matcher.token}`,
        `after ${matcher.token}`,
      ])
      if (matcher.acceptTokenAlone) {
        patterns.add(matcher.token)
      }
      return Array.from(patterns)
    }
    case 'TYPES_OF': {
      const patterns = new Set([
        `types of ${matcher.token}`,
        `kinds of ${matcher.token}`,
        `${matcher.token} types`,
      ])
      const acceptTokenAlone = matcher.acceptTokenAlone ?? true
      if (acceptTokenAlone) {
        patterns.add(matcher.token)
        conceptTokensFromText(matcher.token).forEach((token) =>
          patterns.add(token),
        )
      }
      return Array.from(patterns)
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
