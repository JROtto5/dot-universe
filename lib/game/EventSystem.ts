/**
 * EventSystem - Procedural floor events and NPC encounters
 * Persistent across runs via localStorage (for lifetime stats)
 */

// ─── Floor Event Definitions ────────────────────────────────────────────

export type FloorEventType = 'treasure_goblin' | 'elite_ambush' | 'shop_caravan' | 'blessing_shrine' | 'cursed_chest'

export interface FloorEventConfig {
  type: FloorEventType
  name: string
  icon: string
  description: string
  weight: number
  minFloor: number
}

export const FLOOR_EVENTS: FloorEventConfig[] = [
  { type: 'treasure_goblin', name: 'Treasure Goblin', icon: '💰', description: 'A gold-laden goblin! Kill it in 10s for bonus loot!', weight: 20, minFloor: 5 },
  { type: 'elite_ambush', name: 'Elite Ambush', icon: '⚔️', description: 'Elite enemies ambush! Clear for bonus gold & XP.', weight: 25, minFloor: 8 },
  { type: 'shop_caravan', name: 'Shop Caravan', icon: '🏪', description: 'A traveling merchant with rare items!', weight: 20, minFloor: 3 },
  { type: 'blessing_shrine', name: 'Blessing Shrine', icon: '✨', description: 'Choose a powerful blessing lasting 5 floors!', weight: 20, minFloor: 5 },
  { type: 'cursed_chest', name: 'Cursed Chest', icon: '💀', description: 'Great power... at a cost. Accept or decline.', weight: 15, minFloor: 10 },
]

// ─── Blessing Definitions ───────────────────────────────────────────────

export interface BlessingDefinition {
  id: string
  name: string
  icon: string
  description: string
  stat: string
  value: number
  color: number
}

export const BLESSINGS: BlessingDefinition[] = [
  { id: 'power_surge', name: 'Power Surge', icon: '💥', description: '+25% Damage for 5 floors', stat: 'damagePercent', value: 25, color: 0xff0000 },
  { id: 'iron_skin', name: 'Iron Skin', icon: '🛡️', description: '+50 Max HP for 5 floors', stat: 'maxHP', value: 50, color: 0x7f8c8d },
  { id: 'golden_touch', name: 'Golden Touch', icon: '🪙', description: '+50% Gold for 5 floors', stat: 'goldPercent', value: 50, color: 0xffd700 },
  { id: 'swiftness', name: 'Swiftness', icon: '💨', description: '+30% Speed & Fire Rate for 5 floors', stat: 'speedFireRatePercent', value: 30, color: 0x3498db },
  { id: 'vampiric', name: 'Vampiric', icon: '🧛', description: '+5% Lifesteal for 5 floors', stat: 'lifestealPercent', value: 5, color: 0xc0392b },
  { id: 'eagle_eye', name: 'Eagle Eye', icon: '🦅', description: '+20% Crit Chance for 5 floors', stat: 'critPercent', value: 20, color: 0xf1c40f },
]

// ─── Curse Definitions ──────────────────────────────────────────────────

export interface CurseDefinition {
  id: string
  buffName: string
  buffDescription: string
  buffStat: string
  buffValue: number
  curseName: string
  curseDescription: string
  curseStat: string
  curseValue: number
}

export const CURSED_PAIRS: CurseDefinition[] = [
  { id: 'blood_pact', buffName: 'Blood Power', buffDescription: '+50% Damage', buffStat: 'damagePercent', buffValue: 50, curseName: 'Bloodletting', curseDescription: '-30% Max HP', curseStat: 'maxHPPercent', curseValue: -30 },
  { id: 'glass_cannon', buffName: 'Fragile Power', buffDescription: '+40% Fire Rate', buffStat: 'fireRatePercent', buffValue: 40, curseName: 'Paper Skin', curseDescription: '-25% Max HP', curseStat: 'maxHPPercent', curseValue: -25 },
  { id: 'devils_speed', buffName: 'Hellfire Sprint', buffDescription: '+50% Speed', buffStat: 'speedPercent', buffValue: 50, curseName: 'Frailty', curseDescription: '-20% Damage', curseStat: 'damagePercent', curseValue: -20 },
  { id: 'temporal_rift', buffName: 'Time Dilation', buffDescription: '+30% All Stats', buffStat: 'allPercent', buffValue: 30, curseName: 'Temporal Decay', curseDescription: 'Take 2 DPS', curseStat: 'dotDPS', curseValue: 2 },
]

