import { FloorGenerator, FloorLayout } from './FloorGenerator'
import { EnemyType } from './EnemyTypes'

export interface FloorConfig {
  floorNumber: number
  layout: FloorLayout
  enemyCount: number
  enemyTypes: EnemyType[]
  difficultyMultiplier: number
  itemDropChance: number
  specialModifier?: 'boss_floor' | 'elite_floor' | 'treasure_floor' | 'mini_boss_floor'
}

export class FloorManager {
  private currentFloor = 1
  private generator: FloorGenerator
  private readonly maxFloors = 150

  constructor(seed?: number) {
    this.generator = new FloorGenerator(seed)
  }

  getCurrentFloor(): FloorConfig {
    const layout = this.generator.generate(this.currentFloor)

    return {
      floorNumber: this.currentFloor,
      layout,
      enemyCount: this.calculateEnemyCount(),
      enemyTypes: this.getEnemyTypes(),
      difficultyMultiplier: this.getDifficultyMultiplier(),
      itemDropChance: this.getItemDropChance(),
      specialModifier: this.getSpecialModifier()
    }
  }

  nextFloor(): boolean {
    if (this.currentFloor < this.maxFloors) {
      this.currentFloor++
      return true
    }
    return false
  }

  getCurrentFloorNumber(): number {
    return this.currentFloor
  }

  getTotalFloors(): number {
    return this.maxFloors
  }

  setFloor(floorNumber: number) {
    if (floorNumber >= 1 && floorNumber <= this.maxFloors) {
      this.currentFloor = floorNumber
    }
  }

  private calculateEnemyCount(): number {
    // AGGRESSIVE: Lots of enemies from the start for fast action!
    // Floor 1: 35 enemies
    // Floor 10: 75 enemies
    // Floor 25: 150 enemies
    // Floor 50: 300 enemies
    // Floor 75: 500 enemies
    // Floor 100: 750 enemies
    // Floor 125: 1100 enemies
    // Floor 150: 1500 enemies
    const base = 35
    const linearScale = this.currentFloor * 4
    const exponentialScale = Math.floor(Math.pow(this.currentFloor / 8, 1.8) * 15)
    // Extra scaling for floors 100+
    const lateGameBonus = this.currentFloor > 100 ? Math.floor(Math.pow((this.currentFloor - 100) / 5, 1.5) * 20) : 0
    return base + linearScale + exponentialScale + lateGameBonus
  }

  private getEnemyTypes(): EnemyType[] {
    const floor = this.currentFloor

    // REBALANCED: Gradual enemy type introduction with TONS of variety!
    if (floor < 5) {
      // Very early: Just basics
      return [EnemyType.GRUNT, EnemyType.SCOUT, EnemyType.SWARM]
    } else if (floor < 10) {
      // Early floors: Add chargers for excitement
      return [EnemyType.GRUNT, EnemyType.SCOUT, EnemyType.SWARM, EnemyType.CHARGER]
    } else if (floor < 15) {
      // Introduce tanks, ghosts, and exploders
      return [EnemyType.GRUNT, EnemyType.SCOUT, EnemyType.TANK, EnemyType.SWARM, EnemyType.GHOST, EnemyType.EXPLODER, EnemyType.CHARGER]
    } else if (floor < 25) {
      // Introduce snipers, shielders, teleporters, and ninjas
      return [EnemyType.GRUNT, EnemyType.SCOUT, EnemyType.TANK, EnemyType.SNIPER, EnemyType.SHIELDER, EnemyType.TELEPORTER, EnemyType.NINJA, EnemyType.EXPLODER]
    } else if (floor < 35) {
      // Introduce berserkers, bombers, splitters, and juggernauts
      return [EnemyType.SCOUT, EnemyType.TANK, EnemyType.SNIPER, EnemyType.BERSERKER, EnemyType.BOMBER, EnemyType.SHIELDER, EnemyType.SPLITTER, EnemyType.JUGGERNAUT, EnemyType.CHARGER]
    } else if (floor < 50) {
      // Introduce assassins, healers, vampires, and necromancers
      return [EnemyType.SCOUT, EnemyType.TANK, EnemyType.SNIPER, EnemyType.BERSERKER, EnemyType.ASSASSIN, EnemyType.HEALER, EnemyType.VAMPIRE, EnemyType.TELEPORTER, EnemyType.NECROMANCER, EnemyType.NINJA]
    } else if (floor < 70) {
      // Elite mix with all special types
      return [EnemyType.TANK, EnemyType.SNIPER, EnemyType.BERSERKER, EnemyType.ASSASSIN, EnemyType.BOMBER, EnemyType.HEALER, EnemyType.SHIELDER, EnemyType.VAMPIRE, EnemyType.SPLITTER, EnemyType.GHOST, EnemyType.JUGGERNAUT, EnemyType.NINJA, EnemyType.NECROMANCER, EnemyType.EXPLODER, EnemyType.CHARGER]
    } else if (floor < 100) {
      // Late game: EVERYTHING including mini-bosses - pure chaos!
      return [EnemyType.TANK, EnemyType.SNIPER, EnemyType.BERSERKER, EnemyType.ASSASSIN, EnemyType.BOMBER, EnemyType.HEALER, EnemyType.SHIELDER, EnemyType.TELEPORTER, EnemyType.VAMPIRE, EnemyType.SPLITTER, EnemyType.GHOST, EnemyType.BOSS, EnemyType.JUGGERNAUT, EnemyType.NINJA, EnemyType.NECROMANCER, EnemyType.EXPLODER, EnemyType.CHARGER]
    } else if (floor < 120) {
      // Floors 100-119: Introduce Mechanical tier enemies
      return [EnemyType.TANK, EnemyType.SNIPER, EnemyType.BERSERKER, EnemyType.ASSASSIN, EnemyType.HEALER, EnemyType.SHIELDER, EnemyType.VAMPIRE, EnemyType.JUGGERNAUT, EnemyType.NINJA, EnemyType.NECROMANCER,
        // Mechanical tier
        EnemyType.DRONE, EnemyType.SIEGE_BOT, EnemyType.OVERCLOCKER, EnemyType.TESLA_COIL, EnemyType.ASSEMBLER, EnemyType.MECH_TITAN,
        // Legendary
        EnemyType.SHADOWLORD, EnemyType.WARDEN, EnemyType.CORRUPTED, EnemyType.MIRROR, EnemyType.BERSERKER_KING]
    } else {
      // Floors 120-150: Introduce Void tier - ULTIMATE CHAOS!
      return [EnemyType.BERSERKER, EnemyType.ASSASSIN, EnemyType.HEALER, EnemyType.SHIELDER, EnemyType.VAMPIRE, EnemyType.JUGGERNAUT, EnemyType.NINJA, EnemyType.NECROMANCER,
        // Mechanical tier
        EnemyType.DRONE, EnemyType.SIEGE_BOT, EnemyType.OVERCLOCKER, EnemyType.TESLA_COIL, EnemyType.ASSEMBLER, EnemyType.MECH_TITAN,
        // Void tier
        EnemyType.VOID_WALKER, EnemyType.ENTROPY, EnemyType.NULLIFIER, EnemyType.ABYSSAL, EnemyType.VOID_PROPHET, EnemyType.RIFT_STALKER,
        // Legendary
        EnemyType.SHADOWLORD, EnemyType.WARDEN, EnemyType.CORRUPTED, EnemyType.MIRROR, EnemyType.BERSERKER_KING]
    }
  }

