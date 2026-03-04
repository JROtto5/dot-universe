/**
 * FloorModifiers - Random modifiers that alter gameplay each floor
 * Adds variety and challenge with 17 modifiers across 4 categories
 */

export enum ModifierCategory {
  ENEMY = 'enemy',
  PLAYER = 'player',
  ENVIRONMENT = 'environment',
  REWARD = 'reward'
}

export interface FloorModifier {
  id: string
  name: string
  description: string
  category: ModifierCategory
  icon: string
  color: number
  // Multipliers applied to gameplay
  effects: {
    enemyCountMult?: number
    enemyHPMult?: number
    enemyDamageMult?: number
    enemySpeedMult?: number
    enemyRegenPercent?: number   // % HP/sec regen
    enemyShieldHP?: number       // flat shield absorb
    playerDamageMult?: number
    playerHPMult?: number
    playerSpeedMult?: number
    playerFireRateMult?: number
    playerAmmoMult?: number
    playerLifesteal?: number     // % lifesteal
    noHealthPickups?: boolean
    visibilityRadius?: number    // px, 0 = unlimited
    reverseAxis?: 'x' | 'y'
    explosionInterval?: number   // ms between random explosions
    explosionDamage?: number
    enemiesGlow?: boolean
    goldMult?: number
    xpMult?: number
    itemDropMult?: number
    noDrops?: boolean
    goldOnClear?: number         // multiplier for floor clear gold
  }
}

