/**
 * EndlessMode - Infinite floors after completing the campaign (floor 150)
 * Difficulty scales forever with Ascended enemy variants
 */

import { FloorConfig } from './FloorSystem'
import { EnemyType } from './EnemyTypes'
import { getFloorModifiers, FloorModifier } from './FloorModifiers'

const STORAGE_KEY = 'dotslayer_endless_mode'
const UNLOCK_FLOOR = 150

export interface EndlessModeData {
  unlocked: boolean
  bestFloor: number
  totalEndlessKills: number
  totalEndlessRuns: number
  milestonesReached: number[]
}

export interface EndlessMilestone {
  floor: number
  name: string
  description: string
  reward: string
  icon: string
  goldReward: number
  xpReward: number
}

export const ENDLESS_MILESTONES: EndlessMilestone[] = [
  { floor: 10, name: 'Getting Started', description: 'Reach Endless Floor 10', reward: '+500 Gold', icon: '🌟', goldReward: 500, xpReward: 200 },
  { floor: 25, name: 'Veteran', description: 'Reach Endless Floor 25', reward: '+2000 Gold', icon: '⭐', goldReward: 2000, xpReward: 500 },
  { floor: 50, name: 'Champion', description: 'Reach Endless Floor 50', reward: '+5000 Gold', icon: '🏆', goldReward: 5000, xpReward: 1000 },
  { floor: 100, name: 'Legend', description: 'Reach Endless Floor 100', reward: '+15000 Gold', icon: '👑', goldReward: 15000, xpReward: 3000 },
  { floor: 200, name: 'Transcendent', description: 'Reach Endless Floor 200', reward: '+50000 Gold', icon: '🌌', goldReward: 50000, xpReward: 10000 },
]

// All enemy types available in Endless mode (everything unlocked)
const ALL_ENEMY_TYPES = [
  EnemyType.GRUNT, EnemyType.SCOUT, EnemyType.TANK, EnemyType.SNIPER,
  EnemyType.BERSERKER, EnemyType.ASSASSIN, EnemyType.BOMBER, EnemyType.HEALER,
  EnemyType.SHIELDER, EnemyType.TELEPORTER, EnemyType.VAMPIRE, EnemyType.SPLITTER,
  EnemyType.GHOST, EnemyType.JUGGERNAUT, EnemyType.NINJA, EnemyType.NECROMANCER,
  EnemyType.EXPLODER, EnemyType.CHARGER,
  EnemyType.DRONE, EnemyType.SIEGE_BOT, EnemyType.OVERCLOCKER,
  EnemyType.TESLA_COIL, EnemyType.ASSEMBLER, EnemyType.MECH_TITAN,
  EnemyType.VOID_WALKER, EnemyType.ENTROPY, EnemyType.NULLIFIER,
  EnemyType.ABYSSAL, EnemyType.VOID_PROPHET, EnemyType.RIFT_STALKER,
  EnemyType.SHADOWLORD, EnemyType.WARDEN, EnemyType.CORRUPTED,
  EnemyType.MIRROR, EnemyType.BERSERKER_KING
]

