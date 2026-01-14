import { useCallback, useEffect, useRef, useState } from 'react'

import './App.css'
import { IconMark } from './components/IconMark'
import { getMatchDebug, isMatch, type MatchDebug } from './lib/match'
import { loadRandomPuzzle } from './lib/puzzles'
import type { Puzzle } from './lib/types'

type GuessStatus = 'idle' | 'correct' | 'incorrect'

function App() {
  const isDev = import.meta.env.DEV
  const isMounted = useRef(true)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [revealedCount, setRevealedCount] = useState(1)
  const [guess, setGuess] = useState('')
  const [status, setStatus] = useState<GuessStatus>('idle')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<MatchDebug | null>(null)

  const startNewPuzzle = useCallback(async (excludeId?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const nextPuzzle = await loadRandomPuzzle(excludeId)
      if (!isMounted.current) {
        return
      }
      setPuzzle(nextPuzzle)
      setRevealedCount(1)
      setGuess('')
      setStatus('idle')
      setDebugInfo(null)
    } catch (loadError) {
      if (isMounted.current) {
        setError('Could not load a puzzle. Try refreshing.')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    startNewPuzzle()

    return () => {
      isMounted.current = false
    }
  }, [startNewPuzzle])

  const words = puzzle?.words ?? []
  const allRevealed = puzzle ? revealedCount >= puzzle.words.length : false
  const roundOver = status === 'correct' || (status === 'incorrect' && allRevealed)
  const isWin = status === 'correct'
  const isLose = status === 'incorrect' && allRevealed
  const isWarning = status === 'incorrect' && !allRevealed
  const statusVariant = isWin
    ? 'win'
    : isLose
      ? 'lose'
      : isWarning
        ? 'warning'
        : 'playing'
  const statusCategory = puzzle && (isWin || isLose) ? puzzle.category.canonical : null
  const nextButtonClass = isWin ? 'primary' : 'secondary'

  let statusTitle = 'Ready when you are'
  let statusMessage = 'Make a guess when the words start to click.'
  if (isWin) {
    statusTitle = 'You solved it'
    statusMessage = 'Nicely spotted. Ready for the next one?'
  } else if (isLose) {
    statusTitle = 'Round over'
    statusMessage = 'No worries. Try a fresh puzzle when you want.'
  } else if (isWarning) {
    statusTitle = 'Not quite'
    statusMessage = 'Another word appears to help.'
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!puzzle || roundOver) {
      return
    }
    const trimmedGuess = guess.trim()
    if (!trimmedGuess) {
      return
    }

    const debug = isDev ? getMatchDebug(trimmedGuess, puzzle.category) : null
    if (isDev) {
      setDebugInfo(debug)
    }
    const matched = debug ? debug.matched : isMatch(trimmedGuess, puzzle.category)

    if (matched) {
      setStatus('correct')
      setRevealedCount(puzzle.words.length)
    } else {
      setStatus('incorrect')
      setRevealedCount((count) =>
        Math.min(count + 1, puzzle.words.length),
      )
    }
  }

  return (
    <div className={`app${isWin ? ' is-win' : ''}`}>
      <header className="app-hero">
        <div className="app-brand header-logo">
          <IconMark className="brand-icon" />
          <div className="brand-text">
            <h1 className="brand-title">Odd None Out</h1>
            <p className="app-tagline">A cozy category puzzle.</p>
          </div>
        </div>
        <p className="app-subtitle">
          Reveal words, take a guess, and see if you can name the group.
        </p>
      </header>

      <section className="game-card">
        <main className="app-main">
          <section className="board">
            <div className="board-top">
              <h2>Word lineup</h2>
              <span className="board-count">
                {Math.min(revealedCount, 5)} / 5 revealed
              </span>
            </div>

            {loading && <p className="status status--neutral">Loading puzzle...</p>}
            {error && <p className="status status--error">{error}</p>}

            {!loading && !error && (
              <div className="word-grid">
                {words.map((word, index) => {
                  const revealed = index < revealedCount || status === 'correct'
                  return (
                    <div
                      key={`${word}-${index}`}
                      className={`word-card ${
                        revealed ? 'revealed' : 'hidden'
                      }`}
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      {revealed ? word : '-----'}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="pencil-divider" aria-hidden="true" />

          <section className="guess-panel">
            <h2>Guess the category</h2>
            <form className="guess-form" onSubmit={handleSubmit}>
              <label className="guess-label" htmlFor="guess">
                Your guess
              </label>
              <div className="guess-controls">
                <input
                  id="guess"
                  type="text"
                  name="guess"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  placeholder="e.g. Words after bread"
                  disabled={!puzzle || loading || roundOver}
                />
                <button
                  className="primary"
                  type="submit"
                  disabled={!puzzle || loading || roundOver}
                >
                  Submit
                </button>
                <button
                  className={nextButtonClass}
                  type="button"
                  onClick={() => startNewPuzzle(puzzle?.id)}
                  disabled={loading}
                >
                  Next Puzzle
                </button>
              </div>
            </form>

            <div className="guess-actions">
              <p className="hint">
                Every miss reveals one more word. Keep narrowing the category.
              </p>
            </div>

            {isDev && debugInfo && (
              <div className="debug-panel">
                <h3>Debug</h3>
                <dl className="debug-list">
                  <dt>Reason</dt>
                  <dd>{debugInfo.reason}</dd>
                  <dt>Normalized</dt>
                  <dd>{debugInfo.normalizedGuess || '-'}</dd>
                  <dt>Guess tokens</dt>
                  <dd>{debugInfo.filteredGuessTokens.join(', ') || '-'}</dd>
                  <dt>Category tokens</dt>
                  <dd>{debugInfo.categoryTokens.join(', ') || '-'}</dd>
                  <dt>Hit count</dt>
                  <dd>
                    {debugInfo.hitCount ?? 0} / {debugInfo.requiredHits ?? 0}
                  </dd>
                  <dt>Matcher patterns</dt>
                  <dd>
                    {debugInfo.matcherPatterns?.join(', ') || '-'}
                  </dd>
                </dl>
              </div>
            )}
          </section>
        </main>

        {!loading && !error && (
          <section className={`status-panel status-panel--${statusVariant}`}>
            <div className="status-header">
              <span className="status-chip">{statusTitle}</span>
              {statusCategory && (
                <span className="status-category-label">Category</span>
              )}
            </div>
            {statusCategory && (
              <p className="status-category">{statusCategory}</p>
            )}
            <p className="status-text">{statusMessage}</p>
          </section>
        )}
      </section>
    </div>
  )
}

export default App
