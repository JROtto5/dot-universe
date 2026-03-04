// Seasonal leaderboard service using Supabase

import { supabase } from './index'

export interface SeasonalScore {
  id?: string
  user_id: string
  display_name: string
  score: number
  floor: number
  prestige_level: number
  ng_plus_tier: number
  season_id: string  // e.g., '2026-03'
  created_at?: string
}

export class SeasonalLeaderboardService {
  private static instance: SeasonalLeaderboardService
  static getInstance(): SeasonalLeaderboardService {
    if (!this.instance) this.instance = new SeasonalLeaderboardService()
    return this.instance
  }

  getCurrentSeason(): { id: string, name: string, start: Date, end: Date } {
    const now = new Date()
    const id = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const name = `${months[now.getMonth()]} ${now.getFullYear()}`
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { id, name, start, end }
  }

  async submitScore(userId: string, displayName: string, score: number, floor: number, prestigeLevel: number, ngTier: number): Promise<boolean> {
    const season = this.getCurrentSeason()
    try {
      // Check if user already has a score this season
      const { data: existing } = await supabase
        .from('seasonal_leaderboard')
        .select('id, score')
        .eq('user_id', userId)
        .eq('season_id', season.id)
        .single()

      if (existing && existing.score >= score) return false // Not a new high score

      if (existing) {
        // Update existing score
        await supabase.from('seasonal_leaderboard').update({
          score, floor, prestige_level: prestigeLevel, ng_plus_tier: ngTier, display_name: displayName
        }).eq('id', existing.id)
      } else {
        // Insert new score
        await supabase.from('seasonal_leaderboard').insert({
          user_id: userId, display_name: displayName, score, floor,
          prestige_level: prestigeLevel, ng_plus_tier: ngTier, season_id: season.id
        })
      }
      return true
    } catch (e) {
      console.error('Failed to submit seasonal score:', e)
      return false
    }
  }

  async getLeaderboard(seasonId?: string, limit = 10): Promise<SeasonalScore[]> {
    const season = seasonId || this.getCurrentSeason().id
    try {
      const { data, error } = await supabase
        .from('seasonal_leaderboard')
        .select('*')
        .eq('season_id', season)
        .order('score', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data || []
    } catch (e) {
      console.error('Failed to fetch seasonal leaderboard:', e)
      return []
    }
  }

  async getPlayerRank(userId: string, seasonId?: string): Promise<{ rank: number, percentile: number, score: number } | null> {
    const season = seasonId || this.getCurrentSeason().id
    try {
      const { data: playerScore } = await supabase
        .from('seasonal_leaderboard')
        .select('score')
        .eq('user_id', userId)
        .eq('season_id', season)
        .single()

      if (!playerScore) return null

      const { count } = await supabase
        .from('seasonal_leaderboard')
        .select('id', { count: 'exact', head: true })
        .eq('season_id', season)
        .gte('score', playerScore.score)

      const { count: total } = await supabase
        .from('seasonal_leaderboard')
        .select('id', { count: 'exact', head: true })
        .eq('season_id', season)

      const rank = count || 1
      const percentile = total ? Math.round((1 - (rank - 1) / total) * 100) : 100

      return { rank, percentile, score: playerScore.score }
    } catch (e) {
      console.error('Failed to get player rank:', e)
      return null
    }
  }

  async getPlayerSeasonHistory(userId: string): Promise<Array<{ season_id: string, score: number, floor: number, prestige_level: number }>> {
    try {
      const { data } = await supabase
        .from('seasonal_leaderboard')
        .select('season_id, score, floor, prestige_level')
        .eq('user_id', userId)
        .order('season_id', { ascending: false })
      return data || []
    } catch (e) {
      console.error('Failed to get season history:', e)
      return []
    }
  }
}

export const seasonalLeaderboardService = SeasonalLeaderboardService.getInstance()
