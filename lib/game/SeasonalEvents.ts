// Seasonal Events System for Dot Universe
// Provides special time-limited events with unique rewards

export interface SeasonalEvent {
  id: string
  name: string
  description: string
  icon: string
  theme: string
  startDate: string // ISO date
  endDate: string   // ISO date
  isActive: boolean
  rewards: EventReward[]
  challenges: EventChallenge[]
  modifiers: EventModifier[]
}

export interface EventReward {
  id: string
  name: string
  description: string
  icon: string
  type: 'cosmetic' | 'bonus' | 'title' | 'badge'
  requirement: number // Points needed
}

export interface EventChallenge {
  id: string
  name: string
  description: string
  icon: string
  type: 'kills' | 'floors' | 'combo' | 'gold' | 'boss' | 'time'
  target: number
  points: number
}

export interface EventModifier {
  type: 'damage' | 'gold' | 'xp' | 'spawn' | 'special'
  value: number
  description: string
}

// Seasonal event definitions
const SEASONAL_EVENTS: Omit<SeasonalEvent, 'isActive'>[] = [
  // Valentine's Day Event (February)
  {
    id: 'valentines_2026',
    name: "Valentine's Massacre",
    description: 'Love is in the air... and so is danger! Special heart-themed enemies and double gold from bosses.',
    icon: '💘',
    theme: 'valentine',
    startDate: '2026-02-01',
    endDate: '2026-02-14',
    rewards: [
      { id: 'heart_badge', name: 'Heart Slayer', description: 'Exclusive Valentine badge', icon: '💖', type: 'badge', requirement: 1000 },
      { id: 'cupid_title', name: 'Cupid', description: 'Title: Cupid', icon: '🏷️', type: 'title', requirement: 2500 },
      { id: 'love_bonus', name: 'Power of Love', description: '+5% permanent damage', icon: '💪', type: 'bonus', requirement: 5000 },
    ],
    challenges: [
      { id: 'v_kills', name: 'Heartbreaker', description: 'Kill 500 enemies', icon: '💔', type: 'kills', target: 500, points: 200 },
      { id: 'v_combo', name: 'Love Combo', description: 'Reach 100x combo', icon: '💕', type: 'combo', target: 100, points: 300 },
      { id: 'v_gold', name: 'Gold Digger', description: 'Collect 50,000 gold', icon: '💰', type: 'gold', target: 50000, points: 250 },
      { id: 'v_boss', name: 'Boss Crush', description: 'Defeat 10 bosses', icon: '👹', type: 'boss', target: 10, points: 400 },
    ],
    modifiers: [
      { type: 'gold', value: 2, description: 'Double gold from bosses' },
      { type: 'special', value: 1, description: 'Heart enemies spawn' },
    ],
  },

  // Void Incursion Event (March 2026)
  {
    id: 'void_incursion_2026',
    name: 'Void Incursion',
    description: 'The Void tears open! 2x void enemy spawns, 1.5x gold, 1.5x XP. Push deep into the abyss!',
    icon: '🌑',
    theme: 'void',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    rewards: [
      { id: 'void_badge', name: 'Void Walker', description: 'Exclusive Void Incursion badge', icon: '🌑', type: 'badge', requirement: 500 },
      { id: 'void_title', name: 'Void Conqueror', description: 'Title: Void Conqueror', icon: '🏷️', type: 'title', requirement: 1500 },
      { id: 'void_bonus', name: 'Void Mastery', description: '+15% damage to void enemies permanently', icon: '💥', type: 'bonus', requirement: 3000 },
    ],
    challenges: [
      { id: 'vi_kills', name: 'Void Purge', description: 'Kill 500 void enemies', icon: '🌀', type: 'kills', target: 500, points: 300 },
      { id: 'vi_floors', name: 'Abyss Diver', description: 'Reach floor 120', icon: '🕳️', type: 'floors', target: 120, points: 400 },
      { id: 'vi_boss', name: 'Void Lord Slayer', description: 'Defeat the Void Lord', icon: '👹', type: 'boss', target: 1, points: 500 },
      { id: 'vi_combo', name: 'Void Streak', description: 'Reach 150x combo', icon: '🔥', type: 'combo', target: 150, points: 350 },
      { id: 'vi_gold', name: 'Void Riches', description: 'Collect 100,000 gold', icon: '💰', type: 'gold', target: 100000, points: 250 },
      { id: 'vi_time', name: 'Speed Void', description: 'Clear 30 floors in 20 min', icon: '⏱️', type: 'time', target: 30, points: 450 },
    ],
    modifiers: [
      { type: 'gold', value: 1.5, description: '+50% gold drops' },
      { type: 'xp', value: 1.5, description: '+50% XP from all sources' },
      { type: 'special', value: 2, description: '2x void enemy spawns' },
    ],
  },

  // Spring Bloom Event (April 2026)
  {
    id: 'spring_2026',
    name: 'Spring Bloom',
    description: 'Nature awakens! Flowers bloom with bonus XP and enemies drop spring crystals.',
    icon: '🌸',
    theme: 'spring',
    startDate: '2026-04-20',
    endDate: '2026-05-20',
    rewards: [
      { id: 'flower_badge', name: 'Spring Guardian', description: 'Exclusive Spring badge', icon: '🌺', type: 'badge', requirement: 1500 },
      { id: 'nature_title', name: 'Nature Spirit', description: 'Title: Nature Spirit', icon: '🏷️', type: 'title', requirement: 3000 },
      { id: 'bloom_bonus', name: 'Spring Growth', description: '+10% XP permanently', icon: '📈', type: 'bonus', requirement: 6000 },
    ],
    challenges: [
      { id: 's_floors', name: 'Spring Climber', description: 'Complete 100 floors', icon: '🏔️', type: 'floors', target: 100, points: 300 },
      { id: 's_kills', name: 'Garden Cleaner', description: 'Kill 1000 enemies', icon: '🌿', type: 'kills', target: 1000, points: 350 },
      { id: 's_time', name: 'Speed Bloom', description: 'Clear 20 floors in 15 min', icon: '⏱️', type: 'time', target: 20, points: 500 },
    ],
    modifiers: [
      { type: 'xp', value: 1.5, description: '+50% XP from all sources' },
      { type: 'spawn', value: 0.8, description: 'Faster enemy respawns' },
    ],
  },

  // Summer Inferno (June-July)
  {
    id: 'summer_2026',
    name: 'Summer Inferno',
    description: 'The heat is on! Fire-themed enemies deal more damage but drop extra loot.',
    icon: '🔥',
    theme: 'summer',
    startDate: '2026-06-21',
    endDate: '2026-07-21',
    rewards: [
      { id: 'fire_badge', name: 'Inferno Warrior', description: 'Exclusive Summer badge', icon: '🌋', type: 'badge', requirement: 2000 },
      { id: 'sun_title', name: 'Sun Champion', description: 'Title: Sun Champion', icon: '🏷️', type: 'title', requirement: 4000 },
      { id: 'heat_bonus', name: 'Burning Fury', description: '+15% critical chance', icon: '💥', type: 'bonus', requirement: 8000 },
    ],
    challenges: [
      { id: 'su_kills', name: 'Heat Wave', description: 'Kill 2000 enemies', icon: '🌡️', type: 'kills', target: 2000, points: 400 },
      { id: 'su_combo', name: 'Fire Streak', description: 'Reach 150x combo', icon: '☄️', type: 'combo', target: 150, points: 500 },
      { id: 'su_boss', name: 'Sunburn', description: 'Defeat 20 bosses', icon: '☀️', type: 'boss', target: 20, points: 600 },
    ],
    modifiers: [
      { type: 'damage', value: 1.25, description: '+25% player damage' },
      { type: 'gold', value: 1.5, description: '+50% gold drops' },
    ],
  },

  // Halloween Event (October)
  {
    id: 'halloween_2026',
    name: 'Haunted Tower',
    description: 'Spooky season is here! Ghost enemies, skeleton bosses, and candy drops.',
    icon: '🎃',
    theme: 'halloween',
    startDate: '2026-10-15',
    endDate: '2026-11-01',
    rewards: [
      { id: 'skull_badge', name: 'Spook Master', description: 'Exclusive Halloween badge', icon: '💀', type: 'badge', requirement: 2500 },
      { id: 'ghost_title', name: 'Phantom', description: 'Title: Phantom', icon: '🏷️', type: 'title', requirement: 5000 },
      { id: 'candy_bonus', name: 'Sugar Rush', description: '+20% movement speed', icon: '🍬', type: 'bonus', requirement: 10000 },
    ],
    challenges: [
      { id: 'h_kills', name: 'Ghost Buster', description: 'Kill 3000 enemies', icon: '👻', type: 'kills', target: 3000, points: 500 },
      { id: 'h_floors', name: 'Haunted Climber', description: 'Complete 150 floors', icon: '🏚️', type: 'floors', target: 150, points: 600 },
      { id: 'h_boss', name: 'Pumpkin Smasher', description: 'Defeat 25 bosses', icon: '🎃', type: 'boss', target: 25, points: 700 },
    ],
    modifiers: [
      { type: 'special', value: 1, description: 'Halloween enemies spawn' },
      { type: 'gold', value: 2, description: 'Double candy (gold) drops' },
    ],
  },

  // Winter Wonderland (December)
  {
    id: 'winter_2026',
    name: 'Winter Wonderland',
    description: 'Snow falls in the tower! Ice enemies, holiday bosses, and gift drops.',
    icon: '❄️',
    theme: 'winter',
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    rewards: [
      { id: 'snow_badge', name: 'Frost Walker', description: 'Exclusive Winter badge', icon: '🏔️', type: 'badge', requirement: 3000 },
      { id: 'ice_title', name: 'Ice King/Queen', description: 'Title: Ice Monarch', icon: '🏷️', type: 'title', requirement: 6000 },
      { id: 'gift_bonus', name: 'Holiday Spirit', description: '+25% all stats', icon: '🎁', type: 'bonus', requirement: 12000 },
    ],
    challenges: [
      { id: 'w_kills', name: 'Snowball Fight', description: 'Kill 4000 enemies', icon: '⛄', type: 'kills', target: 4000, points: 600 },
      { id: 'w_combo', name: 'Blizzard', description: 'Reach 200x combo', icon: '🌨️', type: 'combo', target: 200, points: 800 },
      { id: 'w_floors', name: 'North Pole', description: 'Complete 200 floors', icon: '🎅', type: 'floors', target: 200, points: 900 },
    ],
    modifiers: [
      { type: 'xp', value: 2, description: 'Double XP during holidays' },
      { type: 'special', value: 1, description: 'Gift boxes drop from enemies' },
    ],
  },
]

