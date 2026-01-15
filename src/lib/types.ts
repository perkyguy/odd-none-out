export type CategoryMatcher =
  | {
      kind: 'WORDS_AFTER'
      token: string
      acceptTokenAlone?: boolean
    }
  | {
      kind: 'TYPES_OF'
      token: string
      acceptTokenAlone?: boolean
    }
  | {
      kind: 'STARTS_WITH'
      token: string
    }
  | {
      kind: 'ENDS_WITH'
      token: string
    }

export type Category = {
  canonical: string
  aliases?: string[]
  concepts?: string[]
  relatedConcepts?: string[]
  matcher?: CategoryMatcher
}

export type Puzzle = {
  id: string
  words: string[]
  category: Category
}
