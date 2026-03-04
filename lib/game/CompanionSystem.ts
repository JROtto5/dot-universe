/**
 * CompanionSystem - Pet/companion system for DotSlayer
 * Each companion is unlocked by defeating a boss on a specific floor,
 * levels up via XP, and provides passive bonuses + active abilities.
 * Persistent across runs via localStorage.
 */

export type CompanionType = 'attack_drone' | 'shield_bot' | 'heal_sprite' | 'speed_ghost' | 'loot_magnet' | 'boss_hunter'

export interface CompanionAbility {
  name: string
  description: string
  unlockLevel: number  // 5, 15, or 30
  cooldownMs: number
  duration?: number  // ms, for timed abilities
}

export interface CompanionDefinition {
  type: CompanionType
  name: string
  description: string
  color: number      // Phaser visual color
  icon: string
  passiveBonus: string  // description of passive
  unlockBossFloor: number  // floor of boss that drops it
  abilities: CompanionAbility[]
  // Scaling per level
  baseValue: number    // the primary stat value at level 0
  valuePerLevel: number // how much primary stat improves per level
}

export const COMPANION_DEFINITIONS: Record<CompanionType, CompanionDefinition> = {
  attack_drone: {
    type: 'attack_drone', name: 'Attack Drone', description: 'Fires at nearest enemy',
    color: 0xff4444, icon: '🔫',
    passiveBonus: 'Fires at enemies every 800ms',
    unlockBossFloor: 10,
    baseValue: 10, valuePerLevel: 0.5, // damage
    abilities: [
      { name: 'Rapid Fire', description: '2x fire rate for 5s', unlockLevel: 5, cooldownMs: 30000, duration: 5000 },
      { name: 'Missile Barrage', description: 'AoE damage burst', unlockLevel: 15, cooldownMs: 45000 },
      { name: 'Overclock', description: 'Permanent +50% fire rate', unlockLevel: 30, cooldownMs: 0 },
    ]
  },
  shield_bot: {
    type: 'shield_bot', name: 'Shield Bot', description: 'Blocks hits periodically',
    color: 0x4444ff, icon: '🛡️',
    passiveBonus: 'Blocks 1 hit every 10s',
    unlockBossFloor: 20,
    baseValue: 10000, valuePerLevel: -200, // cooldown ms (decreases)
    abilities: [
      { name: 'Reflect', description: 'Blocked hit damages attacker', unlockLevel: 5, cooldownMs: 0 },
      { name: 'Shield Pulse', description: 'AoE knockback', unlockLevel: 15, cooldownMs: 25000 },
      { name: 'Fortress', description: 'Block 3 hits instead of 1', unlockLevel: 30, cooldownMs: 0 },
    ]
  },
  heal_sprite: {
    type: 'heal_sprite', name: 'Heal Sprite', description: 'Heals player over time',
    color: 0x44ff44, icon: '💚',
    passiveBonus: 'Heals 2 HP/s',
    unlockBossFloor: 30,
    baseValue: 2, valuePerLevel: 0.1, // HP per second
    abilities: [
      { name: 'Burst Heal', description: 'Instant +30 HP', unlockLevel: 5, cooldownMs: 20000 },
      { name: 'Cleanse', description: 'Remove all debuffs', unlockLevel: 15, cooldownMs: 30000 },
      { name: 'Resurrection', description: 'Auto-revive once per floor', unlockLevel: 30, cooldownMs: 0 },
    ]
  },
  speed_ghost: {
    type: 'speed_ghost', name: 'Speed Ghost', description: 'Increases movement speed',
    color: 0xccccff, icon: '👻',
    passiveBonus: '+15% movement speed',
    unlockBossFloor: 40,
    baseValue: 15, valuePerLevel: 0.3, // speed percent
    abilities: [
      { name: 'Dash Boost', description: 'Double dash distance', unlockLevel: 5, cooldownMs: 0 },
      { name: 'Phase Walk', description: 'Pass through enemies 3s', unlockLevel: 15, cooldownMs: 25000, duration: 3000 },
      { name: 'Time Warp', description: '+25% fire rate', unlockLevel: 30, cooldownMs: 0 },
    ]
  },
  loot_magnet: {
    type: 'loot_magnet', name: 'Loot Magnet', description: 'Auto-collects nearby drops',
    color: 0xffcc00, icon: '🧲',
    passiveBonus: 'Auto-collect in 200px radius',
    unlockBossFloor: 50,
    baseValue: 200, valuePerLevel: 5, // collection radius
    abilities: [
      { name: 'Lucky Find', description: '+10% rare drop chance', unlockLevel: 5, cooldownMs: 0 },
      { name: 'Double Pickup', description: '25% chance double items', unlockLevel: 15, cooldownMs: 0 },
      { name: 'Treasure Sense', description: 'Reveal hidden items on floor', unlockLevel: 30, cooldownMs: 60000 },
    ]
  },
  boss_hunter: {
    type: 'boss_hunter', name: 'Boss Hunter', description: 'Extra damage to bosses',
    color: 0xff0000, icon: '🎯',
    passiveBonus: '+20% damage to bosses',
    unlockBossFloor: 60,
    baseValue: 20, valuePerLevel: 0.5, // boss damage percent
    abilities: [
      { name: 'Weak Spot', description: '+10% crit vs bosses', unlockLevel: 5, cooldownMs: 0 },
      { name: 'Expose', description: 'Boss takes +25% damage 5s', unlockLevel: 15, cooldownMs: 40000, duration: 5000 },
      { name: 'Execute', description: 'Instant kill boss below 5% HP', unlockLevel: 30, cooldownMs: 0 },
    ]
  },
}