// ─── NPC Definitions ────────────────────────────────────────────────────

export type NPCType = 'wandering_merchant' | 'blacksmith' | 'oracle' | 'bounty_hunter'

export interface NPCConfig {
  type: NPCType
  name: string
  icon: string
  description: string
  color: number
}

export const NPC_CONFIGS: Record<NPCType, NPCConfig> = {
  wandering_merchant: { type: 'wandering_merchant', name: 'Wandering Merchant', icon: '🧳', description: 'Sells rare items at premium prices', color: 0xffd700 },
  blacksmith: { type: 'blacksmith', name: 'Blacksmith', icon: '🔨', description: 'Repair and upgrade your weapons', color: 0xff6600 },
  oracle: { type: 'oracle', name: 'Oracle', icon: '🔮', description: 'See what lies ahead', color: 0x9b59b6 },
  bounty_hunter: { type: 'bounty_hunter', name: 'Bounty Hunter', icon: '🎯', description: 'Kill contracts for gold & materials', color: 0xe74c3c },
}

// ─── Bounty Definition ──────────────────────────────────────────────────

export interface BountyContract {
  targetType: string
  targetCount: number
  currentCount: number
  floorsRemaining: number
  goldReward: number
  materialReward: { type: 'shard' | 'essence'; amount: number }
  accepted: boolean
}

// ─── Active Blessing ────────────────────────────────────────────────────

export interface ActiveBlessing {
  blessing: BlessingDefinition
  floorsRemaining: number
}

export interface ActiveCurse {
  curse: CurseDefinition
  floorsRemaining: number
}

// ─── Event System Data ──────────────────────────────────────────────────

interface EventSystemData {
  lastEventFloor: number
  nextEventIn: number // floors until next event
  activeBlessings: ActiveBlessing[]
  activeCurses: ActiveCurse[]
  activeBounty: BountyContract | null
  // Lifetime stats
  totalEventsTriggered: number
  totalBlessingsChosen: number
  totalCursesAccepted: number
  totalBountiesCompleted: number
  totalNPCsVisited: number
}

const STORAGE_KEY = 'dotslayer_events'

export class EventSystem {
  private static instance: EventSystem
  private data: EventSystemData

  private constructor() {
    this.data = this.load()
  }