export const FLOOR_MODIFIERS: FloorModifier[] = [
  // ═══════════════════════════════════════
  // ENEMY MODIFIERS
  // ═══════════════════════════════════════
  {
    id: 'swarm',
    name: 'SWARM',
    description: '2x enemy count, 0.5x HP each',
    category: ModifierCategory.ENEMY,
    icon: '🐝',
    color: 0xf39c12,
    effects: { enemyCountMult: 2, enemyHPMult: 0.5 }
  },
  {
    id: 'armored',
    name: 'ARMORED',
    description: 'Enemies have 2x HP',
    category: ModifierCategory.ENEMY,
    icon: '🛡️',
    color: 0x95a5a6,
    effects: { enemyHPMult: 2 }
  },
  {
    id: 'berserker',
    name: 'BERSERKER',
    description: 'Enemies deal 1.5x damage, 1.3x speed',
    category: ModifierCategory.ENEMY,
    icon: '💢',
    color: 0xe74c3c,
    effects: { enemyDamageMult: 1.5, enemySpeedMult: 1.3 }
  },
  {
    id: 'regenerating',
    name: 'REGENERATING',
    description: 'Enemies regen 1% HP/sec',
    category: ModifierCategory.ENEMY,
    icon: '💚',
    color: 0x2ecc71,
    effects: { enemyRegenPercent: 1 }
  },
  {
    id: 'shielded',
    name: 'SHIELDED',
    description: 'Enemies have shields absorbing first 50 damage',
    category: ModifierCategory.ENEMY,
    icon: '🔰',
    color: 0x3498db,
    effects: { enemyShieldHP: 50 }
  },

  // ═══════════════════════════════════════
  // PLAYER MODIFIERS
  // ═══════════════════════════════════════
  {
    id: 'glass_cannon',
    name: 'GLASS CANNON',
    description: '2x damage, 0.5x HP',
    category: ModifierCategory.PLAYER,
    icon: '💎',
    color: 0xff0266,
    effects: { playerDamageMult: 2, playerHPMult: 0.5 }
  },
  {
    id: 'juggernaut',
    name: 'JUGGERNAUT',
    description: '1.5x HP, 0.7x speed',
    category: ModifierCategory.PLAYER,
    icon: '🏋️',
    color: 0x27ae60,
    effects: { playerHPMult: 1.5, playerSpeedMult: 0.7 }
  },
  {
    id: 'vampiric',
    name: 'VAMPIRIC',
    description: '5% lifesteal, no health pickups',
    category: ModifierCategory.PLAYER,
    icon: '🧛',
    color: 0x8e44ad,
    effects: { playerLifesteal: 0.05, noHealthPickups: true }
  },
  {
    id: 'overcharged',
    name: 'OVERCHARGED',
    description: '2x fire rate, 0.5x ammo',
    category: ModifierCategory.PLAYER,
    icon: '⚡',
    color: 0xf9ca24,
    effects: { playerFireRateMult: 2, playerAmmoMult: 0.5 }
  },

  // ═══════════════════════════════════════
  // ENVIRONMENT MODIFIERS
  // ═══════════════════════════════════════
  {
    id: 'fog_of_war',
    name: 'FOG OF WAR',
    description: 'Reduced visibility (400px radius)',
    category: ModifierCategory.ENVIRONMENT,
    icon: '🌫️',
    color: 0x7f8c8d,
    effects: { visibilityRadius: 400 }
  },
  {
    id: 'gravity_shift',
    name: 'GRAVITY SHIFT',
    description: 'Reversed movement on one axis',
    category: ModifierCategory.ENVIRONMENT,
    icon: '🔄',
    color: 0x9b59b6,
    effects: { reverseAxis: 'y' }
  },
  {
    id: 'explosive_floor',
    name: 'EXPLOSIVE FLOOR',
    description: 'Random explosions every 5s',
    category: ModifierCategory.ENVIRONMENT,
    icon: '💥',
    color: 0xe67e22,
    effects: { explosionInterval: 5000, explosionDamage: 30 }
  },
  {
    id: 'dark_floor',
    name: 'DARK FLOOR',
    description: 'Very low visibility, enemies glow',
    category: ModifierCategory.ENVIRONMENT,
    icon: '🌑',
    color: 0x2c3e50,
    effects: { visibilityRadius: 250, enemiesGlow: true }
  },

  // ═══════════════════════════════════════
  // REWARD MODIFIERS
  // ═══════════════════════════════════════
  {
    id: 'jackpot',
    name: 'JACKPOT',
    description: '3x gold drops',
    category: ModifierCategory.REWARD,
    icon: '💰',
    color: 0xffd700,
    effects: { goldMult: 3 }
  },
  {
    id: 'xp_surge',
    name: 'XP SURGE',
    description: '2x XP',
    category: ModifierCategory.REWARD,
    icon: '⭐',
    color: 0x00d9ff,
    effects: { xpMult: 2 }
  },
  {
    id: 'loot_bonanza',
    name: 'LOOT BONANZA',
    description: '2x item drop chance',
    category: ModifierCategory.REWARD,
    icon: '🎁',
    color: 0x1abc9c,
    effects: { itemDropMult: 2 }
  },
  {
    id: 'barren',
    name: 'BARREN',
    description: 'No drops, but 5x gold on floor clear',
    category: ModifierCategory.REWARD,
    icon: '🏜️',
    color: 0xd4a574,
    effects: { noDrops: true, goldOnClear: 5 }
  }
]

/**
 * Seeded random number generator for deterministic modifier selection per floor
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/**
 * Get modifiers for a specific floor number.
 * Uses floor number as seed for deterministic results.
 * @param floorNumber - The current floor
 * @param forceCount - Override modifier count (for endless mode)
 * @returns Array of 0-3 modifiers
 */
export function getFloorModifiers(floorNumber: number, forceCount?: number): FloorModifier[] {
  // No modifiers on first 5 floors (tutorial period)
  if (floorNumber <= 5) return []

  // Determine modifier count based on floor
  let count = forceCount ?? 0
  if (forceCount === undefined) {
    if (floorNumber <= 20) {
      // Floors 6-20: 50% chance of 1 modifier
      count = seededRandom(floorNumber * 7) < 0.5 ? 1 : 0
    } else if (floorNumber <= 50) {
      // Floors 21-50: Always 1, 30% chance of 2
      count = seededRandom(floorNumber * 7) < 0.3 ? 2 : 1
    } else if (floorNumber <= 100) {
      // Floors 51-100: Always 1-2
      count = seededRandom(floorNumber * 7) < 0.5 ? 2 : 1
    } else {
      // Floors 101+: 1-2, 20% chance of 3
      const roll = seededRandom(floorNumber * 7)
      count = roll < 0.2 ? 3 : roll < 0.6 ? 2 : 1
    }
  }

  if (count === 0) return []

  // Select modifiers using seeded random (no duplicates)
  const selected: FloorModifier[] = []
  const available = [...FLOOR_MODIFIERS]

  for (let i = 0; i < count && available.length > 0; i++) {
    const seed = floorNumber * 1000 + i * 37
    const index = Math.floor(seededRandom(seed) * available.length)
    selected.push(available[index])
    available.splice(index, 1)
  }

  return selected
}

