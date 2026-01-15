import { useCallback, useEffect, useRef, useState } from 'react'

import './App.css'
import { IconMark } from './components/IconMark'
import { applyIncorrectGuess, type GuessStatus } from './lib/game'
import { getMatchDebug, isMatch, type MatchDebug } from './lib/match'
import { loadRandomPuzzle } from './lib/puzzles'
import type { Puzzle } from './lib/types'

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
        const offlineMessage = navigator.onLine
          ? 'Could not load a puzzle. Try refreshing.'
          : 'You appear to be offline. Connect to load puzzles.'
        setError(offlineMessage)
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
  const isWin = status === 'correct'
  const isLose = status === 'lost'
  const isLastChance = status === 'last'
  const isWarning = status === 'incorrect'
  const roundOver = isWin || isLose
  const statusVariant = isWin
    ? 'win'
    : isLose
      ? 'lose'
      : isWarning || isLastChance
        ? 'warning'
        : 'playing'
  const statusCategory = puzzle && (isWin || isLose) ? puzzle.category.canonical : null
  const nextButtonClass = isWin || isLose ? 'primary' : 'secondary'
  const canLoadNext = !loading && !error

  let statusTitle = 'Ready when you are'
  let statusMessage = 'Make a guess when the words start to click.'
  let statusMessageCompact = 'Take a guess.'
  if (isWin) {
    statusTitle = 'You solved it'
    statusMessage = 'Nicely spotted. Ready for the next one?'
    statusMessageCompact = 'Ready for another?'
  } else if (isLose) {
    statusTitle = 'Round over'
    statusMessage = 'No worries. Try a fresh puzzle when you want.'
    statusMessageCompact = 'Try a new puzzle.'
  } else if (isLastChance) {
    statusTitle = 'Last chance'
    statusMessage = 'One more guess with all the words revealed.'
    statusMessageCompact = 'One more guess.'
  } else if (isWarning) {
    statusTitle = 'Not quite'
    statusMessage = 'Another word appears to help.'
    statusMessageCompact = 'Another word appears.'
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
      const nextState = applyIncorrectGuess(
        revealedCount,
        puzzle.words.length,
      )
      setStatus(nextState.status)
      setRevealedCount(nextState.revealedCount)
    }
  }

  const statusPanelBody = (
    <>
      <div className="status-header">
        <span className="status-chip">{statusTitle}</span>
        {statusCategory && (
          <span className="status-category-label">Category</span>
        )}
      </div>
      {statusCategory && <p className="status-category">{statusCategory}</p>}
      <p className="status-text status-text--full">{statusMessage}</p>
      <p className="status-text status-text--compact">
        {statusMessageCompact}
      </p>
      <div className="status-actions">
        <button
          className={nextButtonClass}
          type="button"
          onClick={() => startNewPuzzle(puzzle?.id)}
          disabled={!canLoadNext}
        >
          Next Puzzle
        </button>
      </div>
    </>
  )

  const statusPanel = !loading && !error && (
    <section className={`status-panel status-panel--${statusVariant}`}>
      {statusPanelBody}
    </section>
  )

  const compactStatusPanel = !loading && !error && (
    <section
      className={`status-panel status-panel--compact status-panel--${statusVariant}`}
    >
      {statusPanelBody}
    </section>
  )

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
        <div className="app-hero-controls">
          <button
            className={nextButtonClass}
            type="button"
            onClick={() => startNewPuzzle(puzzle?.id)}
            disabled={!canLoadNext}
          >
            Next Puzzle
          </button>
        </div>
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
                  aria-label="Guess the category"
                  disabled={!puzzle || loading || roundOver}
                />
                <button
                  className="primary"
                  type="submit"
                  disabled={!puzzle || loading || roundOver}
                >
                  Submit
                </button>
              </div>
            </form>

            {compactStatusPanel}

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

        {statusPanel}
      </section>
    </div>
  )
}

export default App
