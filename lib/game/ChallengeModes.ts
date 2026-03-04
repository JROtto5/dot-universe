/**
 * ChallengeModes - Four specialized game modes
 * Boss Rush, Survival, Speed Run, Hardcore
 */

const STORAGE_KEY = 'dotslayer_challenge_modes'

export type ChallengeMode = 'boss_rush' | 'survival' | 'speed_run' | 'hardcore'

export interface ChallengeModeConfig {
  id: ChallengeMode
  name: string
  description: string
  icon: string
  color: number
  unlockCondition: string
  unlockFloor: number     // Floor required to unlock
  unlockBosses?: number   // Bosses required (for boss rush)
  // Gameplay modifiers
  settings: {
    hasFloors: boolean
    floorCount?: number       // For speed_run
    timeLimit?: number        // ms, for speed_run
    playerHP?: number         // Override HP (1 for hardcore)
    playerHPMult?: number     // HP multiplier
    healingAllowed: boolean
    healBetweenWaves?: number // % heal between waves
    goldMult: number
    xpMult: number
    enemySpawnContinuous?: boolean  // For survival
    bossesOnly?: boolean     // For boss rush
  }
}

export interface ChallengeRecord {
  mode: ChallengeMode
  score: number          // Primary score (time for speed run, kills for survival, etc.)
  secondaryScore: number // Secondary metric
  completedAt: number    // Timestamp
  details: string        // e.g. "15:32 remaining" or "142 kills"
}

export interface ChallengeModeData {
  unlocked: ChallengeMode[]
  records: { [mode in ChallengeMode]?: ChallengeRecord }
  totalAttempts: { [mode in ChallengeMode]?: number }
}

export const CHALLENGE_MODES: ChallengeModeConfig[] = [
  {
    id: 'boss_rush',
    name: 'BOSS RUSH',
    description: 'Fight all 15 bosses back-to-back! Brief rest between bosses. 25% heal between fights.',
    icon: '👹',
    color: 0xe74c3c,
    unlockCondition: 'Defeat any 5 bosses',
    unlockFloor: 0,
    unlockBosses: 5,
    settings: {
      hasFloors: false,
      healingAllowed: true,
      healBetweenWaves: 25,
      goldMult: 3,
      xpMult: 3,
      bossesOnly: true
    }
  },
  {
    id: 'survival',
    name: 'SURVIVAL',
    description: 'Infinite waves of enemies with increasing density. How long can you last?',
    icon: '💀',
    color: 0x9b59b6,
    unlockCondition: 'Reach Floor 50',
    unlockFloor: 50,
    settings: {
      hasFloors: false,
      healingAllowed: true,
      goldMult: 2,
      xpMult: 2,
      enemySpawnContinuous: true
    }
  },
  {
    id: 'speed_run',
    name: 'SPEED RUN',
    description: 'Race through 50 floors against a 30-minute timer! Bonus rewards for time remaining.',
    icon: '⏱️',
    color: 0xf39c12,
    unlockCondition: 'Complete Floor 50',
    unlockFloor: 50,
    settings: {
      hasFloors: true,
      floorCount: 50,
      timeLimit: 30 * 60 * 1000, // 30 minutes
      healingAllowed: true,
      goldMult: 2,
      xpMult: 2
    }
  },
  {
    id: 'hardcore',
    name: 'HARDCORE',
    description: '1 HP. One hit, you\'re dead. 10x gold and XP! Only the bravest survive.',
    icon: '☠️',
    color: 0x2c3e50,
    unlockCondition: 'Reach Floor 75',
    unlockFloor: 75,
    settings: {
      hasFloors: true,
      playerHP: 1,
      healingAllowed: false,
      goldMult: 10,
      xpMult: 10
    }
  }
]