export interface EventProgress {
  eventId: string
  points: number
  challengesCompleted: string[]
  rewardsClaimed: string[]
}

export class SeasonalEventManager {
  private currentEvent: SeasonalEvent | null = null
  private progress: EventProgress | null = null

  constructor() {
    this.loadProgress()
    this.checkActiveEvent()
  }

  private loadProgress() {
    if (typeof localStorage === 'undefined') return

    const saved = localStorage.getItem('dotslayer_event_progress')
    if (saved) {
      try {
        this.progress = JSON.parse(saved)
      } catch {
        this.progress = null
      }
    }
  }

  private saveProgress() {
    if (typeof localStorage === 'undefined' || !this.progress) return
    localStorage.setItem('dotslayer_event_progress', JSON.stringify(this.progress))
  }

  private checkActiveEvent() {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    for (const event of SEASONAL_EVENTS) {
      if (today >= event.startDate && today <= event.endDate) {
        this.currentEvent = { ...event, isActive: true }

        // Initialize progress if new event
        if (!this.progress || this.progress.eventId !== event.id) {
          this.progress = {
            eventId: event.id,
            points: 0,
            challengesCompleted: [],
            rewardsClaimed: [],
          }
          this.saveProgress()
        }
        return
      }
    }

    this.currentEvent = null
  }

