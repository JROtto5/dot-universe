/**
 * CraftingSystem - Material drops, weapon enchanting, gem socketing, fusion, and dismantling
 * Persistent across runs via localStorage
 */

import { THEME_ELEMENT_MAP, ElementType } from './ElementalSystem'
import { ItemRarity } from './ItemSystem'

// ─── Material Types ─────────────────────────────────────────────────────
export type ShardElement = 'fire' | 'ice' | 'lightning' | 'void'
export type EssenceRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface CraftingMaterials {
  shards: Record<ShardElement, number>
  essences: Record<EssenceRarity, number>
  dust: number
}

// ─── Enchantment Definitions ────────────────────────────────────────────
export interface EnchantRecipe {
  id: string
  name: string
  tier: 1 | 2 | 3
  stat: string
  value: number
  cost: { shards?: Partial<Record<ShardElement, number>>; dust: number }
}

export const ENCHANT_RECIPES: EnchantRecipe[] = [
  // Tier 1
  { id: 'dmg_t1', name: '+10% Damage', tier: 1, stat: 'damagePercent', value: 10, cost: { shards: { fire: 3 }, dust: 5 } },
  { id: 'crit_t1', name: '+5% Crit', tier: 1, stat: 'critPercent', value: 5, cost: { shards: { lightning: 3 }, dust: 5 } },
  { id: 'ammo_t1', name: '+15 Ammo', tier: 1, stat: 'ammoFlat', value: 15, cost: { shards: { ice: 3 }, dust: 5 } },
  { id: 'fire_rate_t1', name: '+10% Fire Rate', tier: 1, stat: 'fireRatePercent', value: 10, cost: { shards: { void: 3 }, dust: 5 } },
  { id: 'speed_t1', name: '+10% Speed', tier: 1, stat: 'speedPercent', value: 10, cost: { shards: { lightning: 2, ice: 1 }, dust: 5 } },
  { id: 'lifesteal_t1', name: '+2% Lifesteal', tier: 1, stat: 'lifestealPercent', value: 2, cost: { shards: { void: 2, fire: 1 }, dust: 5 } },
  // Tier 2
  { id: 'dmg_t2', name: '+25% Damage', tier: 2, stat: 'damagePercent', value: 25, cost: { shards: { fire: 8 }, dust: 15 } },
  { id: 'crit_t2', name: '+12% Crit', tier: 2, stat: 'critPercent', value: 12, cost: { shards: { lightning: 8 }, dust: 15 } },
  { id: 'ammo_t2', name: '+35 Ammo', tier: 2, stat: 'ammoFlat', value: 35, cost: { shards: { ice: 8 }, dust: 15 } },
  { id: 'fire_rate_t2', name: '+25% Fire Rate', tier: 2, stat: 'fireRatePercent', value: 25, cost: { shards: { void: 8 }, dust: 15 } },
  // Tier 3
  { id: 'dmg_t3', name: '+50% Damage', tier: 3, stat: 'damagePercent', value: 50, cost: { shards: { fire: 20, void: 5 }, dust: 40 } },
  { id: 'crit_t3', name: '+25% Crit', tier: 3, stat: 'critPercent', value: 25, cost: { shards: { lightning: 20, ice: 5 }, dust: 40 } },
]

// ─── Gem Definitions ────────────────────────────────────────────────────
export interface GemDefinition {
  id: string
  name: string
  color: number
  stat: string
  value: number
  description: string
}

export const GEM_DEFINITIONS: GemDefinition[] = [
  { id: 'ruby', name: 'Ruby', color: 0xff0000, stat: 'damagePercent', value: 15, description: '+15% Damage' },
  { id: 'sapphire', name: 'Sapphire', color: 0x0066ff, stat: 'ammoFlat', value: 20, description: '+20 Ammo' },
  { id: 'emerald', name: 'Emerald', color: 0x00cc00, stat: 'lifestealPercent', value: 3, description: '+3% Lifesteal' },
  { id: 'amethyst', name: 'Amethyst', color: 0x9b59b6, stat: 'fireRatePercent', value: 15, description: '+15% Fire Rate' },
  { id: 'diamond', name: 'Diamond', color: 0xffffff, stat: 'allPercent', value: 10, description: '+10% All Stats' },
  { id: 'obsidian', name: 'Obsidian', color: 0x2c3e50, stat: 'critPercent', value: 20, description: '+20% Crit' },
]

