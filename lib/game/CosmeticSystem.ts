/**
 * CosmeticSystem - Player skins, weapon skins, kill effects, titles, and trail effects
 * Persistent across runs via localStorage
 */

// ─── Cosmetic Types ─────────────────────────────────────────────────────

export type CosmeticCategory = 'playerSkin' | 'weaponSkin' | 'killEffect' | 'title' | 'trailEffect'

export type UnlockConditionType =
  | 'free'
  | 'kills'
  | 'prestige'
  | 'floor'
  | 'mastery'
  | 'codex_items'
  | 'codex_bestiary'
  | 'boss_kills'
  | 'companion_level'
  | 'victory_count'

export interface UnlockCondition {
  type: UnlockConditionType
  value: number
  description: string
}

// ─── Player Skin ────────────────────────────────────────────────────────

export interface PlayerSkinDef {
  id: string
  name: string
  bodyColor: number
  eyeColor: number
  outlineColor: number
  glowColor?: number
  shape: 'circle' | 'diamond' | 'hexagon' | 'star'
  unlock: UnlockCondition
}

export const PLAYER_SKINS: PlayerSkinDef[] = [
  { id: 'default', name: 'Default', bodyColor: 0x3498db, eyeColor: 0xffffff, outlineColor: 0x2980b9, shape: 'circle', unlock: { type: 'free', value: 0, description: 'Default skin' } },
  { id: 'crimson', name: 'Crimson Warrior', bodyColor: 0xe74c3c, eyeColor: 0xffcccc, outlineColor: 0xc0392b, shape: 'circle', unlock: { type: 'kills', value: 1000, description: '1,000 total kills' } },
  { id: 'emerald', name: 'Emerald Guardian', bodyColor: 0x2ecc71, eyeColor: 0xccffcc, outlineColor: 0x27ae60, shape: 'circle', unlock: { type: 'kills', value: 5000, description: '5,000 total kills' } },
  { id: 'golden', name: 'Golden Champion', bodyColor: 0xf1c40f, eyeColor: 0xffffff, outlineColor: 0xf39c12, glowColor: 0xffd700, shape: 'circle', unlock: { type: 'prestige', value: 5, description: 'Prestige Level 5' } },
  { id: 'void_entity', name: 'Void Entity', bodyColor: 0x9900ff, eyeColor: 0xff00ff, outlineColor: 0x6600cc, glowColor: 0x9900ff, shape: 'diamond', unlock: { type: 'floor', value: 120, description: 'Reach Floor 120' } },
  { id: 'ice_crystal', name: 'Ice Crystal', bodyColor: 0x00ccff, eyeColor: 0xccffff, outlineColor: 0x0099cc, glowColor: 0x00ccff, shape: 'hexagon', unlock: { type: 'kills', value: 10000, description: '10,000 total kills' } },
  { id: 'shadow', name: 'Shadow Walker', bodyColor: 0x2c3e50, eyeColor: 0xff0000, outlineColor: 0x1a252f, shape: 'circle', unlock: { type: 'floor', value: 100, description: 'Reach Floor 100' } },
  { id: 'inferno', name: 'Inferno Lord', bodyColor: 0xff6600, eyeColor: 0xffff00, outlineColor: 0xcc3300, glowColor: 0xff6600, shape: 'star', unlock: { type: 'prestige', value: 10, description: 'Prestige Level 10' } },
  { id: 'nebula', name: 'Nebula', bodyColor: 0x6c5ce7, eyeColor: 0xa29bfe, outlineColor: 0x5a4ed1, glowColor: 0x6c5ce7, shape: 'hexagon', unlock: { type: 'kills', value: 25000, description: '25,000 total kills' } },
  { id: 'platinum', name: 'Platinum Elite', bodyColor: 0xe0e0e0, eyeColor: 0xffffff, outlineColor: 0xb0b0b0, glowColor: 0xffffff, shape: 'diamond', unlock: { type: 'victory_count', value: 10, description: '10 victories' } },
  { id: 'toxic', name: 'Toxic Avenger', bodyColor: 0x00ff00, eyeColor: 0xffff00, outlineColor: 0x009900, glowColor: 0x00ff00, shape: 'circle', unlock: { type: 'boss_kills', value: 50, description: '50 bosses killed' } },
  { id: 'galaxy', name: 'Galaxy Destroyer', bodyColor: 0x0a0a2e, eyeColor: 0x00ffff, outlineColor: 0x1a1a4e, glowColor: 0x4444ff, shape: 'star', unlock: { type: 'floor', value: 150, description: 'Reach Floor 150' } },
]

