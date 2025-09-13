"use client"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Play, Pause, Timer } from "lucide-react"

export default function Flashcards({ summarization }) {
  const input = summarization?.inputText || ""
  const summary = summarization?.summary || ""

  const flashcards = useMemo(() => {
    const text = summary.trim() || input.trim()
    if (!text) return []
    let cards = text
      .split(/(?<=[.?!])\s+|(?<=\n)\s*[-•*]\s*|(?<=\n)\s*\d+\.\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter(s => s.length > 10)
    if (cards.length < 3) {
      cards = text
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    return cards
  }, [summary, input])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffledOrder, setShuffledOrder] = useState([])
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000)
  const [timeRemaining, setTimeRemaining] = useState(autoPlaySpeed / 1000)

  useEffect(() => {
    if (flashcards.length > 0) {
      setShuffledOrder(Array.from({ length: flashcards.length }, (_, i) => i))
    }
  }, [flashcards.length])

  useEffect(() => {
    let interval
    let countdown
    if (isAutoPlay && flashcards.length > 0) {
      setTimeRemaining(autoPlaySpeed / 1000)
      countdown = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            return autoPlaySpeed / 1000
          }
          return prev - 1
        })
      }, 1000)
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length)
      }, autoPlaySpeed)
    }
    return () => {
      if (interval) clearInterval(interval)
      if (countdown) clearInterval(countdown)
    }
  }, [isAutoPlay, autoPlaySpeed, flashcards.length])

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
    if (isAutoPlay) {
      setTimeRemaining(autoPlaySpeed / 1000)
    }
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    if (isAutoPlay) {
      setTimeRemaining(autoPlaySpeed / 1000)
    }
  }

  const shuffleCards = () => {
    const newOrder = [...shuffledOrder].sort(() => Math.random() - 0.5)
    setShuffledOrder(newOrder)
    setCurrentIndex(0)
  }

  const resetCards = () => {
    setCurrentIndex(0)
    setShuffledOrder(Array.from({ length: flashcards.length }, (_, i) => i))
    setIsAutoPlay(false)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
    if (!isAutoPlay) {
      setTimeRemaining(autoPlaySpeed / 1000)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextCard()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevCard()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        toggleAutoPlay()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAutoPlay, autoPlaySpeed])

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Card className="w-[32rem] h-64 flex items-center justify-center shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="text-center text-gray-500 p-6">
            <p>No content available for flashcards.</p>
            <p className="text-sm mt-2">Please provide a summary or input text.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentCardIndex = shuffledOrder[currentIndex] || currentIndex
  const currentCard = flashcards[currentCardIndex]

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      <div className="relative mb-6">
        <Card 
          className={`w-[32rem] h-64 shadow-xl rounded-2xl transform transition-all duration-300 hover:scale-105 ${
            isAutoPlay 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-200' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}
        >
          <CardContent className="flex items-center justify-center h-full text-center p-6 relative">
            {isAutoPlay && (
              <div className="absolute top-4 right-4 flex items-center gap-2 text-green-600">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-mono">{timeRemaining}s</span>
              </div>
            )}
            <div className="space-y-4 max-w-full">
              <div className={`text-sm font-semibold uppercase tracking-wide ${
                isAutoPlay ? 'text-green-600' : 'text-blue-600'
              }`}>
                {isAutoPlay ? 'Auto-Play Mode' : 'Summary Point'}
              </div>
              <div className="leading-relaxed text-gray-800 text-lg font-medium">
                {currentCard}
              </div>
              <div className="text-xs text-gray-400 mt-4">
                {isAutoPlay ? 'Auto-advancing...' : 'Use controls below to navigate'}
              </div>
            </div>
          </CardContent>
        </Card>
        {isAutoPlay && (
          <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((autoPlaySpeed / 1000 - timeRemaining) / (autoPlaySpeed / 1000)) * 100}%` 
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={prevCard}
          className="flex items-center gap-2 px-6"
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant={isAutoPlay ? "default" : "outline"}
          size="lg"
          onClick={toggleAutoPlay}
          className={`px-6 flex items-center gap-2 ${
            isAutoPlay 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : ''
          }`}
        >
          {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAutoPlay ? 'Pause' : 'Auto-Play'}
        </Button>
        <Button
          size="lg"
          onClick={nextCard}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6"
          disabled={flashcards.length <= 1}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {isAutoPlay && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-green-50 rounded-lg">
          <span className="text-sm text-green-700 font-medium">Speed:</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoPlaySpeed(12000)}
              className={autoPlaySpeed === 12000 ? 'bg-green-100' : ''}
            >
              Slow (12s)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoPlaySpeed(8000)}
              className={autoPlaySpeed === 8000 ? 'bg-green-100' : ''}
            >
              Normal (8s)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoPlaySpeed(4000)}
              className={autoPlaySpeed === 4000 ? 'bg-green-100' : ''}
            >
              Fast (4s)
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={shuffleCards}
          className="flex items-center gap-2"
        >
          <Shuffle className="w-3 h-3" />
          Shuffle
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetCards}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500 font-medium">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Use ← → arrow keys, spacebar for next, or Enter for auto-play
        </p>
      </div>
    </div>
  )
}