  // Public API
  getCurrentEvent(): SeasonalEvent | null {
    this.checkActiveEvent()
    return this.currentEvent
  }

  getProgress(): EventProgress | null {
    return this.progress
  }

  getTimeRemaining(): string | null {
    if (!this.currentEvent) return null

    const now = new Date()
    const end = new Date(this.currentEvent.endDate + 'T23:59:59')
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return 'Ending soon'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  updateChallengeProgress(type: EventChallenge['type'], amount: number) {
    if (!this.currentEvent || !this.progress) return

    for (const challenge of this.currentEvent.challenges) {
      if (challenge.type === type && !this.progress.challengesCompleted.includes(challenge.id)) {
        // Check if completed (for simplicity, we track completion not partial progress)
        // In a real implementation, you'd track per-challenge progress
        if (amount >= challenge.target) {
          this.progress.challengesCompleted.push(challenge.id)
          this.progress.points += challenge.points
          this.saveProgress()
        }
      }
    }
  }

  claimReward(rewardId: string): EventReward | null {
    if (!this.currentEvent || !this.progress) return null

    const reward = this.currentEvent.rewards.find(r => r.id === rewardId)
    if (!reward) return null

    if (this.progress.points >= reward.requirement && !this.progress.rewardsClaimed.includes(rewardId)) {
      this.progress.rewardsClaimed.push(rewardId)
      this.saveProgress()
      return reward
    }

    return null
  }

  getModifiers(): EventModifier[] {
    return this.currentEvent?.modifiers || []
  }

  getDamageMultiplier(): number {
    const mod = this.currentEvent?.modifiers.find(m => m.type === 'damage')
    return mod?.value || 1
  }

  getGoldMultiplier(): number {
    const mod = this.currentEvent?.modifiers.find(m => m.type === 'gold')
    return mod?.value || 1
  }

  getXpMultiplier(): number {
    const mod = this.currentEvent?.modifiers.find(m => m.type === 'xp')
    return mod?.value || 1
  }

  getUpcomingEvents(): SeasonalEvent[] {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    return SEASONAL_EVENTS
      .filter(e => e.startDate > today)
      .map(e => ({ ...e, isActive: false }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  }
}

// Singleton instance
let seasonalEventManager: SeasonalEventManager | null = null

export function getSeasonalEventManager(): SeasonalEventManager {
  if (!seasonalEventManager) {
    seasonalEventManager = new SeasonalEventManager()
  }
  return seasonalEventManager
}

// ═══════════════════════════════════════════════════════════════
// SEASON PASS SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface SeasonPassReward {
  tier: number
  name: string
  description: string
  icon: string
  type: 'xp_bonus' | 'gold_bonus' | 'damage_bonus' | 'rarity_bonus' | 'companion_xp' | 'title' | 'cosmetic' | 'elemental_core'
  value: number // multiplier or flat bonus
}

const SEASON_PASS_REWARDS: SeasonPassReward[] = [
  { tier: 3, name: 'XP Boost', description: '+5% XP bonus', icon: '📈', type: 'xp_bonus', value: 0.05 },
  { tier: 6, name: 'Seasonal Skin', description: 'Seasonal weapon tint', icon: '🎨', type: 'cosmetic', value: 1 },
  { tier: 9, name: 'Gold Rush', description: '+10% gold bonus', icon: '💰', type: 'gold_bonus', value: 0.10 },
  { tier: 12, name: 'Companion Boost', description: '+25% companion XP', icon: '🐾', type: 'companion_xp', value: 0.25 },
  { tier: 15, name: 'Seasonal Title', description: 'Unique monthly title', icon: '🏷️', type: 'title', value: 1 },
  { tier: 18, name: 'Power Surge', description: '+15% damage bonus', icon: '⚔️', type: 'damage_bonus', value: 0.15 },
  { tier: 21, name: 'Elemental Core', description: 'Random elemental core', icon: '💎', type: 'elemental_core', value: 1 },
  { tier: 24, name: 'Lucky Star', description: '+20% item rarity', icon: '✨', type: 'rarity_bonus', value: 0.20 },
  { tier: 27, name: 'Season Badge', description: 'Exclusive season badge', icon: '🏅', type: 'cosmetic', value: 1 },
  { tier: 30, name: 'Grand Prize', description: 'All bonuses permanent for season', icon: '👑', type: 'cosmetic', value: 1 },
]

export interface SeasonPassData {
  seasonId: string
  points: number
  claimedRewards: number[] // tiers claimed
}

const SEASON_PASS_STORAGE_KEY = 'dotslayer_season_pass'
const POINTS_PER_TIER = 100

export class SeasonPassManager {
  private data: SeasonPassData

  constructor() {
    this.data = this.load()
    // Check if season changed
    const currentSeason = this.getCurrentSeasonId()
    if (this.data.seasonId !== currentSeason) {
      this.data = { seasonId: currentSeason, points: 0, claimedRewards: [] }
      this.save()
    }
  }

  private getCurrentSeasonId(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  getCurrentSeasonName(): string {
    const now = new Date()
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[now.getMonth()]} ${now.getFullYear()}`
  }

  getSeasonEndDate(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 1) // first of next month
  }

  getTimeRemaining(): string {
    const end = this.getSeasonEndDate()
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return 'Season ending...'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`
  }

  private load(): SeasonPassData {
    if (typeof localStorage === 'undefined') {
      return { seasonId: '', points: 0, claimedRewards: [] }
    }
    try {
      const stored = localStorage.getItem(SEASON_PASS_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to load season pass:', e)
    }
    return { seasonId: this.getCurrentSeasonId(), points: 0, claimedRewards: [] }
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(SEASON_PASS_STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save season pass:', e)
    }
  }

  addPoints(points: number, _source?: string): void {
    this.data.points += points
    this.save()
  }

  getPoints(): number { return this.data.points }
  getCurrentTier(): number { return Math.min(30, Math.floor(this.data.points / POINTS_PER_TIER)) }
  getProgressToNextTier(): number {
    if (this.getCurrentTier() >= 30) return 1
    return (this.data.points % POINTS_PER_TIER) / POINTS_PER_TIER
  }

  getRewards(): SeasonPassReward[] { return SEASON_PASS_REWARDS }

  getClaimableRewards(): SeasonPassReward[] {
    const tier = this.getCurrentTier()
    return SEASON_PASS_REWARDS.filter(r =>
      r.tier <= tier && !this.data.claimedRewards.includes(r.tier)
    )
  }

  claimReward(tier: number): SeasonPassReward | null {
    if (this.data.claimedRewards.includes(tier)) return null
    const reward = SEASON_PASS_REWARDS.find(r => r.tier === tier)
    if (!reward || this.getCurrentTier() < tier) return null
    this.data.claimedRewards.push(tier)
    this.save()
    return reward
  }

  isRewardClaimed(tier: number): boolean {
    return this.data.claimedRewards.includes(tier)
  }

  // Active season bonuses (from claimed rewards)
  getActiveSeasonBonuses(): { xpMult: number, goldMult: number, damageMult: number, rarityMult: number, companionXPMult: number } {
    let xp = 1, gold = 1, damage = 1, rarity = 1, companionXP = 1
    for (const tier of this.data.claimedRewards) {
      const reward = SEASON_PASS_REWARDS.find(r => r.tier === tier)
      if (!reward) continue
      switch (reward.type) {
        case 'xp_bonus': xp += reward.value; break
        case 'gold_bonus': gold += reward.value; break
        case 'damage_bonus': damage += reward.value; break
        case 'rarity_bonus': rarity += reward.value; break
        case 'companion_xp': companionXP += reward.value; break
      }
    }
    return { xpMult: xp, goldMult: gold, damageMult: damage, rarityMult: rarity, companionXPMult: companionXP }
  }

  getSeasonId(): string { return this.data.seasonId }
}

// ═══════════════════════════════════════════════════════════════
// WEEKLY ROTATING MODIFIERS
// ═══════════════════════════════════════════════════════════════

export interface WeeklyModifier {
  id: string
  name: string
  description: string
  icon: string
  effect: Record<string, number | boolean>
}

const WEEKLY_MODIFIERS: WeeklyModifier[] = [
  { id: 'double_boss_hp', name: 'Double Boss HP', description: 'Bosses have 2x health', icon: '👹', effect: { bossHPMult: 2 } },
  { id: 'fire_floor', name: 'Fire Floor', description: 'All floors have fire hazards', icon: '🔥', effect: { fireHazards: true } },
  { id: 'speed_run', name: 'Speed Run', description: '+50% speed, -50% HP', icon: '⚡', effect: { speedMult: 1.5, hpMult: 0.5 } },
  { id: 'loot_frenzy', name: 'Loot Frenzy', description: '+100% item drop rate', icon: '💎', effect: { lootMult: 2 } },
  { id: 'glass_cannon', name: 'Glass Cannon', description: '2x damage, 1 HP', icon: '💀', effect: { damageMult: 2, startHP: 1 } },
  { id: 'elemental_chaos', name: 'Elemental Chaos', description: 'Random element per floor', icon: '🌀', effect: { randomElements: true } },
  { id: 'companion_frenzy', name: 'Companion Frenzy', description: 'Companion abilities 50% CDR', icon: '🐾', effect: { companionCDR: 0.5 } },
  { id: 'prestige_rush', name: 'Prestige Rush', description: '+50% Ascension Points', icon: '⭐', effect: { apMult: 1.5 } },
]

export function getWeeklyModifier(): WeeklyModifier {
  // Deterministic from week number — same for all players
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const index = weekNumber % WEEKLY_MODIFIERS.length
  return WEEKLY_MODIFIERS[index]
}

export function getWeeklyModifierTimeRemaining(): string {
  const now = new Date()
  // Next Monday
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday)
  const diff = nextMonday.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return `${days}d ${hours}h`
}

// Season pass singleton
let seasonPassManager: SeasonPassManager | null = null
export function getSeasonPassManager(): SeasonPassManager {
  if (!seasonPassManager) {
    seasonPassManager = new SeasonPassManager()
  }
  return seasonPassManager
}