  static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem()
    }
    return EventSystem.instance
  }

  // ── Persistence ──────────────────────────────────────────────────────

  private load(): EventSystemData {
    if (typeof localStorage === 'undefined') return this.defaultData()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as EventSystemData
        if (!parsed.activeBlessings) parsed.activeBlessings = []
        if (!parsed.activeCurses) parsed.activeCurses = []
        if (parsed.totalEventsTriggered === undefined) parsed.totalEventsTriggered = 0
        if (parsed.totalBlessingsChosen === undefined) parsed.totalBlessingsChosen = 0
        if (parsed.totalCursesAccepted === undefined) parsed.totalCursesAccepted = 0
        if (parsed.totalBountiesCompleted === undefined) parsed.totalBountiesCompleted = 0
        if (parsed.totalNPCsVisited === undefined) parsed.totalNPCsVisited = 0
        return parsed
      }
    } catch (e) {
      console.warn('Failed to load event data:', e)
    }
    return this.defaultData()
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save event data:', e)
    }
  }

  private defaultData(): EventSystemData {
    return {
      lastEventFloor: 0,
      nextEventIn: 3 + Math.floor(Math.random() * 3), // 3-5 floors
      activeBlessings: [],
      activeCurses: [],
      activeBounty: null,
      totalEventsTriggered: 0,
      totalBlessingsChosen: 0,
      totalCursesAccepted: 0,
      totalBountiesCompleted: 0,
      totalNPCsVisited: 0,
    }
  }

  // ── Event Triggering ─────────────────────────────────────────────────

  /**
   * Check if a floor event should trigger on the given floor
   */
  shouldTriggerEvent(floorNumber: number): FloorEventConfig | null {
    if (floorNumber <= this.data.lastEventFloor) return null
    this.data.nextEventIn--

    if (this.data.nextEventIn > 0) return null

    // Time for an event! Pick one
    const eligible = FLOOR_EVENTS.filter(e => floorNumber >= e.minFloor)
    if (eligible.length === 0) return null

    const event = this.weightedPick(eligible)
    this.data.lastEventFloor = floorNumber
    this.data.nextEventIn = 3 + Math.floor(Math.random() * 3) // 3-5 floors until next
    this.data.totalEventsTriggered++
    this.save()
    return event
  }

  /**
   * Check if an NPC should spawn alongside an event (40% chance)
   */
  shouldSpawnNPC(): NPCType | null {
    if (Math.random() > 0.4) return null
    const types: NPCType[] = ['wandering_merchant', 'blacksmith', 'oracle', 'bounty_hunter']
    return types[Math.floor(Math.random() * types.length)]
  }

  private weightedPick(events: FloorEventConfig[]): FloorEventConfig {
    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0)
    let roll = Math.random() * totalWeight
    for (const event of events) {
      roll -= event.weight
      if (roll <= 0) return event
    }
    return events[events.length - 1]
  }

  // ── Blessings ────────────────────────────────────────────────────────

  /**
   * Get 3 random blessings for a shrine
   */
  getRandomBlessings(): BlessingDefinition[] {
    const shuffled = [...BLESSINGS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  /**
   * Activate a blessing for 5 floors
   */
  activateBlessing(blessingId: string): boolean {
    const blessing = BLESSINGS.find(b => b.id === blessingId)
    if (!blessing) return false

    // Replace if same type already active
    this.data.activeBlessings = this.data.activeBlessings.filter(
      ab => ab.blessing.stat !== blessing.stat
    )

    this.data.activeBlessings.push({ blessing, floorsRemaining: 5 })
    this.data.totalBlessingsChosen++
    this.save()
    return true
  }

  /**
   * Get a random cursed pair
   */
  getRandomCursedPair(): CurseDefinition {
    return CURSED_PAIRS[Math.floor(Math.random() * CURSED_PAIRS.length)]
  }

  /**
   * Accept a curse (buff + debuff for 5 floors)
   */
  acceptCurse(curseId: string): boolean {
    const curse = CURSED_PAIRS.find(c => c.id === curseId)
    if (!curse) return false

    this.data.activeCurses.push({ curse, floorsRemaining: 5 })
    this.data.totalCursesAccepted++
    this.save()
    return true
  }

  /**
   * Tick down blessing/curse floors. Call on each floor load.
   */
  tickFloor(): void {
    this.data.activeBlessings = this.data.activeBlessings
      .map(ab => ({ ...ab, floorsRemaining: ab.floorsRemaining - 1 }))
      .filter(ab => ab.floorsRemaining > 0)

    this.data.activeCurses = this.data.activeCurses
      .map(ac => ({ ...ac, floorsRemaining: ac.floorsRemaining - 1 }))
      .filter(ac => ac.floorsRemaining > 0)

    // Tick bounty floors
    if (this.data.activeBounty && this.data.activeBounty.accepted) {
      this.data.activeBounty.floorsRemaining--
      if (this.data.activeBounty.floorsRemaining <= 0) {
        this.data.activeBounty = null // Bounty expired
      }
    }

    this.save()
  }

  /**
   * Get aggregated bonus effects from all active blessings
   */
  getBlessingBonuses(): Record<string, number> {
    const bonuses: Record<string, number> = {}
    for (const ab of this.data.activeBlessings) {
      const stat = ab.blessing.stat
      if (stat === 'speedFireRatePercent') {
        bonuses.speedPercent = (bonuses.speedPercent || 0) + ab.blessing.value
        bonuses.fireRatePercent = (bonuses.fireRatePercent || 0) + ab.blessing.value
      } else {
        bonuses[stat] = (bonuses[stat] || 0) + ab.blessing.value
      }
    }
    return bonuses
  }

  /**
   * Get aggregated effects from all active curses
   */
  getCurseEffects(): Record<string, number> {
    const effects: Record<string, number> = {}
    for (const ac of this.data.activeCurses) {
      // Buff side
      const buffStat = ac.curse.buffStat
      if (buffStat === 'allPercent') {
        effects.damagePercent = (effects.damagePercent || 0) + ac.curse.buffValue
        effects.speedPercent = (effects.speedPercent || 0) + ac.curse.buffValue
        effects.fireRatePercent = (effects.fireRatePercent || 0) + ac.curse.buffValue
      } else {
        effects[buffStat] = (effects[buffStat] || 0) + ac.curse.buffValue
      }
      // Curse side
      effects[ac.curse.curseStat] = (effects[ac.curse.curseStat] || 0) + ac.curse.curseValue
    }
    return effects
  }

  getActiveBlessings(): ActiveBlessing[] {
    return [...this.data.activeBlessings]
  }

  getActiveCurses(): ActiveCurse[] {
    return [...this.data.activeCurses]
  }

  // ── Bounty System ────────────────────────────────────────────────────

  /**
   * Generate a bounty contract for the bounty hunter NPC
   */
  generateBounty(floorNumber: number, enemyTypes: string[]): BountyContract {
    const targetType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)] || 'grunt'
    const targetCount = 5 + Math.floor(floorNumber / 10) * 2
    const floorsRemaining = 5 + Math.floor(Math.random() * 3)
    const goldReward = 200 + floorNumber * 20
    const materialReward = Math.random() < 0.5
      ? { type: 'shard' as const, amount: 3 + Math.floor(floorNumber / 20) }
      : { type: 'essence' as const, amount: 2 + Math.floor(floorNumber / 30) }

    return {
      targetType,
      targetCount,
      currentCount: 0,
      floorsRemaining,
      goldReward,
      materialReward,
      accepted: false,
    }
  }

  /**
   * Accept a bounty contract
   */
  acceptBounty(bounty: BountyContract): void {
    bounty.accepted = true
    this.data.activeBounty = bounty
    this.save()
  }

  /**
   * Update bounty progress when an enemy is killed
   */
  updateBountyProgress(enemyType: string): { completed: boolean; bounty: BountyContract } | null {
    if (!this.data.activeBounty || !this.data.activeBounty.accepted) return null

    if (enemyType === this.data.activeBounty.targetType) {
      this.data.activeBounty.currentCount++

      if (this.data.activeBounty.currentCount >= this.data.activeBounty.targetCount) {
        const completedBounty = { ...this.data.activeBounty }
        this.data.activeBounty = null
        this.data.totalBountiesCompleted++
        this.save()
        return { completed: true, bounty: completedBounty }
      }

      this.save()
      return { completed: false, bounty: this.data.activeBounty }
    }

    return null
  }

  getActiveBounty(): BountyContract | null {
    return this.data.activeBounty
  }

  // ── NPC Visit Tracking ───────────────────────────────────────────────

  recordNPCVisit(): void {
    this.data.totalNPCsVisited++
    this.save()
  }

  // ── Run Reset ────────────────────────────────────────────────────────

  /**
   * Reset per-run state (blessings, curses, bounties) but keep lifetime stats
   */
  resetForNewRun(): void {
    this.data.lastEventFloor = 0
    this.data.nextEventIn = 3 + Math.floor(Math.random() * 3)
    this.data.activeBlessings = []
    this.data.activeCurses = []
    this.data.activeBounty = null
    this.save()
  }

  // ── Stats ────────────────────────────────────────────────────────────

  getStats() {
    return {
      totalEventsTriggered: this.data.totalEventsTriggered,
      totalBlessingsChosen: this.data.totalBlessingsChosen,
      totalCursesAccepted: this.data.totalCursesAccepted,
      totalBountiesCompleted: this.data.totalBountiesCompleted,
      totalNPCsVisited: this.data.totalNPCsVisited,
    }
  }
}

export const eventSystem = EventSystem.getInstance()