  private getDifficultyMultiplier(): number {
    // MASSIVELY REBALANCED: Exponential curve to match player damage scaling!
    // Floor 1: 1.0x, Floor 50: 2,500x, Floor 100: 20,000x
    // Floor 125: 80,000x, Floor 150: 300,000x
    const floor = this.currentFloor

    // Aggressive exponential scaling that matches player power curve
    const baseMult = Math.pow(floor, 2.2) / 5
    const exponentialBoost = Math.pow(1.15, floor)

    // Steeper scaling for floors 100+ (endgame content)
    const lateGameMultiplier = floor > 100 ? Math.pow(1.05, floor - 100) : 1

    return Math.max(1, baseMult * exponentialBoost * lateGameMultiplier / 10)
  }

  private getItemDropChance(): number {
    // Base 15% drop chance, +0.5% per floor (capped at 75%)
    // Floor 1: 15%, Floor 50: 40%, Floor 100: 65%, Floor 150: 75%
    const baseChance = 0.15
    const perFloorIncrease = 0.005
    const maxChance = 0.75
    // Bonus drop chance above floor 100
    const lateGameBonus = this.currentFloor > 100 ? 0.002 * (this.currentFloor - 100) : 0

    return Math.min(maxChance, baseChance + (this.currentFloor * perFloorIncrease) + lateGameBonus)
  }

  private getSpecialModifier(): FloorConfig['specialModifier'] {
    const floor = this.currentFloor

    // Boss floor every 10 floors
    if (floor % 10 === 0) {
      return 'boss_floor'
    }

    // Mini-boss floors: 5, 15, 25, 35... (every 10 offset by 5)
    if (floor >= 5 && floor % 10 === 5) {
      return 'mini_boss_floor'
    }

    // Elite floor every 5 floors (but not boss or mini-boss floors)
    if (floor % 5 === 0) {
      return 'elite_floor'
    }

    // Treasure floor (random chance - higher above floor 100)
    const treasureChance = floor > 100 ? 0.15 : 0.1
    if (floor > 10 && Math.random() < treasureChance) {
      return 'treasure_floor'
    }

    return undefined
  }

  // Get stats for display
  getFloorStats(): {
    current: number
    total: number
    difficulty: string
    enemyCount: number
  } {
    return {
      current: this.currentFloor,
      total: this.maxFloors,
      difficulty: `${(this.getDifficultyMultiplier() * 100).toFixed(0)}%`,
      enemyCount: this.calculateEnemyCount()
    }
  }
}
