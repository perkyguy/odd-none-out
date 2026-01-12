import { useEffect, useState } from 'react'

import './App.css'
import { isMatch } from './lib/match'
import { loadRandomPuzzle } from './lib/puzzles'
import type { Puzzle } from './lib/types'

type GuessStatus = 'idle' | 'correct' | 'incorrect'

function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [revealedCount, setRevealedCount] = useState(1)
  const [guess, setGuess] = useState('')
  const [status, setStatus] = useState<GuessStatus>('idle')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadPuzzle = async () => {
      setLoading(true)
      setError(null)
      try {
        const nextPuzzle = await loadRandomPuzzle()
        if (!active) {
          return
        }
        setPuzzle(nextPuzzle)
        setRevealedCount(1)
        setGuess('')
        setStatus('idle')
      } catch (loadError) {
        if (active) {
          setError('Could not load a puzzle. Try refreshing.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPuzzle()

    return () => {
      active = false
    }
  }, [])

  const words = puzzle?.words ?? []
  const allRevealed = puzzle ? revealedCount >= puzzle.words.length : false

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!puzzle || status === 'correct') {
      return
    }
    const trimmedGuess = guess.trim()
    if (!trimmedGuess) {
      return
    }

    if (isMatch(trimmedGuess, puzzle.category)) {
      setStatus('correct')
      setRevealedCount(puzzle.words.length)
    } else {
      setStatus('incorrect')
    }
  }

  const handleRevealNext = () => {
    if (!puzzle || status !== 'incorrect') {
      return
    }
    setRevealedCount((count) =>
      Math.min(count + 1, puzzle.words.length),
    )
    setStatus('idle')
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-eyebrow">Odd None Out</p>
        <h1>Spot the hidden category.</h1>
        <p className="app-subtitle">
          Reveal words, take a guess, and see if you can name the group.
        </p>
      </header>

      <main className="app-main">
        <section className="board">
          <div className="board-top">
            <h2>Word lineup</h2>
            <span className="board-count">
              {Math.min(revealedCount, 5)} / 5 revealed
            </span>
          </div>

          {loading && <p className="status neutral">Loading puzzle...</p>}
          {error && <p className="status error">{error}</p>}

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

          {!loading && !error && status === 'correct' && puzzle && (
            <div className="status success">
              <strong>Correct.</strong> The category is{' '}
              <span className="category-name">{puzzle.category.canonical}</span>.
            </div>
          )}

          {!loading && !error && status === 'incorrect' && (
            <div className="status warning">Not quite. Try again.</div>
          )}
        </section>

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
                disabled={!puzzle || loading || status === 'correct'}
              />
              <button
                className="primary"
                type="submit"
                disabled={!puzzle || loading || status === 'correct'}
              >
                Submit
              </button>
            </div>
          </form>

          <div className="guess-actions">
            <button
              className="secondary"
              type="button"
              onClick={handleRevealNext}
              disabled={!puzzle || status !== 'incorrect' || allRevealed}
            >
              Reveal next word
            </button>
            <p className="hint">
              Incorrect guesses unlock one more word. Keep narrowing the category.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
