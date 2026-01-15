import type { Category, CategoryMatcher } from './types'

export type MatchReason =
  | 'canonical'
  | 'alias'
  | 'matcher'
  | 'related'
  | 'concept'
  | 'none'

export type MatchDebug = {
  matched: boolean
  reason: MatchReason
  normalizedGuess: string
  filteredGuessTokens: string[]
  categoryTokens: string[]
  matcherPatterns?: string[]
  hitCount?: number
  requiredHits?: number
}

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
  return getMatchDebug(guess, category).matched
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

export function getMatchDebug(guess: string, category: Category): MatchDebug {
  const normalizedGuess = normalize(guess)
  const matcherList = category.matcher
    ? matcherPatterns(category.matcher)
    : undefined
  const conceptDetails = getConceptMatchDetails(normalizedGuess, category)
  const relatedMatched = relatedConceptMatch(normalizedGuess, category)

  let matched = false
  let reason: MatchReason = 'none'

  if (normalizedGuess) {
    if (normalizedGuess === normalize(category.canonical)) {
      matched = true
      reason = 'canonical'
    } else if (
      category.aliases?.some((alias) => normalize(alias) === normalizedGuess)
    ) {
      matched = true
      reason = 'alias'
    } else if (
      matcherList?.some((pattern) => normalize(pattern) === normalizedGuess)
    ) {
      matched = true
      reason = 'matcher'
    } else if (relatedMatched) {
      matched = true
      reason = 'related'
    } else if (conceptDetails.matched) {
      matched = true
      reason = 'concept'
    }
  }

  return {
    matched,
    reason,
    normalizedGuess,
    filteredGuessTokens: conceptDetails.filteredGuessTokens,
    categoryTokens: conceptDetails.categoryTokens,
    matcherPatterns: matcherList,
    hitCount: conceptDetails.hitCount,
    requiredHits: conceptDetails.requiredHits,
  }
}

type ConceptMatchDetails = {
  matched: boolean
  filteredGuessTokens: string[]
  categoryTokens: string[]
  hitCount: number
  requiredHits: number
}

function relatedConceptMatch(
  normalizedGuess: string,
  category: Category,
): boolean {
  if (!category.relatedConcepts?.length) {
    return false
  }

  const guessTokens = filterConceptTokens(tokenizeNormalized(normalizedGuess))
  if (guessTokens.length !== 1) {
    return false
  }

  const relatedTokens = new Set<string>()
  category.relatedConcepts.forEach((concept) => {
    const tokens = filterConceptTokens(tokenizeNormalized(normalize(concept)))
    if (tokens.length === 1) {
      relatedTokens.add(tokens[0])
    }
  })

  return relatedTokens.has(guessTokens[0])
}

function getConceptMatchDetails(
  normalizedGuess: string,
  category: Category,
): ConceptMatchDetails {
  const guessTokens = tokenizeNormalized(normalizedGuess)
  const filteredGuessTokens = filterConceptTokens(guessTokens)

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

  const uniqueGuessTokens = new Set(filteredGuessTokens)
  let hitCount = 0
  uniqueGuessTokens.forEach((token) => {
    if (categoryTokens.has(token)) {
      hitCount += 1
    }
  })

  const requiredHits = guessTokens.length >= 2 ? 2 : 1
  const matched =
    filteredGuessTokens.length > 0 &&
    categoryTokens.size > 0 &&
    hitCount >= requiredHits

  return {
    matched,
    filteredGuessTokens,
    categoryTokens: Array.from(categoryTokens).sort(),
    hitCount,
    requiredHits,
  }
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