// ─── Weapon Craft Data ──────────────────────────────────────────────────
export interface WeaponCraftData {
  enchantments: string[] // enchant recipe IDs, max 3
  gems: (string | null)[] // gem IDs, 2 slots
}

// ─── Dismantle Yields ───────────────────────────────────────────────────
const DISMANTLE_YIELDS: Record<string, { dust: number; shardChance: number }> = {
  common: { dust: 2, shardChance: 0.10 },
  uncommon: { dust: 5, shardChance: 0.25 },
  rare: { dust: 15, shardChance: 0.50 },
  epic: { dust: 30, shardChance: 0.75 },
  legendary: { dust: 60, shardChance: 1.0 },
}

// ─── Gem Inventory ──────────────────────────────────────────────────────
export type GemInventory = Record<string, number>

// ─── Crafting Data ──────────────────────────────────────────────────────
interface CraftingData {
  materials: CraftingMaterials
  gems: GemInventory
  weaponCrafts: Record<string, WeaponCraftData> // weaponName -> craft data
  totalEnchantments: number
  totalGemsSocketed: number
  totalFusions: number
  totalDismantles: number
}

const STORAGE_KEY = 'dotslayer_crafting'

const ALL_SHARD_ELEMENTS: ShardElement[] = ['fire', 'ice', 'lightning', 'void']
const ALL_ESSENCE_RARITIES: EssenceRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