export class EndlessModeManager {
  private static instance: EndlessModeManager
  private data: EndlessModeData
  private currentEndlessFloor = 0
  private isActive = false

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): EndlessModeManager {
    if (!EndlessModeManager.instance) {
      EndlessModeManager.instance = new EndlessModeManager()
    }
    return EndlessModeManager.instance
  }

  private load(): EndlessModeData {
    if (typeof localStorage === 'undefined') {
      return { unlocked: false, bestFloor: 0, totalEndlessKills: 0, totalEndlessRuns: 0, milestonesReached: [] }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to load endless mode data:', e)
    }
    return { unlocked: false, bestFloor: 0, totalEndlessKills: 0, totalEndlessRuns: 0, milestonesReached: [] }
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save endless mode data:', e)
    }
  }

  /**
   * Check if player has unlocked endless mode
   */
  isUnlocked(): boolean {
    // Also check localStorage for campaign completion
    if (!this.data.unlocked) {
      try {
        const progress = JSON.parse(localStorage.getItem('dotslayer_progress') || '{}')
        if (progress.highestFloor >= UNLOCK_FLOOR) {
          this.data.unlocked = true
          this.save()
        }
      } catch (e) { /* ignore */ }
    }
    return this.data.unlocked
  }

  /**
   * Unlock endless mode (called when player beats floor 150)
   */
  unlock(): void {
    this.data.unlocked = true
    this.save()
  }

  /**
   * Start a new endless run
   */
  startRun(): void {
    this.currentEndlessFloor = 1
    this.isActive = true
    this.data.totalEndlessRuns++
    this.save()
  }

  /**
   * End the current endless run
   */
  endRun(): void {
    if (this.currentEndlessFloor > this.data.bestFloor) {
      this.data.bestFloor = this.currentEndlessFloor
    }
    this.isActive = false
    this.save()
  }

  /**
   * Advance to next endless floor
   */
  nextFloor(): number {
    this.currentEndlessFloor++
    if (this.currentEndlessFloor > this.data.bestFloor) {
      this.data.bestFloor = this.currentEndlessFloor
    }
    this.save()
    return this.currentEndlessFloor
  }

  /**
   * Record kills in endless mode
   */
  recordKills(count: number): void {
    this.data.totalEndlessKills += count
    this.save()
  }

  /**
   * Get the current endless floor number
   */
  getCurrentFloor(): number {
    return this.currentEndlessFloor
  }

  /**
   * Check if currently in an endless run
   */
  getIsActive(): boolean {
    return this.isActive
  }

  /**
   * Calculate enemy HP scaling for endless mode
   * HP = base * (floor^2.5 / 3)
   */
  getHPMultiplier(floor?: number): number {
    const f = floor || this.currentEndlessFloor
    return Math.pow(f, 2.5) / 3
  }

  /**
   * Calculate enemy damage scaling
   * Damage = base * (floor^1.8 / 2)
   */
  getDamageMultiplier(floor?: number): number {
    const f = floor || this.currentEndlessFloor
    return Math.pow(f, 1.8) / 2
  }

  /**
   * Get floor config for endless mode
   */
  getFloorConfig(): FloorConfig {
    const floor = this.currentEndlessFloor

    // Enemy count scales with floor
    const baseEnemies = 50
    const enemyCount = baseEnemies + Math.floor(floor * 8) + Math.floor(Math.pow(floor / 5, 1.5) * 10)

    // Pick diverse enemy types - more variety at higher floors
    const typeCount = Math.min(ALL_ENEMY_TYPES.length, 8 + Math.floor(floor / 5))
    const shuffled = [...ALL_ENEMY_TYPES].sort(() => Math.random() - 0.5)
    const enemyTypes = shuffled.slice(0, typeCount)

    // Difficulty multiplier based on endless scaling
    const difficultyMultiplier = this.getHPMultiplier(floor)

    // Item drop chance increases slightly
    const itemDropChance = Math.min(0.85, 0.3 + floor * 0.005)

    // Boss every 10 floors, elite every 5
    let specialModifier: FloorConfig['specialModifier'] = undefined
    if (floor % 10 === 0) specialModifier = 'boss_floor'
    else if (floor % 5 === 0) specialModifier = 'elite_floor'
    else if (Math.random() < 0.15) specialModifier = 'treasure_floor'

    return {
      floorNumber: floor,
      layout: { width: 3000, height: 2000, rooms: [], corridors: [], spawnPoints: [], exitPoint: { x: 1500, y: 1000 }, shopLocation: null, casinoLocation: null, treasureRooms: [] } as any,
      enemyCount,
      enemyTypes,
      difficultyMultiplier,
      itemDropChance,
      specialModifier
    }
  }

  /**
   * Get floor modifiers for endless (guaranteed after floor 5)
   */
  getFloorModifiers(): FloorModifier[] {
    const floor = this.currentEndlessFloor
    if (floor <= 5) return getFloorModifiers(floor)

    // 1-3 modifiers, scaling with floor
    const count = floor < 20 ? 1 : floor < 50 ? 2 : 3
    return getFloorModifiers(floor + 10000, count) // offset seed to avoid campaign collision
  }

  /**
   * Check and return any new milestones reached
   */
  checkMilestones(): EndlessMilestone[] {
    const newMilestones: EndlessMilestone[] = []
    for (const milestone of ENDLESS_MILESTONES) {
      if (this.currentEndlessFloor >= milestone.floor && !this.data.milestonesReached.includes(milestone.floor)) {
        this.data.milestonesReached.push(milestone.floor)
        newMilestones.push(milestone)
      }
    }
    if (newMilestones.length > 0) this.save()
    return newMilestones
  }

  /**
   * Get best floor reached
   */
  getBestFloor(): number {
    return this.data.bestFloor
  }

  /**
   * Get all data for display
   */
  getDisplayData(): EndlessModeData & { currentFloor: number } {
    return { ...this.data, currentFloor: this.currentEndlessFloor }
  }
}

export const endlessMode = EndlessModeManager.getInstance()
