/**
 * PrestigeSystem - Prestige, Ascension Points, Talent Tree, and NG+ for DotSlayer
 * Persistent across runs via localStorage
 */

export interface TalentDefinition {
  id: string
  name: string
  description: string
  branch: 'combat' | 'survival' | 'fortune'
  costs: number[]
  maxRank: number
  bonusPerRank: number
  bonusStat: string
  requires?: string
}

export const TALENT_DEFINITIONS: TalentDefinition[] = [
  // COMBAT branch
  { id: 'combat_damage_1', name: 'Starting Damage I', description: '+10% damage', branch: 'combat', costs: [3], maxRank: 1, bonusPerRank: 10, bonusStat: 'damagePercent' },
  { id: 'combat_damage_2', name: 'Starting Damage II', description: '+20% damage', branch: 'combat', costs: [5], maxRank: 1, bonusPerRank: 20, bonusStat: 'damagePercent', requires: 'combat_damage_1' },
  { id: 'combat_crit', name: 'Critical Edge', description: '+5% crit per rank', branch: 'combat', costs: [4, 8], maxRank: 2, bonusPerRank: 5, bonusStat: 'critPercent' },
  { id: 'combat_cdr', name: 'Ability Mastery', description: '-10% ability CDR per rank', branch: 'combat', costs: [5, 10], maxRank: 2, bonusPerRank: 10, bonusStat: 'cdrPercent' },

  // SURVIVAL branch
  { id: 'survival_hp_1', name: 'Fortitude I', description: '+20% HP', branch: 'survival', costs: [3], maxRank: 1, bonusPerRank: 20, bonusStat: 'hpPercent' },
  { id: 'survival_hp_2', name: 'Fortitude II', description: '+40% HP', branch: 'survival', costs: [5], maxRank: 1, bonusPerRank: 40, bonusStat: 'hpPercent', requires: 'survival_hp_1' },
  { id: 'survival_regen', name: 'Regeneration', description: '+1 HP/s per rank', branch: 'survival', costs: [4, 8], maxRank: 2, bonusPerRank: 1, bonusStat: 'regenPerSec' },
  { id: 'survival_extra_life', name: 'Second Wind', description: 'Revive once per run', branch: 'survival', costs: [15], maxRank: 1, bonusPerRank: 1, bonusStat: 'hasExtraLife' },

  // FORTUNE branch
  { id: 'fortune_money_1', name: 'Head Start I', description: '+100 starting money', branch: 'fortune', costs: [2], maxRank: 1, bonusPerRank: 100, bonusStat: 'startingMoney' },
  { id: 'fortune_money_2', name: 'Head Start II', description: '+300 starting money', branch: 'fortune', costs: [4], maxRank: 1, bonusPerRank: 300, bonusStat: 'startingMoney', requires: 'fortune_money_1' },
  { id: 'fortune_shop', name: 'Haggler', description: '10% shop discount per rank', branch: 'fortune', costs: [3, 7], maxRank: 2, bonusPerRank: 10, bonusStat: 'shopDiscount' },
  { id: 'fortune_luck', name: 'Lucky Star', description: '+15% item rarity per rank', branch: 'fortune', costs: [5, 10], maxRank: 2, bonusPerRank: 15, bonusStat: 'itemRarityPercent' },
]

export interface PrestigeStats {
  totalPrestiges: number
  highestFloorEver: number
  fastestClearMs: number
  totalAPEarned: number
}

export interface NGPlusModifiers {
  enemyHpMult: number
  enemyDmgMult: number
  lootQualityMult: number
  extraMiniBosses: boolean
  hazardsDoubled: boolean
  bossExtraPhase: boolean
  allModifiersActive: boolean
}

interface PrestigeData {
  prestigeLevel: number
  ascensionPoints: number
  spentAP: number
  ngPlusTier: number
  unlockedTalents: string[]
  prestigeStats: PrestigeStats
}

const STORAGE_KEY = 'dotslayer_prestige'