/**
 * Combine effects from multiple modifiers into a single effects object
 */
export function combineModifierEffects(modifiers: FloorModifier[]): FloorModifier['effects'] {
  const combined: FloorModifier['effects'] = {}

  for (const mod of modifiers) {
    const e = mod.effects
    // Multiplicative stacking for multipliers
    if (e.enemyCountMult) combined.enemyCountMult = (combined.enemyCountMult || 1) * e.enemyCountMult
    if (e.enemyHPMult) combined.enemyHPMult = (combined.enemyHPMult || 1) * e.enemyHPMult
    if (e.enemyDamageMult) combined.enemyDamageMult = (combined.enemyDamageMult || 1) * e.enemyDamageMult
    if (e.enemySpeedMult) combined.enemySpeedMult = (combined.enemySpeedMult || 1) * e.enemySpeedMult
    if (e.playerDamageMult) combined.playerDamageMult = (combined.playerDamageMult || 1) * e.playerDamageMult
    if (e.playerHPMult) combined.playerHPMult = (combined.playerHPMult || 1) * e.playerHPMult
    if (e.playerSpeedMult) combined.playerSpeedMult = (combined.playerSpeedMult || 1) * e.playerSpeedMult
    if (e.playerFireRateMult) combined.playerFireRateMult = (combined.playerFireRateMult || 1) * e.playerFireRateMult
    if (e.playerAmmoMult) combined.playerAmmoMult = (combined.playerAmmoMult || 1) * e.playerAmmoMult
    if (e.goldMult) combined.goldMult = (combined.goldMult || 1) * e.goldMult
    if (e.xpMult) combined.xpMult = (combined.xpMult || 1) * e.xpMult
    if (e.itemDropMult) combined.itemDropMult = (combined.itemDropMult || 1) * e.itemDropMult
    if (e.goldOnClear) combined.goldOnClear = (combined.goldOnClear || 1) * e.goldOnClear

    // Additive stacking
    if (e.enemyRegenPercent) combined.enemyRegenPercent = (combined.enemyRegenPercent || 0) + e.enemyRegenPercent
    if (e.enemyShieldHP) combined.enemyShieldHP = (combined.enemyShieldHP || 0) + e.enemyShieldHP
    if (e.playerLifesteal) combined.playerLifesteal = (combined.playerLifesteal || 0) + e.playerLifesteal
    if (e.explosionDamage) combined.explosionDamage = (combined.explosionDamage || 0) + e.explosionDamage

    // Boolean flags (any true = true)
    if (e.noHealthPickups) combined.noHealthPickups = true
    if (e.noDrops) combined.noDrops = true
    if (e.enemiesGlow) combined.enemiesGlow = true

    // Take minimum visibility radius
    if (e.visibilityRadius) {
      combined.visibilityRadius = combined.visibilityRadius
        ? Math.min(combined.visibilityRadius, e.visibilityRadius)
        : e.visibilityRadius
    }

    // Take first reverse axis
    if (e.reverseAxis && !combined.reverseAxis) combined.reverseAxis = e.reverseAxis

    // Take minimum explosion interval
    if (e.explosionInterval) {
      combined.explosionInterval = combined.explosionInterval
        ? Math.min(combined.explosionInterval, e.explosionInterval)
        : e.explosionInterval
    }
  }

  return combined
}
