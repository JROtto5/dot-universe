/**
 * CodexSystem - Bestiary, Item Codex, Artifact Codex, Run History, and Lifetime Stats
 * Persistent across runs via localStorage
 */

// ─── Bestiary Entry ─────────────────────────────────────────────────────

export interface BestiaryEntry {
  type: string
  name: string
  encounterCount: number
  killCount: number
  firstFloorSeen: number
  color: number
  hp: number
  speed: number
  damage: number
  size: number
}

// ─── Item Codex Entry ───────────────────────────────────────────────────

export interface ItemCodexEntry {
  id: string
  name: string
  rarity: string
  discovered: boolean
  timesCollected: number
  firstDiscoveredFloor: number
  description: string
  color: number
}

// ─── Artifact Codex Entry ───────────────────────────────────────────────

export interface ArtifactCodexEntry {
  id: string
  name: string
  icon: string
  rarity: string
  discovered: boolean
  timesFound: number
  description: string
}

// ─── Run Record ─────────────────────────────────────────────────────────

export interface RunRecord {
  id: string
  date: string
  floorReached: number
  totalKills: number
  bossesKilled: number
  timePlayed: number // ms
  score: number
  goldEarned: number
  itemsCollected: number
  legendariesFound: number
  highestCombo: number
  damageDealt: number
  damageTaken: number
  causeOfDeath: string
  playerClass: string
  weaponUsed: string
  artifactUsed: string
  isVictory: boolean
  gameMode: string
}

// ─── Lifetime Stats ─────────────────────────────────────────────────────

export interface LifetimeStats {
  totalRuns: number
  totalKills: number
  totalDeaths: number
  totalVictories: number
  totalTimePlayed: number // ms
  totalGoldEarned: number
  totalDamageDealt: number
  highestFloorEver: number
  highestComboEver: number
  fastestVictoryMs: number
  favoriteWeapon: string
  favoriteClass: string
}

// ─── Codex Data ─────────────────────────────────────────────────────────

interface CodexData {
  bestiary: Record<string, BestiaryEntry>
  items: Record<string, ItemCodexEntry>
  artifacts: Record<string, ArtifactCodexEntry>
  runHistory: RunRecord[]
  lifetimeStats: LifetimeStats
  weaponKillCounts: Record<string, number>
  classRunCounts: Record<string, number>
}

const STORAGE_KEY = 'dotslayer_codex'
const MAX_RUN_HISTORY = 20

