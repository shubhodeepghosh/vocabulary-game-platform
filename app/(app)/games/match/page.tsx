'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Clock } from 'lucide-react'

export default function MatchPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Word Match</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Match words with their correct definitions
          </p>
        </div>
        <Link href="/games">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Clock className="h-12 w-12 text-primary/50" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This game is being developed. Check back soon!
            </p>
          </div>
          <Link href="/games">
            <Button className="mt-4">Back to Games</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