// XP thresholds per level (level 0 to 30)
// Each level requires more XP: level * 50 + 50
// So level 1 needs 100 XP, level 2 needs 150, etc.
const MAX_LEVEL = 30

function xpForLevel(level: number): number {
  return level * 50 + 50
}

interface CompanionData {
  activeCompanion: CompanionType | null
  levels: Record<string, number>     // companion type -> level (0-30)
  xp: Record<string, number>         // companion type -> current XP
  unlocked: string[]                 // companion types unlocked
  abilityCooldowns: Record<string, number> // ability name -> last used timestamp
  totalCompanionKills: number
}

const STORAGE_KEY = 'dotslayer_companions'

function defaultData(): CompanionData {
  return {
    activeCompanion: null,
    levels: {},
    xp: {},
    unlocked: [],
    abilityCooldowns: {},
    totalCompanionKills: 0,
  }
}

export class CompanionSystem {
  private static instance: CompanionSystem
  private data: CompanionData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): CompanionSystem {
    if (!CompanionSystem.instance) {
      CompanionSystem.instance = new CompanionSystem()
    }
    return CompanionSystem.instance
  }

  // ── Persistence ──────────────────────────────────────────────

  private load(): CompanionData {
    if (typeof localStorage === 'undefined') {
      return defaultData()
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to load companion data:', e)
    }
    return defaultData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save companion data:', e)
    }
  }

  // ── Unlock ───────────────────────────────────────────────────

  unlockCompanion(type: CompanionType): boolean {
    if (this.data.unlocked.includes(type)) return false
    this.data.unlocked.push(type)
    this.data.levels[type] = 0
    this.data.xp[type] = 0
    this.save()
    return true
  }

  isUnlocked(type: CompanionType): boolean {
    return this.data.unlocked.includes(type)
  }

  getUnlockedCompanions(): CompanionType[] {
    return this.data.unlocked as CompanionType[]
  }

  // ── Equip ────────────────────────────────────────────────────

  equipCompanion(type: CompanionType): boolean {
    if (!this.isUnlocked(type)) return false
    this.data.activeCompanion = type
    this.save()
    return true
  }

  unequipCompanion(): void {
    this.data.activeCompanion = null
    this.save()
  }

  getActiveCompanion(): CompanionType | null {
    return this.data.activeCompanion
  }

  getActiveCompanionDef(): CompanionDefinition | null {
    if (!this.data.activeCompanion) return null
    return COMPANION_DEFINITIONS[this.data.activeCompanion] ?? null
  }

  getActiveCompanionLevel(): number {
    if (!this.data.activeCompanion) return 0
    return this.data.levels[this.data.activeCompanion] || 0
  }

  // ── Leveling ─────────────────────────────────────────────────

  addXP(amount: number): { leveled: boolean; newLevel: number; companion: CompanionType } | null {
    const type = this.data.activeCompanion
    if (!type) return null

    const currentLevel = this.data.levels[type] || 0
    if (currentLevel >= MAX_LEVEL) return null

    this.data.xp[type] = (this.data.xp[type] || 0) + amount

    const needed = xpForLevel(currentLevel + 1)
    let leveled = false
    let newLevel = currentLevel

    if (this.data.xp[type] >= needed) {
      this.data.xp[type] -= needed
      newLevel = currentLevel + 1
      this.data.levels[type] = newLevel
      leveled = true

      // Cap XP at 0 if we hit max level
      if (newLevel >= MAX_LEVEL) {
        this.data.xp[type] = 0
      }
    }

    this.save()
    return { leveled, newLevel, companion: type }
  }

  getLevel(type: CompanionType): number {
    return this.data.levels[type] || 0
  }

  getXP(type: CompanionType): number {
    return this.data.xp[type] || 0
  }

  getXPForNextLevel(type: CompanionType): number {
    const level = this.getLevel(type)
    if (level >= MAX_LEVEL) return 0
    return xpForLevel(level + 1)
  }

  getXPProgress(type: CompanionType): number {
    const level = this.getLevel(type)
    if (level >= MAX_LEVEL) return 1
    const needed = xpForLevel(level + 1)
    if (needed <= 0) return 1
    return Math.min((this.data.xp[type] || 0) / needed, 1)
  }

  // ── Effective Stat Value ─────────────────────────────────────

  getEffectiveValue(type: CompanionType): number {
    const def = COMPANION_DEFINITIONS[type]
    if (!def) return 0
    const level = this.getLevel(type)
    return def.baseValue + def.valuePerLevel * level
  }

  // ── Abilities ────────────────────────────────────────────────

  getActiveAbilities(type: CompanionType): CompanionAbility[] {
    const def = COMPANION_DEFINITIONS[type]
    if (!def) return []
    const level = this.getLevel(type)
    return def.abilities.filter(a => level >= a.unlockLevel)
  }

  canUseAbility(type: CompanionType, abilityIndex: number): boolean {
    const def = COMPANION_DEFINITIONS[type]
    if (!def || abilityIndex < 0 || abilityIndex >= def.abilities.length) return false

    const ability = def.abilities[abilityIndex]
    const level = this.getLevel(type)
    if (level < ability.unlockLevel) return false

    // Passive abilities (cooldown 0) are always "available"
    if (ability.cooldownMs <= 0) return true

    const lastUsed = this.data.abilityCooldowns[ability.name] || 0
    return Date.now() - lastUsed >= ability.cooldownMs
  }

  useAbility(type: CompanionType, abilityIndex: number): CompanionAbility | null {
    if (!this.canUseAbility(type, abilityIndex)) return null

    const def = COMPANION_DEFINITIONS[type]
    const ability = def.abilities[abilityIndex]

    if (ability.cooldownMs > 0) {
      this.data.abilityCooldowns[ability.name] = Date.now()
      this.save()
    }

    return ability
  }

  getAbilityCooldownRemaining(type: CompanionType, abilityIndex: number): number {
    const def = COMPANION_DEFINITIONS[type]
    if (!def || abilityIndex < 0 || abilityIndex >= def.abilities.length) return 0

    const ability = def.abilities[abilityIndex]
    if (ability.cooldownMs <= 0) return 0

    const lastUsed = this.data.abilityCooldowns[ability.name] || 0
    const elapsed = Date.now() - lastUsed
    return Math.max(0, ability.cooldownMs - elapsed)
  }

  // ── Passive Bonuses (aggregated for active companion) ───────

  getPassiveBonuses(): {
    speedPercent: number
    bossDamagePercent: number
    collectRadius: number
    healPerSec: number
    blockCooldownMs: number
    droneDamage: number
  } {
    const result = {
      speedPercent: 0,
      bossDamagePercent: 0,
      collectRadius: 0,
      healPerSec: 0,
      blockCooldownMs: 0,
      droneDamage: 0,
    }

    const type = this.data.activeCompanion
    if (!type) return result

    const value = this.getEffectiveValue(type)

    switch (type) {
      case 'attack_drone':
        result.droneDamage = value
        break
      case 'shield_bot':
        result.blockCooldownMs = value
        break
      case 'heal_sprite':
        result.healPerSec = value
        break
      case 'speed_ghost':
        result.speedPercent = value
        break
      case 'loot_magnet':
        result.collectRadius = value
        break
      case 'boss_hunter':
        result.bossDamagePercent = value
        break
    }

    return result
  }

  // ── Boss Drop Check ──────────────────────────────────────────

  shouldDropCompanion(bossFloor: number): CompanionType | null {
    const allTypes = Object.keys(COMPANION_DEFINITIONS) as CompanionType[]
    for (const type of allTypes) {
      const def = COMPANION_DEFINITIONS[type]
      if (def.unlockBossFloor === bossFloor && !this.isUnlocked(type)) {
        return type
      }
    }
    return null
  }
}

export const companionSystem = CompanionSystem.getInstance()