// ─── Weapon Skin ────────────────────────────────────────────────────────

export interface WeaponSkinDef {
  id: string
  name: string
  bulletColor: number
  bulletShape: 'circle' | 'diamond' | 'beam' | 'bolt'
  muzzleColor: number
  trailColor: number
  unlock: UnlockCondition
}

export const WEAPON_SKINS: WeaponSkinDef[] = [
  { id: 'default', name: 'Default', bulletColor: 0xffff00, bulletShape: 'circle', muzzleColor: 0xffff00, trailColor: 0xf1c40f, unlock: { type: 'free', value: 0, description: 'Default bullets' } },
  { id: 'inferno_rounds', name: 'Inferno Rounds', bulletColor: 0xff6600, bulletShape: 'circle', muzzleColor: 0xff3300, trailColor: 0xff6600, unlock: { type: 'kills', value: 3000, description: '3,000 total kills' } },
  { id: 'ice_crystals', name: 'Ice Crystals', bulletColor: 0x00ccff, bulletShape: 'diamond', muzzleColor: 0x00aaff, trailColor: 0x00ccff, unlock: { type: 'mastery', value: 3, description: 'Any weapon Expert rank' } },
  { id: 'void_bolts', name: 'Void Bolts', bulletColor: 0x9900ff, bulletShape: 'bolt', muzzleColor: 0x6600cc, trailColor: 0x9900ff, unlock: { type: 'prestige', value: 3, description: 'Prestige Level 3' } },
  { id: 'plasma_beam', name: 'Plasma Beams', bulletColor: 0x00ff66, bulletShape: 'beam', muzzleColor: 0x00cc44, trailColor: 0x00ff66, unlock: { type: 'floor', value: 80, description: 'Reach Floor 80' } },
  { id: 'golden_rounds', name: 'Golden Rounds', bulletColor: 0xffd700, bulletShape: 'circle', muzzleColor: 0xffd700, trailColor: 0xffd700, unlock: { type: 'victory_count', value: 5, description: '5 victories' } },
]

// ─── Kill Effect ────────────────────────────────────────────────────────

export type KillEffectType = 'explosion' | 'dissolve' | 'shatter' | 'vaporize' | 'implode' | 'lightning'

export interface KillEffectDef {
  id: string
  name: string
  effectType: KillEffectType
  color: number
  unlock: UnlockCondition
}

export const KILL_EFFECTS: KillEffectDef[] = [
  { id: 'default', name: 'Default Explosion', effectType: 'explosion', color: 0xff0000, unlock: { type: 'free', value: 0, description: 'Default death effect' } },
  { id: 'shatter', name: 'Shatter', effectType: 'shatter', color: 0x00ccff, unlock: { type: 'kills', value: 5000, description: '5,000 total kills' } },
  { id: 'dissolve', name: 'Dissolve', effectType: 'dissolve', color: 0x00ff00, unlock: { type: 'kills', value: 8000, description: '8,000 total kills' } },
  { id: 'vaporize', name: 'Vaporize', effectType: 'vaporize', color: 0xff6600, unlock: { type: 'prestige', value: 10, description: 'Prestige Level 10' } },
  { id: 'implode', name: 'Implode', effectType: 'implode', color: 0x9900ff, unlock: { type: 'floor', value: 130, description: 'Reach Floor 130' } },
  { id: 'lightning', name: 'Lightning Strike', effectType: 'lightning', color: 0xffff00, unlock: { type: 'boss_kills', value: 30, description: '30 bosses killed' } },
]

