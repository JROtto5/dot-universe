/**
 * WeaponMastery - Track kills with each weapon type for permanent bonuses
 * Persistent across runs via localStorage
 */

export interface MasteryRank {
  name: string
  killsRequired: number
  damageBonusPct: number
  fireRateBonusPct: number
  ammoBonusPct: number
  color: number
  icon: string
}

export const MASTERY_RANKS: MasteryRank[] = [
  { name: 'Novice', killsRequired: 0, damageBonusPct: 0, fireRateBonusPct: 0, ammoBonusPct: 0, color: 0x95a5a6, icon: '○' },
  { name: 'Apprentice', killsRequired: 100, damageBonusPct: 5, fireRateBonusPct: 0, ammoBonusPct: 0, color: 0x2ecc71, icon: '◐' },
  { name: 'Journeyman', killsRequired: 500, damageBonusPct: 10, fireRateBonusPct: 5, ammoBonusPct: 0, color: 0x3498db, icon: '◑' },
  { name: 'Expert', killsRequired: 2000, damageBonusPct: 15, fireRateBonusPct: 10, ammoBonusPct: 0, color: 0x9b59b6, icon: '◕' },
  { name: 'Master', killsRequired: 10000, damageBonusPct: 20, fireRateBonusPct: 15, ammoBonusPct: 10, color: 0xf39c12, icon: '●' },
  { name: 'Grandmaster', killsRequired: 50000, damageBonusPct: 30, fireRateBonusPct: 20, ammoBonusPct: 20, color: 0xff0266, icon: '★' },
]

// All tracked weapon names (must match WEAPON_TYPES names in Weapon.ts)
export const TRACKED_WEAPONS = [
  'Pistol', 'Shotgun', 'SMG', 'Rifle', 'Sniper', 'Minigun',
  'Rocket Launcher', 'Laser Rifle', 'Flamethrower', 'Rail Gun', 'Grenade Launcher'
]

export interface WeaponMasteryData {
  kills: { [weaponName: string]: number }
  totalKillsAllWeapons: number
}

export interface MasteryBonus {
  damageMult: number    // 1.0 = no bonus, 1.3 = +30%
  fireRateMult: number
  ammoMult: number
  rank: MasteryRank
  kills: number
  nextRank: MasteryRank | null
  killsToNextRank: number
}

const STORAGE_KEY = 'dotslayer_weapon_mastery'

export class WeaponMasterySystem {
  private static instance: WeaponMasterySystem
  private data: WeaponMasteryData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): WeaponMasterySystem {
    if (!WeaponMasterySystem.instance) {
      WeaponMasterySystem.instance = new WeaponMasterySystem()
    }
    return WeaponMasterySystem.instance
  }

  private load(): WeaponMasteryData {
    if (typeof localStorage === 'undefined') {
      return { kills: {}, totalKillsAllWeapons: 0 }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to load weapon mastery:', e)
    }
    return { kills: {}, totalKillsAllWeapons: 0 }
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save weapon mastery:', e)
    }
  }

  /**
   * Record a kill with a specific weapon
   */
  recordKill(weaponName: string, count: number = 1): void {
    if (!this.data.kills[weaponName]) {
      this.data.kills[weaponName] = 0
    }
    this.data.kills[weaponName] += count
    this.data.totalKillsAllWeapons += count
    this.save()
  }

  /**
   * Get the current rank for a weapon
   */
  getRank(weaponName: string): MasteryRank {
    const kills = this.data.kills[weaponName] || 0
    let currentRank = MASTERY_RANKS[0]
    for (const rank of MASTERY_RANKS) {
      if (kills >= rank.killsRequired) {
        currentRank = rank
      } else {
        break
      }
    }
    return currentRank
  }

  /**
   * Get the full mastery bonus for a weapon
   */
  getBonus(weaponName: string): MasteryBonus {
    const kills = this.data.kills[weaponName] || 0
    const rank = this.getRank(weaponName)
    const rankIndex = MASTERY_RANKS.indexOf(rank)
    const nextRank = rankIndex < MASTERY_RANKS.length - 1 ? MASTERY_RANKS[rankIndex + 1] : null

    return {
      damageMult: 1 + rank.damageBonusPct / 100,
      fireRateMult: 1 + rank.fireRateBonusPct / 100,
      ammoMult: 1 + rank.ammoBonusPct / 100,
      rank,
      kills,
      nextRank,
      killsToNextRank: nextRank ? nextRank.killsRequired - kills : 0
    }
  }

  /**
   * Get kills for a specific weapon
   */
  getKills(weaponName: string): number {
    return this.data.kills[weaponName] || 0
  }

  /**
   * Get all mastery data for display
   */
  getAllMasteryData(): Array<{ weaponName: string; bonus: MasteryBonus }> {
    return TRACKED_WEAPONS.map(name => ({
      weaponName: name,
      bonus: this.getBonus(name)
    }))
  }

  /**
   * Get total kills across all weapons
   */
  getTotalKills(): number {
    return this.data.totalKillsAllWeapons
  }

  /**
   * Get count of weapons at a specific rank or above
   */
  getWeaponsAtRank(rankName: string): number {
    const targetIndex = MASTERY_RANKS.findIndex(r => r.name === rankName)
    if (targetIndex < 0) return 0

    return TRACKED_WEAPONS.filter(name => {
      const rank = this.getRank(name)
      return MASTERY_RANKS.indexOf(rank) >= targetIndex
    }).length
  }
}

export const weaponMastery = WeaponMasterySystem.getInstance()
