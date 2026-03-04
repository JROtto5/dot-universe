/**
 * ElementalSystem - Elemental weapon infusion, evolution, and core management
 * Persistent across runs via localStorage
 */

// Element types
export type ElementType = 'fire' | 'ice' | 'lightning' | 'void'

export interface ElementConfig {
  name: string
  type: ElementType
  color: number        // Phaser tint color
  baseDamageMult: number  // multiplier to base damage
  description: string
  // Effect-specific
  dotDPS?: number        // fire: 5
  dotDuration?: number   // fire: 3s
  slowPercent?: number   // ice: 40
  slowDuration?: number  // ice: 2s
  chainChance?: number   // lightning: 0.25
  chainRange?: number    // lightning: 150px
  hpPercent?: number     // void: 0.03
}

export const ELEMENT_CONFIGS: Record<ElementType, ElementConfig> = {
  fire: {
    name: 'Fire',
    type: 'fire',
    color: 0xff6600,
    baseDamageMult: 1.15,
    description: '+15% damage, DOT (5 DPS for 3s)',
    dotDPS: 5,
    dotDuration: 3,
  },
  ice: {
    name: 'Ice',
    type: 'ice',
    color: 0x00ccff,
    baseDamageMult: 1.0,
    description: '40% slow for 2s',
    slowPercent: 40,
    slowDuration: 2,
  },
  lightning: {
    name: 'Lightning',
    type: 'lightning',
    color: 0xffff00,
    baseDamageMult: 1.1,
    description: '+10% damage, 25% chain to nearby',
    chainChance: 0.25,
    chainRange: 150,
  },
  void: {
    name: 'Void',
    type: 'void',
    color: 0x9900ff,
    baseDamageMult: 1.05,
    description: '+5% damage, 3% enemy max HP',
    hpPercent: 0.03,
  },
}

// Floor theme -> element mapping for core drops
export const THEME_ELEMENT_MAP: Record<string, ElementType> = {
  toxic: 'void',
  cyber: 'void',
  inferno: 'fire',
  frozen: 'ice',
  shadow: 'lightning',
  arena: 'lightning',
  crystal: 'ice',
  void: 'void',
  blood: 'fire',
  nature: 'lightning',
}

export interface WeaponEvolution {
  originalName: string
  evolvedName: string
  element: ElementType
  bonusStats: number  // +25% = 0.25
}

// Evolution name prefixes
const EVOLUTION_PREFIXES: Record<ElementType, string> = {
  fire: 'Inferno',
  ice: 'Glacial',
  lightning: 'Storm',
  void: 'Abyssal',
}

interface ElementalData {
  weaponElements: Record<string, ElementType>     // weaponName -> element
  elementalCores: Record<ElementType, number>      // element -> count
  evolvedWeapons: Record<string, WeaponEvolution>  // weaponName -> evolution data
  totalCoresCollected: number
  totalElementalKills: Record<ElementType, number>
}

const STORAGE_KEY = 'dotslayer_elements'

const ALL_ELEMENTS: ElementType[] = ['fire', 'ice', 'lightning', 'void']

function defaultElementalData(): ElementalData {
  return {
    weaponElements: {},
    elementalCores: { fire: 0, ice: 0, lightning: 0, void: 0 },
    evolvedWeapons: {},
    totalCoresCollected: 0,
    totalElementalKills: { fire: 0, ice: 0, lightning: 0, void: 0 },
  }
}