// ─── Title ──────────────────────────────────────────────────────────────

export interface TitleDef {
  id: string
  name: string
  displayText: string
  color: number
  unlock: UnlockCondition
}

export const TITLES: TitleDef[] = [
  { id: 'none', name: 'No Title', displayText: '', color: 0xffffff, unlock: { type: 'free', value: 0, description: 'Default' } },
  { id: 'dot_slayer', name: 'DOT SLAYER', displayText: 'DOT SLAYER', color: 0xff0000, unlock: { type: 'floor', value: 150, description: 'Beat Floor 150' } },
  { id: 'collector', name: 'THE COLLECTOR', displayText: 'THE COLLECTOR', color: 0xf1c40f, unlock: { type: 'codex_items', value: 80, description: '80% item codex' } },
  { id: 'hunter', name: 'THE HUNTER', displayText: 'THE HUNTER', color: 0xe74c3c, unlock: { type: 'codex_bestiary', value: 80, description: '80% bestiary' } },
  { id: 'legend', name: 'LEGENDARY', displayText: 'LEGENDARY', color: 0xffd700, unlock: { type: 'prestige', value: 15, description: 'Prestige Level 15' } },
  { id: 'speedrunner', name: 'SPEEDRUNNER', displayText: 'SPEEDRUNNER', color: 0x00d9ff, unlock: { type: 'victory_count', value: 20, description: '20 victories' } },
  { id: 'boss_slayer', name: 'BOSS SLAYER', displayText: 'BOSS SLAYER', color: 0xff6600, unlock: { type: 'boss_kills', value: 100, description: '100 bosses killed' } },
  { id: 'veteran', name: 'VETERAN', displayText: 'VETERAN', color: 0x7f8c8d, unlock: { type: 'kills', value: 50000, description: '50,000 total kills' } },
  { id: 'ascended', name: 'ASCENDED', displayText: 'ASCENDED', color: 0x9b59b6, unlock: { type: 'prestige', value: 20, description: 'Prestige Level 20' } },
  { id: 'immortal', name: 'IMMORTAL', displayText: 'IMMORTAL', color: 0xff00ff, unlock: { type: 'floor', value: 200, description: 'Reach Floor 200 (Endless)' } },
]

// ─── Trail Effect ───────────────────────────────────────────────────────

export interface TrailEffectDef {
  id: string
  name: string
  color: number
  particleSize: number
  unlock: UnlockCondition
}

export const TRAIL_EFFECTS: TrailEffectDef[] = [
  { id: 'none', name: 'No Trail', color: 0x000000, particleSize: 0, unlock: { type: 'free', value: 0, description: 'No trail' } },
  { id: 'fire_trail', name: 'Fire Trail', color: 0xff6600, particleSize: 4, unlock: { type: 'mastery', value: 5, description: 'Any weapon Master rank' } },
  { id: 'ice_trail', name: 'Ice Trail', color: 0x00ccff, particleSize: 3, unlock: { type: 'mastery', value: 5, description: 'Any weapon Master rank' } },
  { id: 'void_trail', name: 'Void Trail', color: 0x9900ff, particleSize: 5, unlock: { type: 'prestige', value: 8, description: 'Prestige Level 8' } },
  { id: 'golden_trail', name: 'Golden Trail', color: 0xffd700, particleSize: 4, unlock: { type: 'victory_count', value: 15, description: '15 victories' } },
]

// ─── Cosmetic Data ──────────────────────────────────────────────────────

interface CosmeticData {
  unlockedSkins: string[]
  unlockedWeaponSkins: string[]
  unlockedKillEffects: string[]
  unlockedTitles: string[]
  unlockedTrails: string[]
  equipped: {
    playerSkin: string
    weaponSkin: string
    killEffect: string
    title: string
    trailEffect: string
  }
}

