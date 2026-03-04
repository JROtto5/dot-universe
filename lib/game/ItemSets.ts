/**
 * ItemSets - Group items into themed sets with stacking bonuses
 * 6 sets with 2-piece and 3-piece bonuses
 */

export interface SetBonus {
  pieces: number
  description: string
  effects: {
    damageMult?: number
    maxHPMult?: number
    fireRateMult?: number
    goldMult?: number
    itemDropMult?: number
    lifestealPct?: number
    statusChancePct?: number
    autoTurret?: boolean
    autoRevive?: boolean
    autoReviveHPPct?: number
    voidLootMult?: number
    dmgPerMissingHPPct?: number // +X% damage per missing HP%
    rarityBoost?: number         // +X to rarity weight
  }
}

export interface ItemSet {
  id: string
  name: string
  color: number
  icon: string
  itemIds: string[]   // IDs from ITEM_POOL in ItemSystem.ts
  bonuses: SetBonus[]
}

export const ITEM_SETS: ItemSet[] = [
  {
    id: 'void_set',
    name: 'Void Set',
    color: 0x2d0050,
    icon: '🌀',
    itemIds: ['void_shard', 'shadow_cloak', 'damage_large'],
    bonuses: [
      {
        pieces: 2,
        description: '+20% Void Damage',
        effects: { damageMult: 1.2 }
      },
      {
        pieces: 3,
        description: 'Void enemies drop 2x loot',
        effects: { voidLootMult: 2 }
      }
    ]
  },
  {
    id: 'berserker_set',
    name: 'Berserker Set',
    color: 0xe74c3c,
    icon: '🔥',
    itemIds: ['berserkers_rage', 'damage_medium', 'crit_damage'],
    bonuses: [
      {
        pieces: 2,
        description: '+15% Damage',
        effects: { damageMult: 1.15 }
      },
      {
        pieces: 3,
        description: '+1% damage per missing HP%',
        effects: { dmgPerMissingHPPct: 1 }
      }
    ]
  },
  {
    id: 'guardian_set',
    name: 'Guardian Set',
    color: 0x27ae60,
    icon: '🛡️',
    itemIds: ['max_health', 'phoenix_feather', 'healing_totem'],
    bonuses: [
      {
        pieces: 2,
        description: '+25% Max HP',
        effects: { maxHPMult: 1.25 }
      },
      {
        pieces: 3,
        description: 'Auto-revive with 30% HP',
        effects: { autoRevive: true, autoReviveHPPct: 30 }
      }
    ]
  },
  {
    id: 'fortune_set',
    name: 'Fortune Set',
    color: 0xffd700,
    icon: '💰',
    itemIds: ['gold_magnet', 'xp_catalyst', 'health_medium'],
    bonuses: [
      {
        pieces: 2,
        description: '+30% Gold Drops',
        effects: { goldMult: 1.3 }
      },
      {
        pieces: 3,
        description: 'Rare+ items drop 2x more',
        effects: { rarityBoost: 2 }
      }
    ]
  },
  {
    id: 'elemental_set',
    name: 'Elemental Set',
    color: 0x00ccff,
    icon: '⚡',
    itemIds: ['plasma_battery', 'time_crystal', 'fire_rate_large'],
    bonuses: [
      {
        pieces: 2,
        description: '+20% Status Effect Duration',
        effects: { statusChancePct: 20 }
      },
      {
        pieces: 3,
        description: 'Apply random status on hit',
        effects: { statusChancePct: 100 }
      }
    ]
  },
  {
    id: 'mechanical_set',
    name: 'Mechanical Set',
    color: 0x44aaff,
    icon: '⚙️',
    itemIds: ['mechanical_core', 'fire_rate', 'ammo_max'],
    bonuses: [
      {
        pieces: 2,
        description: '+25% Fire Rate',
        effects: { fireRateMult: 1.25 }
      },
      {
        pieces: 3,
        description: 'Auto-turret companion',
        effects: { autoTurret: true }
      }
    ]
  }
]

/**
 * Get active set bonuses based on collected item IDs
 */
export function getActiveSetBonuses(collectedItemIds: string[]): Array<{
  set: ItemSet
  piecesOwned: number
  activeBonuses: SetBonus[]
}> {
  const results: Array<{
    set: ItemSet
    piecesOwned: number
    activeBonuses: SetBonus[]
  }> = []

  for (const set of ITEM_SETS) {
    const owned = set.itemIds.filter(id => collectedItemIds.includes(id)).length
    if (owned >= 2) {
      const active = set.bonuses.filter(b => owned >= b.pieces)
      results.push({
        set,
        piecesOwned: owned,
        activeBonuses: active
      })
    }
  }

  return results
}

/**
 * Combine all active set bonus effects into one effects object
 */
export function getCombinedSetEffects(collectedItemIds: string[]): SetBonus['effects'] {
  const combined: SetBonus['effects'] = {}
  const activeSets = getActiveSetBonuses(collectedItemIds)

  for (const { activeBonuses } of activeSets) {
    for (const bonus of activeBonuses) {
      const e = bonus.effects
      if (e.damageMult) combined.damageMult = (combined.damageMult || 1) * e.damageMult
      if (e.maxHPMult) combined.maxHPMult = (combined.maxHPMult || 1) * e.maxHPMult
      if (e.fireRateMult) combined.fireRateMult = (combined.fireRateMult || 1) * e.fireRateMult
      if (e.goldMult) combined.goldMult = (combined.goldMult || 1) * e.goldMult
      if (e.itemDropMult) combined.itemDropMult = (combined.itemDropMult || 1) * e.itemDropMult
      if (e.lifestealPct) combined.lifestealPct = (combined.lifestealPct || 0) + e.lifestealPct
      if (e.statusChancePct) combined.statusChancePct = (combined.statusChancePct || 0) + e.statusChancePct
      if (e.voidLootMult) combined.voidLootMult = (combined.voidLootMult || 1) * e.voidLootMult
      if (e.dmgPerMissingHPPct) combined.dmgPerMissingHPPct = (combined.dmgPerMissingHPPct || 0) + e.dmgPerMissingHPPct
      if (e.rarityBoost) combined.rarityBoost = (combined.rarityBoost || 0) + e.rarityBoost
      if (e.autoTurret) combined.autoTurret = true
      if (e.autoRevive) {
        combined.autoRevive = true
        combined.autoReviveHPPct = e.autoReviveHPPct || 30
      }
    }
  }

  return combined
}

/**
 * Get display info for which sets a player is working toward
 */
export function getSetProgress(collectedItemIds: string[]): Array<{
  set: ItemSet
  piecesOwned: number
  totalPieces: number
  ownedItems: string[]
  missingItems: string[]
  isComplete: boolean
}> {
  return ITEM_SETS.map(set => {
    const ownedItems = set.itemIds.filter(id => collectedItemIds.includes(id))
    const missingItems = set.itemIds.filter(id => !collectedItemIds.includes(id))
    return {
      set,
      piecesOwned: ownedItems.length,
      totalPieces: set.itemIds.length,
      ownedItems,
      missingItems,
      isComplete: ownedItems.length === set.itemIds.length
    }
  })
}