export class CraftingSystem {
  private static instance: CraftingSystem
  private data: CraftingData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): CraftingSystem {
    if (!CraftingSystem.instance) {
      CraftingSystem.instance = new CraftingSystem()
    }
    return CraftingSystem.instance
  }

  // ── Persistence ──────────────────────────────────────────────────────

  private load(): CraftingData {
    if (typeof localStorage === 'undefined') return this.defaultData()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CraftingData
        // Forward-compat: ensure all keys exist
        const defaults = this.defaultData()
        if (!parsed.materials) parsed.materials = defaults.materials
        if (!parsed.gems) parsed.gems = defaults.gems
        if (!parsed.weaponCrafts) parsed.weaponCrafts = defaults.weaponCrafts
        for (const el of ALL_SHARD_ELEMENTS) {
          if (parsed.materials.shards[el] === undefined) parsed.materials.shards[el] = 0
        }
        for (const r of ALL_ESSENCE_RARITIES) {
          if (parsed.materials.essences[r] === undefined) parsed.materials.essences[r] = 0
        }
        if (parsed.materials.dust === undefined) parsed.materials.dust = 0
        return parsed
      }
    } catch (e) {
      console.warn('Failed to load crafting data:', e)
    }
    return this.defaultData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save crafting data:', e)
    }
  }

  private defaultData(): CraftingData {
    return {
      materials: {
        shards: { fire: 0, ice: 0, lightning: 0, void: 0 },
        essences: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
        dust: 0,
      },
      gems: {},
      weaponCrafts: {},
      totalEnchantments: 0,
      totalGemsSocketed: 0,
      totalFusions: 0,
      totalDismantles: 0,
    }
  }

  // ── Material Management ──────────────────────────────────────────────

  addShards(element: ShardElement, amount: number): void {
    this.data.materials.shards[element] += amount
    this.save()
  }

  addEssence(rarity: EssenceRarity, amount: number): void {
    this.data.materials.essences[rarity] += amount
    this.save()
  }

  addDust(amount: number): void {
    this.data.materials.dust += amount
    this.save()
  }

  addGem(gemId: string, amount: number = 1): void {
    this.data.gems[gemId] = (this.data.gems[gemId] || 0) + amount
    this.save()
  }

  getMaterials(): CraftingMaterials {
    return {
      shards: { ...this.data.materials.shards },
      essences: { ...this.data.materials.essences },
      dust: this.data.materials.dust,
    }
  }

  getGems(): GemInventory {
    return { ...this.data.gems }
  }

  // ── Material Drop Logic ──────────────────────────────────────────────

  /**
   * Roll for a crafting material drop from an enemy kill.
   * Returns the drop result or null if nothing dropped.
   */
  rollMaterialDrop(floorNumber: number, floorTheme: string, isBoss: boolean): {
    type: 'shard' | 'essence' | 'gem'
    element?: ShardElement
    rarity?: EssenceRarity
    gemId?: string
  } | null {
    // Base drop chance: 15% scaling to 30% at floor 100+
    const baseChance = 0.15 + Math.min(floorNumber / 100, 1) * 0.15
    const dropChance = isBoss ? 1.0 : baseChance

    if (Math.random() > dropChance) return null

    // Bosses always drop high-rarity materials
    if (isBoss) {
      // 40% chance gem, 30% shard, 30% essence
      const roll = Math.random()
      if (roll < 0.4) {
        const gemDef = GEM_DEFINITIONS[Math.floor(Math.random() * GEM_DEFINITIONS.length)]
        return { type: 'gem', gemId: gemDef.id }
      } else if (roll < 0.7) {
        const element = this.getElementForTheme(floorTheme)
        return { type: 'shard', element }
      } else {
        const rarity = this.rollEssenceRarity(floorNumber, true)
        return { type: 'essence', rarity }
      }
    }

    // Regular enemies: 60% shard, 30% essence, 10% gem (floor 30+)
    const roll = Math.random()
    if (roll < 0.6) {
      const element = this.getElementForTheme(floorTheme)
      return { type: 'shard', element }
    } else if (roll < 0.9 || floorNumber < 30) {
      const rarity = this.rollEssenceRarity(floorNumber, false)
      return { type: 'essence', rarity }
    } else {
      const gemDef = GEM_DEFINITIONS[Math.floor(Math.random() * GEM_DEFINITIONS.length)]
      return { type: 'gem', gemId: gemDef.id }
    }
  }

  private getElementForTheme(theme: string): ShardElement {
    const mapped = THEME_ELEMENT_MAP[theme]
    if (mapped) return mapped as ShardElement
    return ALL_SHARD_ELEMENTS[Math.floor(Math.random() * ALL_SHARD_ELEMENTS.length)]
  }

  private rollEssenceRarity(floorNumber: number, isBoss: boolean): EssenceRarity {
    const floorBonus = Math.min(floorNumber / 150, 1)
    const weights = isBoss
      ? { common: 5, uncommon: 15, rare: 30, epic: 35, legendary: 15 }
      : {
          common: 45 - floorBonus * 20,
          uncommon: 30,
          rare: 15 + floorBonus * 10,
          epic: 8 + floorBonus * 7,
          legendary: 2 + floorBonus * 3,
        }

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    let roll = Math.random() * totalWeight

    for (const [rarity, weight] of Object.entries(weights)) {
      roll -= weight
      if (roll <= 0) return rarity as EssenceRarity
    }
    return 'common'
  }

  // ── Enchanting ───────────────────────────────────────────────────────

  /**
   * Get current enchantments on a weapon
   */
  getWeaponCraft(weaponName: string): WeaponCraftData {
    return this.data.weaponCrafts[weaponName] || { enchantments: [], gems: [null, null] }
  }

  /**
   * Check if a weapon can be enchanted with a given recipe
   */
  canEnchant(weaponName: string, recipeId: string): { can: boolean; reason?: string } {
    const craft = this.getWeaponCraft(weaponName)
    if (craft.enchantments.length >= 3) {
      return { can: false, reason: 'Max 3 enchantments per weapon' }
    }

    const recipe = ENCHANT_RECIPES.find(r => r.id === recipeId)
    if (!recipe) return { can: false, reason: 'Unknown recipe' }

    // Check duplicate stat
    const existingStats = craft.enchantments.map(id => ENCHANT_RECIPES.find(r => r.id === id)?.stat).filter(Boolean)
    if (existingStats.includes(recipe.stat)) {
      return { can: false, reason: 'Already enchanted with that stat' }
    }

    // Check cost
    if (recipe.cost.dust > this.data.materials.dust) {
      return { can: false, reason: `Need ${recipe.cost.dust} dust (have ${this.data.materials.dust})` }
    }
    if (recipe.cost.shards) {
      for (const [el, needed] of Object.entries(recipe.cost.shards)) {
        const have = this.data.materials.shards[el as ShardElement] || 0
        if (have < needed) {
          return { can: false, reason: `Need ${needed} ${el} shards (have ${have})` }
        }
      }
    }

    return { can: true }
  }

  /**
   * Enchant a weapon with a recipe. Returns true on success.
   */
  enchantWeapon(weaponName: string, recipeId: string): boolean {
    const { can } = this.canEnchant(weaponName, recipeId)
    if (!can) return false

    const recipe = ENCHANT_RECIPES.find(r => r.id === recipeId)!

    // Deduct cost
    this.data.materials.dust -= recipe.cost.dust
    if (recipe.cost.shards) {
      for (const [el, needed] of Object.entries(recipe.cost.shards)) {
        this.data.materials.shards[el as ShardElement] -= needed
      }
    }

    // Apply enchantment
    if (!this.data.weaponCrafts[weaponName]) {
      this.data.weaponCrafts[weaponName] = { enchantments: [], gems: [null, null] }
    }
    this.data.weaponCrafts[weaponName].enchantments.push(recipeId)
    this.data.totalEnchantments++
    this.save()
    return true
  }

  /**
   * Remove an enchantment from a weapon (no refund)
   */
  removeEnchantment(weaponName: string, index: number): boolean {
    const craft = this.data.weaponCrafts[weaponName]
    if (!craft || index < 0 || index >= craft.enchantments.length) return false
    craft.enchantments.splice(index, 1)
    this.save()
    return true
  }

  // ── Gem Socketing ────────────────────────────────────────────────────

  /**
   * Check if a gem can be socketed into a weapon slot
   */
  canSocketGem(weaponName: string, slotIndex: number, gemId: string): { can: boolean; reason?: string } {
    if (slotIndex < 0 || slotIndex > 1) return { can: false, reason: 'Invalid slot (0-1)' }

    const gemCount = this.data.gems[gemId] || 0
    if (gemCount <= 0) return { can: false, reason: 'No gems of this type available' }

    const gemDef = GEM_DEFINITIONS.find(g => g.id === gemId)
    if (!gemDef) return { can: false, reason: 'Unknown gem type' }

    return { can: true }
  }

  /**
   * Socket a gem into a weapon slot. Returns previous gem or null.
   */
  socketGem(weaponName: string, slotIndex: number, gemId: string): string | null {
    const { can } = this.canSocketGem(weaponName, slotIndex, gemId)
    if (!can) return null

    if (!this.data.weaponCrafts[weaponName]) {
      this.data.weaponCrafts[weaponName] = { enchantments: [], gems: [null, null] }
    }

    // Remove gem from inventory
    this.data.gems[gemId]--
    if (this.data.gems[gemId] <= 0) delete this.data.gems[gemId]

    // Return previous gem to inventory
    const prev = this.data.weaponCrafts[weaponName].gems[slotIndex]
    if (prev) {
      this.data.gems[prev] = (this.data.gems[prev] || 0) + 1
    }

    this.data.weaponCrafts[weaponName].gems[slotIndex] = gemId
    this.data.totalGemsSocketed++
    this.save()
    return prev
  }

  /**
   * Remove a gem from a weapon slot, returning it to inventory
   */
  unsocketGem(weaponName: string, slotIndex: number): string | null {
    const craft = this.data.weaponCrafts[weaponName]
    if (!craft) return null

    const gem = craft.gems[slotIndex]
    if (!gem) return null

    craft.gems[slotIndex] = null
    this.data.gems[gem] = (this.data.gems[gem] || 0) + 1
    this.save()
    return gem
  }

  // ── Item Fusion ──────────────────────────────────────────────────────

  private static readonly RARITY_ORDER: EssenceRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

  /**
   * Fuse 3 essences of the same rarity into 1 of the next rarity.
   * Returns the new rarity or null on failure.
   */
  fuseEssences(rarity: EssenceRarity): EssenceRarity | null {
    const idx = CraftingSystem.RARITY_ORDER.indexOf(rarity)
    if (idx < 0 || idx >= CraftingSystem.RARITY_ORDER.length - 1) return null
    if (this.data.materials.essences[rarity] < 3) return null

    const nextRarity = CraftingSystem.RARITY_ORDER[idx + 1]
    this.data.materials.essences[rarity] -= 3
    this.data.materials.essences[nextRarity] += 1
    this.data.totalFusions++
    this.save()
    return nextRarity
  }

  // ── Dismantling ──────────────────────────────────────────────────────

  /**
   * Dismantle an item by rarity. Returns dust and optional shard gained.
   */
  dismantleItem(rarity: string): { dust: number; shard?: ShardElement } {
    const yields = DISMANTLE_YIELDS[rarity] || DISMANTLE_YIELDS.common
    this.data.materials.dust += yields.dust
    this.data.totalDismantles++

    let shard: ShardElement | undefined
    if (Math.random() < yields.shardChance) {
      shard = ALL_SHARD_ELEMENTS[Math.floor(Math.random() * ALL_SHARD_ELEMENTS.length)]
      this.data.materials.shards[shard] += 1
    }

    this.save()
    return { dust: yields.dust, shard }
  }

  // ── Aggregated Bonuses ───────────────────────────────────────────────

  /**
   * Get the total stat bonuses from all enchantments and gems on a weapon
   */
  getAggregatedCraftBonuses(weaponName: string): Record<string, number> {
    const craft = this.getWeaponCraft(weaponName)
    const bonuses: Record<string, number> = {}

    // Sum enchantment bonuses
    for (const recipeId of craft.enchantments) {
      const recipe = ENCHANT_RECIPES.find(r => r.id === recipeId)
      if (recipe) {
        bonuses[recipe.stat] = (bonuses[recipe.stat] || 0) + recipe.value
      }
    }

    // Sum gem bonuses
    for (const gemId of craft.gems) {
      if (!gemId) continue
      const gem = GEM_DEFINITIONS.find(g => g.id === gemId)
      if (gem) {
        if (gem.stat === 'allPercent') {
          // Diamond boosts everything
          bonuses.damagePercent = (bonuses.damagePercent || 0) + gem.value
          bonuses.fireRatePercent = (bonuses.fireRatePercent || 0) + gem.value
          bonuses.speedPercent = (bonuses.speedPercent || 0) + gem.value
          bonuses.ammoFlat = (bonuses.ammoFlat || 0) + gem.value
        } else {
          bonuses[gem.stat] = (bonuses[gem.stat] || 0) + gem.value
        }
      }
    }

    return bonuses
  }

  // ── Stats ────────────────────────────────────────────────────────────

  getStats() {
    return {
      totalEnchantments: this.data.totalEnchantments,
      totalGemsSocketed: this.data.totalGemsSocketed,
      totalFusions: this.data.totalFusions,
      totalDismantles: this.data.totalDismantles,
    }
  }
}

export const craftingSystem = CraftingSystem.getInstance()