export class PrestigeSystem {
  private static instance: PrestigeSystem
  private data: PrestigeData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): PrestigeSystem {
    if (!PrestigeSystem.instance) {
      PrestigeSystem.instance = new PrestigeSystem()
    }
    return PrestigeSystem.instance
  }

  private load(): PrestigeData {
    if (typeof localStorage === 'undefined') {
      return this.defaultData()
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to load prestige data:', e)
    }
    return this.defaultData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save prestige data:', e)
    }
  }

  private defaultData(): PrestigeData {
    return {
      prestigeLevel: 0,
      ascensionPoints: 0,
      spentAP: 0,
      ngPlusTier: 0,
      unlockedTalents: [],
      prestigeStats: {
        totalPrestiges: 0,
        highestFloorEver: 0,
        fastestClearMs: 0,
        totalAPEarned: 0,
      },
    }
  }

  // ─── Prestige ───────────────────────────────────────────────

  /**
   * Whether the player has reached high enough floor to prestige
   */
  canPrestige(currentFloor: number): boolean {
    return currentFloor >= 50
  }

  /**
   * Calculate how many AP a run would award
   */
  getAPForRun(highestFloor: number, bossesKilled: number): number {
    if (highestFloor < 41) return 0
    return Math.floor((highestFloor - 40) * 1.5) + (bossesKilled * 2)
  }

  /**
   * Execute a prestige reset. Returns the AP earned and new prestige level.
   */
  prestige(
    highestFloor: number,
    bossesKilled: number,
    clearTimeMs: number,
  ): { apEarned: number; newLevel: number } {
    const apEarned = this.getAPForRun(highestFloor, bossesKilled)

    this.data.prestigeLevel += 1
    this.data.ascensionPoints += apEarned

    // Update stats
    this.data.prestigeStats.totalPrestiges += 1
    this.data.prestigeStats.totalAPEarned += apEarned

    if (highestFloor > this.data.prestigeStats.highestFloorEver) {
      this.data.prestigeStats.highestFloorEver = highestFloor
    }

    if (
      this.data.prestigeStats.fastestClearMs === 0 ||
      clearTimeMs < this.data.prestigeStats.fastestClearMs
    ) {
      this.data.prestigeStats.fastestClearMs = clearTimeMs
    }

    this.save()

    return { apEarned, newLevel: this.data.prestigeLevel }
  }

  // ─── Ascension Points ───────────────────────────────────────

  /**
   * AP available to spend on talents
   */
  getAvailableAP(): number {
    return this.data.ascensionPoints - this.data.spentAP
  }

  // ─── Talent Tree ────────────────────────────────────────────

  /**
   * How many ranks the player has in a talent (0 if not unlocked)
   */
  getTalentRank(id: string): number {
    return this.data.unlockedTalents.filter(t => t === id).length
  }

  /**
   * Check whether a talent can be unlocked right now, with reason if not
   */
  canUnlockTalent(id: string): { canUnlock: boolean; reason?: string } {
    const def = TALENT_DEFINITIONS.find(t => t.id === id)
    if (!def) {
      return { canUnlock: false, reason: 'Unknown talent' }
    }

    const currentRank = this.getTalentRank(id)
    if (currentRank >= def.maxRank) {
      return { canUnlock: false, reason: 'Already at max rank' }
    }

    // Check prerequisite
    if (def.requires) {
      const prereqDef = TALENT_DEFINITIONS.find(t => t.id === def.requires)
      if (prereqDef) {
        const prereqRank = this.getTalentRank(def.requires)
        if (prereqRank < prereqDef.maxRank) {
          return { canUnlock: false, reason: `Requires ${prereqDef.name}` }
        }
      }
    }

    // Check cost
    const cost = def.costs[currentRank]
    if (this.getAvailableAP() < cost) {
      return { canUnlock: false, reason: `Need ${cost} AP (have ${this.getAvailableAP()})` }
    }

    return { canUnlock: true }
  }

  /**
   * Attempt to unlock (or rank up) a talent. Returns true on success.
   */
  unlockTalent(id: string): boolean {
    const { canUnlock } = this.canUnlockTalent(id)
    if (!canUnlock) return false

    const def = TALENT_DEFINITIONS.find(t => t.id === id)!
    const currentRank = this.getTalentRank(id)
    const cost = def.costs[currentRank]

    this.data.spentAP += cost
    this.data.unlockedTalents.push(id)
    this.save()

    return true
  }

  /**
   * Get the aggregated bonus value for a given stat across all unlocked talents
   */
  getTalentBonus(stat: string): number {
    let total = 0

    for (const def of TALENT_DEFINITIONS) {
      if (def.bonusStat !== stat) continue
      const rank = this.getTalentRank(def.id)
      if (rank > 0) {
        total += def.bonusPerRank * rank
      }
    }

    return total
  }

  /**
   * Refund all spent AP and clear unlocked talents
   */
  resetTalents(): void {
    this.data.spentAP = 0
    this.data.unlockedTalents = []
    this.save()
  }

  // ─── NG+ ───────────────────────────────────────────────────

  /**
   * Get the current NG+ modifier set based on tier
   */
  getNGPlusModifiers(): NGPlusModifiers {
    const tier = this.data.ngPlusTier

    switch (tier) {
      case 1:
        return {
          enemyHpMult: 1.25,
          enemyDmgMult: 1.25,
          lootQualityMult: 1.15,
          extraMiniBosses: false,
          hazardsDoubled: false,
          bossExtraPhase: false,
          allModifiersActive: false,
        }
      case 2:
        return {
          enemyHpMult: 1.5,
          enemyDmgMult: 1.5,
          lootQualityMult: 1.3,
          extraMiniBosses: true,
          hazardsDoubled: false,
          bossExtraPhase: false,
          allModifiersActive: false,
        }
      case 3:
        return {
          enemyHpMult: 2,
          enemyDmgMult: 2,
          lootQualityMult: 1.5,
          extraMiniBosses: true,
          hazardsDoubled: true,
          bossExtraPhase: false,
          allModifiersActive: false,
        }
      case 4:
        return {
          enemyHpMult: 3,
          enemyDmgMult: 3,
          lootQualityMult: 1.75,
          extraMiniBosses: true,
          hazardsDoubled: true,
          bossExtraPhase: true,
          allModifiersActive: false,
        }
      case 5:
        return {
          enemyHpMult: 5,
          enemyDmgMult: 5,
          lootQualityMult: 2,
          extraMiniBosses: true,
          hazardsDoubled: true,
          bossExtraPhase: true,
          allModifiersActive: true,
        }
      default:
        return {
          enemyHpMult: 1,
          enemyDmgMult: 1,
          lootQualityMult: 1,
          extraMiniBosses: false,
          hazardsDoubled: false,
          bossExtraPhase: false,
          allModifiersActive: false,
        }
    }
  }

  /**
   * Set the NG+ tier (clamped 0-5)
   */
  setNGPlusTier(tier: number): void {
    this.data.ngPlusTier = Math.max(0, Math.min(5, Math.floor(tier)))
    this.save()
  }

  // ─── Accessors ──────────────────────────────────────────────

  getPrestigeLevel(): number {
    return this.data.prestigeLevel
  }

  getNGPlusTier(): number {
    return this.data.ngPlusTier
  }

  getPrestigeStats(): PrestigeStats {
    return { ...this.data.prestigeStats }
  }

  getUnlockedTalents(): string[] {
    return [...this.data.unlockedTalents]
  }
}

export const prestigeSystem = PrestigeSystem.getInstance()