export class CodexSystem {
  private static instance: CodexSystem
  private data: CodexData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): CodexSystem {
    if (!CodexSystem.instance) {
      CodexSystem.instance = new CodexSystem()
    }
    return CodexSystem.instance
  }

  // ── Persistence ──────────────────────────────────────────────────────

  private load(): CodexData {
    if (typeof localStorage === 'undefined') return this.defaultData()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CodexData
        if (!parsed.bestiary) parsed.bestiary = {}
        if (!parsed.items) parsed.items = {}
        if (!parsed.artifacts) parsed.artifacts = {}
        if (!parsed.runHistory) parsed.runHistory = []
        if (!parsed.lifetimeStats) parsed.lifetimeStats = this.defaultLifetimeStats()
        if (!parsed.weaponKillCounts) parsed.weaponKillCounts = {}
        if (!parsed.classRunCounts) parsed.classRunCounts = {}
        return parsed
      }
    } catch (e) {
      console.warn('Failed to load codex data:', e)
    }
    return this.defaultData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save codex data:', e)
    }
  }

  private defaultData(): CodexData {
    return {
      bestiary: {},
      items: {},
      artifacts: {},
      runHistory: [],
      lifetimeStats: this.defaultLifetimeStats(),
      weaponKillCounts: {},
      classRunCounts: {},
    }
  }

  private defaultLifetimeStats(): LifetimeStats {
    return {
      totalRuns: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalVictories: 0,
      totalTimePlayed: 0,
      totalGoldEarned: 0,
      totalDamageDealt: 0,
      highestFloorEver: 0,
      highestComboEver: 0,
      fastestVictoryMs: 0,
      favoriteWeapon: '',
      favoriteClass: '',
    }
  }

  // ── Bestiary ─────────────────────────────────────────────────────────

  /**
   * Record encountering an enemy type (when spawned)
   */
  recordEnemyEncounter(type: string, name: string, floorNumber: number, stats: { hp: number; speed: number; damage: number; color: number; size: number }): void {
    if (!this.data.bestiary[type]) {
      this.data.bestiary[type] = {
        type,
        name,
        encounterCount: 0,
        killCount: 0,
        firstFloorSeen: floorNumber,
        color: stats.color,
        hp: stats.hp,
        speed: stats.speed,
        damage: stats.damage,
        size: stats.size,
      }
    }
    this.data.bestiary[type].encounterCount++
    // Don't save on every encounter — batch save at floor end
  }

  /**
   * Record killing an enemy type
   */
  recordEnemyKill(type: string, weaponName?: string): void {
    if (this.data.bestiary[type]) {
      this.data.bestiary[type].killCount++
    }
    if (weaponName) {
      this.data.weaponKillCounts[weaponName] = (this.data.weaponKillCounts[weaponName] || 0) + 1
    }
    // Don't save on every kill — batch save at floor end / game over
  }

  /**
   * Get bestiary completion percentage
   */
  getBestiaryCompletion(): { discovered: number; total: number; percent: number } {
    const entries = Object.values(this.data.bestiary)
    const discovered = entries.filter(e => e.killCount > 0).length
    // Estimate total enemy types from what we've seen
    const total = Math.max(entries.length, 20) // At least 20 known types
    return { discovered, total, percent: total > 0 ? Math.floor((discovered / total) * 100) : 0 }
  }

  getBestiary(): BestiaryEntry[] {
    return Object.values(this.data.bestiary).sort((a, b) => b.killCount - a.killCount)
  }

  // ── Item Codex ───────────────────────────────────────────────────────

  /**
   * Record discovering/collecting an item
   */
  recordItemDiscovery(id: string, name: string, rarity: string, floorNumber: number, description: string, color: number): void {
    if (!this.data.items[id]) {
      this.data.items[id] = {
        id,
        name,
        rarity,
        discovered: true,
        timesCollected: 0,
        firstDiscoveredFloor: floorNumber,
        description,
        color,
      }
    }
    this.data.items[id].timesCollected++
    this.data.items[id].discovered = true
    // Batch save
  }

  /**
   * Get item codex completion percentage
   */
  getItemCodexCompletion(): { discovered: number; total: number; percent: number } {
    const entries = Object.values(this.data.items)
    const discovered = entries.filter(e => e.discovered).length
    const total = Math.max(entries.length, 15) // At least 15 known items
    return { discovered, total, percent: total > 0 ? Math.floor((discovered / total) * 100) : 0 }
  }

  getItemCodex(): ItemCodexEntry[] {
    return Object.values(this.data.items).sort((a, b) => {
      const rarityOrder: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
    })
  }

  // ── Artifact Codex ───────────────────────────────────────────────────

  /**
   * Record discovering an artifact
   */
  recordArtifactDiscovery(id: string, name: string, icon: string, rarity: string, description: string): void {
    if (!this.data.artifacts[id]) {
      this.data.artifacts[id] = { id, name, icon, rarity, discovered: true, timesFound: 0, description }
    }
    this.data.artifacts[id].timesFound++
    this.data.artifacts[id].discovered = true
  }

  getArtifactCodex(): ArtifactCodexEntry[] {
    return Object.values(this.data.artifacts).sort((a, b) => b.timesFound - a.timesFound)
  }

  // ── Run History ──────────────────────────────────────────────────────

  /**
   * Record a completed run (victory or death)
   */
  recordRun(run: Omit<RunRecord, 'id' | 'date'>): void {
    const record: RunRecord = {
      ...run,
      id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
    }

    this.data.runHistory.unshift(record)

    // Keep only the last N runs
    if (this.data.runHistory.length > MAX_RUN_HISTORY) {
      this.data.runHistory = this.data.runHistory.slice(0, MAX_RUN_HISTORY)
    }

    // Update lifetime stats
    const stats = this.data.lifetimeStats
    stats.totalRuns++
    stats.totalKills += run.totalKills
    stats.totalGoldEarned += run.goldEarned
    stats.totalDamageDealt += run.damageDealt
    stats.totalTimePlayed += run.timePlayed

    if (run.isVictory) {
      stats.totalVictories++
      if (stats.fastestVictoryMs === 0 || run.timePlayed < stats.fastestVictoryMs) {
        stats.fastestVictoryMs = run.timePlayed
      }
    } else {
      stats.totalDeaths++
    }

    if (run.floorReached > stats.highestFloorEver) {
      stats.highestFloorEver = run.floorReached
    }
    if (run.highestCombo > stats.highestComboEver) {
      stats.highestComboEver = run.highestCombo
    }

    // Track class usage
    if (run.playerClass) {
      this.data.classRunCounts[run.playerClass] = (this.data.classRunCounts[run.playerClass] || 0) + 1
    }

    // Compute favorites
    const weaponEntries = Object.entries(this.data.weaponKillCounts)
    if (weaponEntries.length > 0) {
      stats.favoriteWeapon = weaponEntries.sort((a, b) => b[1] - a[1])[0][0]
    }
    const classEntries = Object.entries(this.data.classRunCounts)
    if (classEntries.length > 0) {
      stats.favoriteClass = classEntries.sort((a, b) => b[1] - a[1])[0][0]
    }

    this.save()
  }

  /**
   * Get run history (most recent first)
   */
  getRunHistory(): RunRecord[] {
    return [...this.data.runHistory]
  }

  /**
   * Get best runs sorted by score
   */
  getBestRuns(limit: number = 5): RunRecord[] {
    return [...this.data.runHistory]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get the last recorded run
   */
  getLastRun(): RunRecord | null {
    return this.data.runHistory[0] || null
  }

  // ── Lifetime Stats ───────────────────────────────────────────────────

  getLifetimeStats(): LifetimeStats {
    return { ...this.data.lifetimeStats }
  }

  // ── Batch Save ───────────────────────────────────────────────────────

  /**
   * Force save (call at end of floor or end of game to batch bestiary/item saves)
   */
  forceSave(): void {
    this.save()
  }
}

export const codexSystem = CodexSystem.getInstance()
