import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { gameType, score, completed } = body

    // Insert game session
    const { data: gameSession, error: gameError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        game_type: gameType,
        score,
        completed,
      })
      .select()
      .single()

    if (gameError) {
      throw gameError
    }

    // Update user stats
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (currentStats) {
      // Calculate new stats
      const totalGames = (currentStats.total_games_played || 0) + 1
      const avgScore = ((currentStats.average_score || 0) * currentStats.total_games_played + score) / totalGames
      
      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          total_games_played: totalGames,
          average_score: avgScore,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (statsError) {
        throw statsError
      }
    } else {
      // Create initial stats
      const { error: createError } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_games_played: 1,
          average_score: score,
          current_streak: 1,
          best_streak: 1,
        })

      if (createError) {
        throw createError
      }
    }

    return NextResponse.json({
      success: true,
      gameSession,
    })
  } catch (error) {
    console.error('Game submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit game' },
      { status: 500 }
    )
  }
}