export class ChallengeModeManager {
  private static instance: ChallengeModeManager
  private data: ChallengeModeData
  private activeMode: ChallengeMode | null = null
  private modeStartTime = 0
  private modeKills = 0
  private modeBossesDefeated = 0

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): ChallengeModeManager {
    if (!ChallengeModeManager.instance) {
      ChallengeModeManager.instance = new ChallengeModeManager()
    }
    return ChallengeModeManager.instance
  }

  private load(): ChallengeModeData {
    if (typeof localStorage === 'undefined') {
      return { unlocked: [], records: {}, totalAttempts: {} }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to load challenge mode data:', e)
    }
    return { unlocked: [], records: {}, totalAttempts: {} }
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save challenge mode data:', e)
    }
  }

  /**
   * Check what modes are unlocked based on player progress
   */
  checkUnlocks(highestFloor: number, bossesKilled: number): void {
    for (const mode of CHALLENGE_MODES) {
      if (this.data.unlocked.includes(mode.id)) continue

      let unlocked = false
      if (mode.id === 'boss_rush') {
        unlocked = bossesKilled >= (mode.unlockBosses || 5)
      } else {
        unlocked = highestFloor >= mode.unlockFloor
      }

      if (unlocked) {
        this.data.unlocked.push(mode.id)
      }
    }
    this.save()
  }

  /**
   * Check if a specific mode is unlocked
   */
  isModeUnlocked(mode: ChallengeMode): boolean {
    return this.data.unlocked.includes(mode)
  }

  /**
   * Get all modes with their unlock status
   */
  getAllModes(): Array<ChallengeModeConfig & { unlocked: boolean; record?: ChallengeRecord }> {
    return CHALLENGE_MODES.map(mode => ({
      ...mode,
      unlocked: this.data.unlocked.includes(mode.id),
      record: this.data.records[mode.id]
    }))
  }

  /**
   * Start a challenge mode run
   */
  startChallenge(mode: ChallengeMode): ChallengeModeConfig | null {
    if (!this.data.unlocked.includes(mode)) return null

    this.activeMode = mode
    this.modeStartTime = Date.now()
    this.modeKills = 0
    this.modeBossesDefeated = 0
    this.data.totalAttempts[mode] = (this.data.totalAttempts[mode] || 0) + 1
    this.save()

    return CHALLENGE_MODES.find(m => m.id === mode) || null
  }

  /**
   * Record kills during challenge
   */
  recordKill(isBoss: boolean = false): void {
    this.modeKills++
    if (isBoss) this.modeBossesDefeated++
  }

  /**
   * End the challenge and record results
   */
  endChallenge(completed: boolean, additionalScore?: number): ChallengeRecord | null {
    if (!this.activeMode) return null

    const elapsed = Date.now() - this.modeStartTime
    let score = 0
    let secondaryScore = 0
    let details = ''

    switch (this.activeMode) {
      case 'boss_rush':
        score = completed ? elapsed : 0 // Lower time = better (only if completed)
        secondaryScore = this.modeBossesDefeated
        details = completed ? `Completed in ${formatTime(elapsed)}` : `${this.modeBossesDefeated}/15 bosses`
        break

      case 'survival':
        score = elapsed // Higher time = better
        secondaryScore = this.modeKills
        details = `Survived ${formatTime(elapsed)} — ${this.modeKills} kills`
        break

      case 'speed_run':
        const config = CHALLENGE_MODES.find(m => m.id === 'speed_run')!
        const timeRemaining = Math.max(0, (config.settings.timeLimit || 0) - elapsed)
        score = completed ? timeRemaining : 0 // More remaining = better
        secondaryScore = additionalScore || 0 // Floors completed
        details = completed ? `${formatTime(timeRemaining)} remaining` : `${additionalScore || 0}/50 floors`
        break

      case 'hardcore':
        score = additionalScore || 0 // Floors completed
        secondaryScore = this.modeKills
        details = `Floor ${additionalScore || 0} — ${this.modeKills} kills`
        break
    }

    const record: ChallengeRecord = {
      mode: this.activeMode,
      score,
      secondaryScore,
      completedAt: Date.now(),
      details
    }

    // Only save if it's a new best
    const existing = this.data.records[this.activeMode]
    if (!existing || score > existing.score) {
      this.data.records[this.activeMode] = record
    }

    this.activeMode = null
    this.save()
    return record
  }

  /**
   * Get the active challenge mode
   */
  getActiveMode(): ChallengeMode | null {
    return this.activeMode
  }

  /**
   * Get the config for active mode
   */
  getActiveModeConfig(): ChallengeModeConfig | null {
    if (!this.activeMode) return null
    return CHALLENGE_MODES.find(m => m.id === this.activeMode) || null
  }

  /**
   * Get elapsed time in current challenge
   */
  getElapsedTime(): number {
    return this.activeMode ? Date.now() - this.modeStartTime : 0
  }

  /**
   * Get record for a specific mode
   */
  getRecord(mode: ChallengeMode): ChallengeRecord | undefined {
    return this.data.records[mode]
  }

  /**
   * Get all records
   */
  getAllRecords(): { [mode in ChallengeMode]?: ChallengeRecord } {
    return this.data.records
  }

  /**
   * Get kills in current challenge
   */
  getCurrentKills(): number {
    return this.modeKills
  }

  /**
   * Get bosses defeated in current challenge
   */
  getCurrentBossesDefeated(): number {
    return this.modeBossesDefeated
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const challengeModes = ChallengeModeManager.getInstance()