const STORAGE_KEY = 'dotslayer_cosmetics'

export class CosmeticSystem {
  private static instance: CosmeticSystem
  private data: CosmeticData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): CosmeticSystem {
    if (!CosmeticSystem.instance) {
      CosmeticSystem.instance = new CosmeticSystem()
    }
    return CosmeticSystem.instance
  }

  // ── Persistence ──────────────────────────────────────────────────────

  private load(): CosmeticData {
    if (typeof localStorage === 'undefined') return this.defaultData()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CosmeticData
        if (!parsed.unlockedSkins) parsed.unlockedSkins = ['default']
        if (!parsed.unlockedWeaponSkins) parsed.unlockedWeaponSkins = ['default']
        if (!parsed.unlockedKillEffects) parsed.unlockedKillEffects = ['default']
        if (!parsed.unlockedTitles) parsed.unlockedTitles = ['none']
        if (!parsed.unlockedTrails) parsed.unlockedTrails = ['none']
        if (!parsed.equipped) parsed.equipped = this.defaultData().equipped
        return parsed
      }
    } catch (e) {
      console.warn('Failed to load cosmetic data:', e)
    }
    return this.defaultData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save cosmetic data:', e)
    }
  }

  private defaultData(): CosmeticData {
    return {
      unlockedSkins: ['default'],
      unlockedWeaponSkins: ['default'],
      unlockedKillEffects: ['default'],
      unlockedTitles: ['none'],
      unlockedTrails: ['none'],
      equipped: {
        playerSkin: 'default',
        weaponSkin: 'default',
        killEffect: 'default',
        title: 'none',
        trailEffect: 'none',
      },
    }
  }

  // ── Unlock Checking ──────────────────────────────────────────────────

  /**
   * Check all cosmetics against current player stats and unlock any that qualify.
   * Returns array of newly unlocked cosmetic names.
   */
  checkAllUnlocks(stats: {
    totalKills: number
    prestigeLevel: number
    highestFloor: number
    maxMasteryRank: number // highest mastery rank (1-6)
    codexItemPercent: number
    codexBestiaryPercent: number
    bossKills: number
    companionLevel: number
    victoryCount: number
  }): string[] {
    const newlyUnlocked: string[] = []

    const checkCondition = (cond: UnlockCondition): boolean => {
      switch (cond.type) {
        case 'free': return true
        case 'kills': return stats.totalKills >= cond.value
        case 'prestige': return stats.prestigeLevel >= cond.value
        case 'floor': return stats.highestFloor >= cond.value
        case 'mastery': return stats.maxMasteryRank >= cond.value
        case 'codex_items': return stats.codexItemPercent >= cond.value
        case 'codex_bestiary': return stats.codexBestiaryPercent >= cond.value
        case 'boss_kills': return stats.bossKills >= cond.value
        case 'companion_level': return stats.companionLevel >= cond.value
        case 'victory_count': return stats.victoryCount >= cond.value
        default: return false
      }
    }

    // Player skins
    for (const skin of PLAYER_SKINS) {
      if (!this.data.unlockedSkins.includes(skin.id) && checkCondition(skin.unlock)) {
        this.data.unlockedSkins.push(skin.id)
        newlyUnlocked.push(`Skin: ${skin.name}`)
      }
    }

    // Weapon skins
    for (const skin of WEAPON_SKINS) {
      if (!this.data.unlockedWeaponSkins.includes(skin.id) && checkCondition(skin.unlock)) {
        this.data.unlockedWeaponSkins.push(skin.id)
        newlyUnlocked.push(`Weapon Skin: ${skin.name}`)
      }
    }

    // Kill effects
    for (const effect of KILL_EFFECTS) {
      if (!this.data.unlockedKillEffects.includes(effect.id) && checkCondition(effect.unlock)) {
        this.data.unlockedKillEffects.push(effect.id)
        newlyUnlocked.push(`Kill Effect: ${effect.name}`)
      }
    }

    // Titles
    for (const title of TITLES) {
      if (!this.data.unlockedTitles.includes(title.id) && checkCondition(title.unlock)) {
        this.data.unlockedTitles.push(title.id)
        newlyUnlocked.push(`Title: ${title.name}`)
      }
    }

    // Trail effects
    for (const trail of TRAIL_EFFECTS) {
      if (!this.data.unlockedTrails.includes(trail.id) && checkCondition(trail.unlock)) {
        this.data.unlockedTrails.push(trail.id)
        newlyUnlocked.push(`Trail: ${trail.name}`)
      }
    }

    if (newlyUnlocked.length > 0) this.save()
    return newlyUnlocked
  }

  // ── Equip / Get Active ───────────────────────────────────────────────

  equip(category: CosmeticCategory, id: string): boolean {
    switch (category) {
      case 'playerSkin':
        if (!this.data.unlockedSkins.includes(id)) return false
        this.data.equipped.playerSkin = id
        break
      case 'weaponSkin':
        if (!this.data.unlockedWeaponSkins.includes(id)) return false
        this.data.equipped.weaponSkin = id
        break
      case 'killEffect':
        if (!this.data.unlockedKillEffects.includes(id)) return false
        this.data.equipped.killEffect = id
        break
      case 'title':
        if (!this.data.unlockedTitles.includes(id)) return false
        this.data.equipped.title = id
        break
      case 'trailEffect':
        if (!this.data.unlockedTrails.includes(id)) return false
        this.data.equipped.trailEffect = id
        break
      default:
        return false
    }
    this.save()
    return true
  }

  getActivePlayerSkin(): PlayerSkinDef {
    return PLAYER_SKINS.find(s => s.id === this.data.equipped.playerSkin) || PLAYER_SKINS[0]
  }

  getActiveWeaponSkin(): WeaponSkinDef {
    return WEAPON_SKINS.find(s => s.id === this.data.equipped.weaponSkin) || WEAPON_SKINS[0]
  }

  getActiveKillEffect(): KillEffectDef {
    return KILL_EFFECTS.find(e => e.id === this.data.equipped.killEffect) || KILL_EFFECTS[0]
  }

  getActiveTitle(): TitleDef {
    return TITLES.find(t => t.id === this.data.equipped.title) || TITLES[0]
  }

  getActiveTrailEffect(): TrailEffectDef {
    return TRAIL_EFFECTS.find(t => t.id === this.data.equipped.trailEffect) || TRAIL_EFFECTS[0]
  }

  // ── Getters for UI ───────────────────────────────────────────────────

  getAllPlayerSkins(): (PlayerSkinDef & { unlocked: boolean })[] {
    return PLAYER_SKINS.map(s => ({ ...s, unlocked: this.data.unlockedSkins.includes(s.id) }))
  }

  getAllWeaponSkins(): (WeaponSkinDef & { unlocked: boolean })[] {
    return WEAPON_SKINS.map(s => ({ ...s, unlocked: this.data.unlockedWeaponSkins.includes(s.id) }))
  }

  getAllKillEffects(): (KillEffectDef & { unlocked: boolean })[] {
    return KILL_EFFECTS.map(e => ({ ...e, unlocked: this.data.unlockedKillEffects.includes(e.id) }))
  }

  getAllTitles(): (TitleDef & { unlocked: boolean })[] {
    return TITLES.map(t => ({ ...t, unlocked: this.data.unlockedTitles.includes(t.id) }))
  }

  getAllTrailEffects(): (TrailEffectDef & { unlocked: boolean })[] {
    return TRAIL_EFFECTS.map(t => ({ ...t, unlocked: this.data.unlockedTrails.includes(t.id) }))
  }

  getEquipped() {
    return { ...this.data.equipped }
  }
}

export const cosmeticSystem = CosmeticSystem.getInstance()
