'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Zap,
  BarChart3,
  Trophy,
  Flame,
  ChevronRight,
} from 'lucide-react'

interface Game {
  id: string
  name: string
  description: string
  fullDescription: string
  icon: React.ReactNode
  color: string
  href: string
  difficulty: string
}

export default function GamesPage() {
  const games: Game[] = [
    {
      id: 'wordle',
      name: 'Wordle',
      description: 'Guess the word in 6 attempts',
      fullDescription:
        'Classic word guessing game. You have 6 attempts to guess the hidden word. Each guess reveals if letters are in the correct position or exist in the word.',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      href: '/games/wordle',
      difficulty: 'Medium',
    },
    {
      id: 'match',
      name: 'Word Match',
      description: 'Match words with definitions',
      fullDescription:
        'Test your vocabulary knowledge by matching words with their correct definitions. Quick and engaging!',
      icon: <Zap className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      href: '/games/match',
      difficulty: 'Easy',
    },
    {
      id: 'flashcard',
      name: 'Flashcards',
      description: 'Learn with interactive flashcards',
      fullDescription:
        'Study vocabulary using flashcards. Flip cards to reveal definitions and test your memory.',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'from-cyan-500 to-cyan-600',
      href: '/games/flashcard',
      difficulty: 'Easy',
    },
    {
      id: 'sentence',
      name: 'Sentence Builder',
      description: 'Build correct sentences',
      fullDescription:
        'Arrange words to form correct sentences. Learn how words work together in context.',
      icon: <Trophy className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      href: '/games/sentence',
      difficulty: 'Hard',
    },
    {
      id: 'rapid',
      name: 'Rapid Fire',
      description: 'Answer questions quickly',
      fullDescription:
        'Answer vocabulary questions as fast as you can. Test your knowledge under pressure!',
      icon: <Flame className="h-8 w-8" />,
      color: 'from-orange-500 to-orange-600',
      href: '/games/rapid',
      difficulty: 'Hard',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">All Games</h2>
        <p className="mt-2 text-muted-foreground">
          Choose your favorite vocabulary game and start learning
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.map((game) => (
          <Card
            key={game.id}
            className="group flex flex-col overflow-hidden transition-all hover:shadow-lg"
          >
            <div
              className={`bg-gradient-to-br ${game.color} p-6 text-white`}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-white/20 p-3">
                  {game.icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {game.difficulty}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{game.name}</h3>
              <p className="mt-1 text-sm text-white/80">{game.description}</p>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="flex-1 text-sm text-muted-foreground">
                {game.fullDescription}
              </p>
              <Link href={game.href} className="mt-4">
                <Button className="w-full gap-2">
                  Play Now
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
