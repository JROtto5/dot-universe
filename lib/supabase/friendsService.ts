// Friends system service using Supabase

import { supabase } from './index'

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  from_display_name?: string
  to_display_name?: string
}

export interface Friend {
  user_id: string
  display_name: string
  last_active: string
  is_online: boolean  // active within last 5 minutes
}

export class FriendsService {
  private static instance: FriendsService
  static getInstance(): FriendsService {
    if (!this.instance) this.instance = new FriendsService()
    return this.instance
  }

  async sendFriendRequest(fromId: string, toId: string): Promise<boolean> {
    try {
      // Check for existing request
      const { data: existing } = await supabase
        .from('friend_requests')
        .select('id')
        .or(`and(from_user_id.eq.${fromId},to_user_id.eq.${toId}),and(from_user_id.eq.${toId},to_user_id.eq.${fromId})`)
        .single()

      if (existing) return false // Already exists

      await supabase.from('friend_requests').insert({
        from_user_id: fromId,
        to_user_id: toId,
        status: 'pending'
      })
      return true
    } catch (e) {
      console.error('Failed to send friend request:', e)
      return false
    }
  }

  async acceptRequest(requestId: string): Promise<boolean> {
    try {
      await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId)
      return true
    } catch (e) {
      console.error('Failed to accept friend request:', e)
      return false
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      await supabase.from('friend_requests')
        .delete()
        .or(`and(from_user_id.eq.${userId},to_user_id.eq.${friendId}),and(from_user_id.eq.${friendId},to_user_id.eq.${userId})`)
      return true
    } catch (e) {
      console.error('Failed to remove friend:', e)
      return false
    }
  }

  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('to_user_id', userId)
        .eq('status', 'pending')
      return data || []
    } catch (e) {
      console.error('Failed to get pending requests:', e)
      return []
    }
  }

  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const { data: requests } = await supabase
        .from('friend_requests')
        .select('from_user_id, to_user_id')
        .eq('status', 'accepted')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)

      if (!requests || requests.length === 0) return []

      // Get the friend IDs (the other person in each request)
      const friendIds = requests.map(r =>
        r.from_user_id === userId ? r.to_user_id : r.from_user_id
      )

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, last_active')
        .in('id', friendIds)

      if (!profiles) return []

      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      return profiles.map(p => ({
        user_id: p.id,
        display_name: p.display_name || 'Player',
        last_active: p.last_active || '',
        is_online: p.last_active ? p.last_active > fiveMinAgo : false
      }))
    } catch (e) {
      console.error('Failed to get friends:', e)
      return []
    }
  }

  async getFriendScores(userId: string, seasonId: string): Promise<Array<{ display_name: string, score: number, rank: number }>> {
    try {
      const friends = await this.getFriends(userId)
      if (friends.length === 0) return []

      const friendIds = friends.map(f => f.user_id)
      friendIds.push(userId) // Include self

      const { data } = await supabase
        .from('seasonal_leaderboard')
        .select('display_name, score')
        .eq('season_id', seasonId)
        .in('user_id', friendIds)
        .order('score', { ascending: false })

      return (data || []).map((d, i) => ({ ...d, rank: i + 1 }))
    } catch (e) {
      console.error('Failed to get friend scores:', e)
      return []
    }
  }
}

export const friendsService = FriendsService.getInstance()