export class ElementalSystem {
  private static instance: ElementalSystem
  private data: ElementalData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): ElementalSystem {
    if (!ElementalSystem.instance) {
      ElementalSystem.instance = new ElementalSystem()
    }
    return ElementalSystem.instance
  }

  // ── Persistence ──────────────────────────────────────────────────────

  private load(): ElementalData {
    if (typeof localStorage === 'undefined') {
      return defaultElementalData()
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ElementalData
        // Ensure every element key exists (forward-compat)
        const defaults = defaultElementalData()
        for (const el of ALL_ELEMENTS) {
          if (parsed.elementalCores[el] === undefined) parsed.elementalCores[el] = 0
          if (parsed.totalElementalKills[el] === undefined) parsed.totalElementalKills[el] = 0
        }
        if (parsed.totalCoresCollected === undefined) parsed.totalCoresCollected = 0
        if (!parsed.evolvedWeapons) parsed.evolvedWeapons = {}
        if (!parsed.weaponElements) parsed.weaponElements = {}
        return parsed
      }
    } catch (e) {
      console.warn('Failed to load elemental data:', e)
    }
    return defaultElementalData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save elemental data:', e)
    }
  }

  // ── Core Management ──────────────────────────────────────────────────

  /**
   * Add an elemental core to the player's inventory
   */
  addCore(element: ElementType): void {
    this.data.elementalCores[element] += 1
    this.data.totalCoresCollected += 1
    this.save()
  }

  /**
   * Get the number of cores for a specific element
   */
  getCoreCount(element: ElementType): number {
    return this.data.elementalCores[element] || 0
  }

  /**
   * Get all core counts
   */
  getAllCores(): Record<ElementType, number> {
    return { ...this.data.elementalCores }
  }

  // ── Weapon Element Assignment ────────────────────────────────────────

  /**
   * Apply an element to a weapon, consuming one core.
   * Returns true on success, false if insufficient cores.
   */
  applyElement(weaponName: string, element: ElementType): boolean {
    if (this.data.elementalCores[element] <= 0) {
      return false
    }
    // If weapon already has an element, return the old core first
    this.removeElement(weaponName)

    this.data.elementalCores[element] -= 1
    this.data.weaponElements[weaponName] = element
    this.save()
    return true
  }

  /**
   * Remove an element from a weapon, returning the core to inventory.
   * Returns the removed element type, or null if weapon had no element.
   */
  removeElement(weaponName: string): ElementType | null {
    const existing = this.data.weaponElements[weaponName]
    if (!existing) return null

    this.data.elementalCores[existing] += 1
    delete this.data.weaponElements[weaponName]
    this.save()
    return existing
  }

  /**
   * Get the element currently applied to a weapon
   */
  getWeaponElement(weaponName: string): ElementType | null {
    return this.data.weaponElements[weaponName] || null
  }

  // ── Damage Calculation Helpers ───────────────────────────────────────

  /**
   * Get the full ElementConfig for a weapon's element, or null if uninfused
   */
  getDamageModifier(weaponName: string): ElementConfig | null {
    const element = this.data.weaponElements[weaponName]
    if (!element) return null
    return ELEMENT_CONFIGS[element]
  }

  /**
   * Get the tint color for a weapon's bullets, or null if uninfused
   */
  getBulletTint(weaponName: string): number | null {
    const element = this.data.weaponElements[weaponName]
    if (!element) return null
    return ELEMENT_CONFIGS[element].color
  }

  // ── Floor Theme Mapping ──────────────────────────────────────────────

  /**
   * Get the element associated with a floor theme.
   * Falls back to a random element if the theme is unmapped.
   */
  getElementForTheme(theme: string): ElementType {
    const mapped = THEME_ELEMENT_MAP[theme]
    if (mapped) return mapped
    // Default: pick a random element
    return ALL_ELEMENTS[Math.floor(Math.random() * ALL_ELEMENTS.length)]
  }

  // ── Weapon Evolution ─────────────────────────────────────────────────

  /**
   * Check whether a weapon is eligible for evolution.
   * Requires Grandmaster mastery rank AND an element equipped.
   */
  canEvolve(weaponName: string, masteryRank: string): boolean {
    if (masteryRank !== 'Grandmaster') return false
    if (!this.data.weaponElements[weaponName]) return false
    if (this.data.evolvedWeapons[weaponName]) return false // already evolved
    return true
  }

  /**
   * Evolve a weapon, granting it a prefixed name and bonus stats.
   * Returns the evolution data, or null if the weapon cannot evolve.
   */
  evolveWeapon(weaponName: string): WeaponEvolution | null {
    const element = this.data.weaponElements[weaponName]
    if (!element) return null
    if (this.data.evolvedWeapons[weaponName]) return null // already evolved

    const prefix = EVOLUTION_PREFIXES[element]
    const evolution: WeaponEvolution = {
      originalName: weaponName,
      evolvedName: `${prefix} ${weaponName}`,
      element,
      bonusStats: 0.25,
    }

    this.data.evolvedWeapons[weaponName] = evolution
    this.save()
    return evolution
  }

  /**
   * Check if a weapon has been evolved
   */
  isEvolved(weaponName: string): boolean {
    return !!this.data.evolvedWeapons[weaponName]
  }

  /**
   * Get the display name for a weapon (evolved name if applicable)
   */
  getEvolvedName(weaponName: string): string {
    const evo = this.data.evolvedWeapons[weaponName]
    return evo ? evo.evolvedName : weaponName
  }

  /**
   * Get full evolution data for a weapon, or null if not evolved
   */
  getEvolution(weaponName: string): WeaponEvolution | null {
    return this.data.evolvedWeapons[weaponName] || null
  }

  // ── Stats ────────────────────────────────────────────────────────────

  /**
   * Record a kill made with an elemental weapon
   */
  recordElementalKill(element: ElementType): void {
    this.data.totalElementalKills[element] += 1
    this.save()
  }

  /**
   * Get total kills per element
   */
  getElementalKills(): Record<ElementType, number> {
    return { ...this.data.totalElementalKills }
  }
}

export const elementalSystem = ElementalSystem.getInstance()
