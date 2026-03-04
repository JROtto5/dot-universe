import * as Phaser from 'phaser'
import Player from './Player'

export enum EnemyType {
  GRUNT = 'grunt',
  SCOUT = 'scout',
  TANK = 'tank',
  SNIPER = 'sniper',
  BERSERKER = 'berserker',
  BOSS = 'boss',
  // ENEMY TYPES
  ASSASSIN = 'assassin',
  BOMBER = 'bomber',
  HEALER = 'healer',
  SHIELDER = 'shielder',
  // NEW ENEMIES - More variety!
  TELEPORTER = 'teleporter',
  SWARM = 'swarm',
  VAMPIRE = 'vampire',
  SPLITTER = 'splitter',
  GHOST = 'ghost',
  // EVEN MORE ENEMIES!
  JUGGERNAUT = 'juggernaut',  // Ultra tank - slow but tons of HP
  NINJA = 'ninja',            // Fast and dodges attacks
  NECROMANCER = 'necromancer', // Summons minions
  EXPLODER = 'exploder',      // Explodes on death
  CHARGER = 'charger',        // Charges at player in straight line
  // ═══════════════════════════════════════════════════════════════
  // LEGENDARY TIER ENEMIES - Ultra rare, ultra deadly!
  // ═══════════════════════════════════════════════════════════════
  SHADOWLORD = 'shadowlord',  // Creates shadow clones
  WARDEN = 'warden',          // Spawns shields and barriers
  CORRUPTED = 'corrupted',    // Leaves poison trails
  MIRROR = 'mirror',          // Reflects damage back
  BERSERKER_KING = 'berserker_king', // Ultimate berserker
  // ═══════════════════════════════════════════════════════════════
  // VOID TIER ENEMIES - Reality-bending threats from the abyss!
  // ═══════════════════════════════════════════════════════════════
  VOID_WALKER = 'void_walker',     // Phases in/out of reality
  ENTROPY = 'entropy',             // Reduces player damage on hit
  NULLIFIER = 'nullifier',         // Disables active power-ups
  ABYSSAL = 'abyssal',             // Grows stronger over time
  VOID_PROPHET = 'void_prophet',   // Buffs nearby void enemies
  RIFT_STALKER = 'rift_stalker',   // Teleports behind player
  // ═══════════════════════════════════════════════════════════════
  // MECHANICAL TIER ENEMIES - Robotic precision threats!
  // ═══════════════════════════════════════════════════════════════
  DRONE = 'drone',                 // Fast formation flyer
  SIEGE_BOT = 'siege_bot',         // Slow ranged mortar
  OVERCLOCKER = 'overclocker',     // Speeds up nearby mechs
  TESLA_COIL = 'tesla_coil',       // Stationary area zapper
  ASSEMBLER = 'assembler',         // Builds mini-drones
  MECH_TITAN = 'mech_titan',       // Heavy mech
}

export interface EnemyStats {
  health: number
  speed: number
  damage: number
  attackRange: number
  attackSpeed: number
  moneyDrop: [number, number]
  xpDrop: [number, number]
  color: number
  size: number
  behavior: 'chase' | 'ranged' | 'tank' | 'fast' | 'berserker'
}

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  [EnemyType.GRUNT]: {
    health: 50,
    speed: 200, // MUCH FASTER! (was 140)
    damage: 5,
    attackRange: 400, // Larger range
    attackSpeed: 1000,
    moneyDrop: [10, 30],
    xpDrop: [5, 15],
    color: 0xff6b6b, // Red dot
    size: 16,
    behavior: 'chase',
  },
  [EnemyType.SCOUT]: {
    health: 30,
    speed: 300, // ULTRA FAST! (was 220)
    damage: 3,
    attackRange: 350,
    attackSpeed: 500,
    moneyDrop: [15, 35],
    xpDrop: [8, 18],
    color: 0x4ecdc4, // Cyan dot
    size: 12,
    behavior: 'fast',
  },
  [EnemyType.TANK]: {
    health: 200,
    speed: 110, // Much faster tank (was 70)
    damage: 15,
    attackRange: 400,
    attackSpeed: 2000,
    moneyDrop: [30, 80],
    xpDrop: [25, 50],
    color: 0x9b59b6, // Purple dot
    size: 24,
    behavior: 'tank',
  },
  [EnemyType.SNIPER]: {
    health: 40,
    speed: 150, // Much faster (was 100)
    damage: 25,
    attackRange: 600,
    attackSpeed: 2500, // Shoots faster (was 3000)
    moneyDrop: [20, 50],
    xpDrop: [15, 30],
    color: 0xf1c40f, // Yellow dot
    size: 14,
    behavior: 'ranged',
  },
  [EnemyType.BERSERKER]: {
    health: 100,
    speed: 240, // ULTRA FAST! (was 170)
    damage: 20,
    attackRange: 450,
    attackSpeed: 600,
    moneyDrop: [40, 90],
    xpDrop: [30, 60],
    color: 0xe74c3c, // Dark red dot
    size: 20,
    behavior: 'berserker',
  },
  [EnemyType.BOSS]: {
    health: 500,
    speed: 130, // Much faster boss (was 90)
    damage: 30,
    attackRange: 550,
    attackSpeed: 1200, // Attacks faster (was 1500)
    moneyDrop: [200, 500],
    xpDrop: [100, 200],
    color: 0x00ff00, // Bright green dot (Matrix style)
    size: 40,
    behavior: 'tank',
  },
  // NEW ENEMY TYPES FOR VARIETY!
  [EnemyType.ASSASSIN]: {
    health: 60,
    speed: 350, // ULTRA fast
    damage: 40, // High damage
    attackRange: 300,
    attackSpeed: 800,
    moneyDrop: [50, 100],
    xpDrop: [30, 50],
    color: 0x2c3e50, // Dark grey - stealthy
    size: 14,
    behavior: 'fast', // Dart in and out
  },
  [EnemyType.BOMBER]: {
    health: 80,
    speed: 180,
    damage: 60, // Explodes on contact!
    attackRange: 500,
    attackSpeed: 3000,
    moneyDrop: [35, 70],
    xpDrop: [25, 45],
    color: 0xff9500, // Orange - explosive
    size: 18,
    behavior: 'chase', // Rushes player to explode
  },
  [EnemyType.HEALER]: {
    health: 120,
    speed: 140,
    damage: 8,
    attackRange: 400,
    attackSpeed: 2000,
    moneyDrop: [60, 120],
    xpDrop: [40, 80],
    color: 0x2ecc71, // Green - healer
    size: 20,
    behavior: 'ranged', // Stays back, heals allies
  },
  [EnemyType.SHIELDER]: {
    health: 300,
    speed: 100,
    damage: 12,
    attackRange: 350,
    attackSpeed: 1500,
    moneyDrop: [45, 90],
    xpDrop: [35, 65],
    color: 0x3498db, // Blue - protective
    size: 26,
    behavior: 'tank', // Protects other enemies
  },
  // NEW ENEMIES!
  [EnemyType.TELEPORTER]: {
    health: 70,
    speed: 200,
    damage: 25,
    attackRange: 500,
    attackSpeed: 2000,
    moneyDrop: [60, 120],
    xpDrop: [40, 70],
    color: 0xaa00ff, // Purple - magical
    size: 16,
    behavior: 'fast', // Teleports around
  },
  [EnemyType.SWARM]: {
    health: 15,
    speed: 280,
    damage: 5,
    attackRange: 300,
    attackSpeed: 400,
    moneyDrop: [5, 15],
    xpDrop: [3, 8],
    color: 0x888888, // Grey - small
    size: 8,
    behavior: 'chase', // Swarms in groups
  },
  [EnemyType.VAMPIRE]: {
    health: 150,
    speed: 180,
    damage: 20,
    attackRange: 400,
    attackSpeed: 1200,
    moneyDrop: [70, 140],
    xpDrop: [45, 80],
    color: 0x8b0000, // Dark red - bloodsucker
    size: 22,
    behavior: 'chase', // Drains health
  },
  [EnemyType.SPLITTER]: {
    health: 100,
    speed: 160,
    damage: 15,
    attackRange: 400,
    attackSpeed: 1000,
    moneyDrop: [40, 80],
    xpDrop: [30, 55],
    color: 0x00ff88, // Teal - divides
    size: 22,
    behavior: 'tank', // Splits into smaller enemies
  },
  [EnemyType.GHOST]: {
    health: 50,
    speed: 220,
    damage: 30,
    attackRange: 450,
    attackSpeed: 1500,
    moneyDrop: [55, 100],
    xpDrop: [35, 60],
    color: 0xccccff, // Pale blue - ethereal
    size: 18,
    behavior: 'fast', // Phases through walls
  },
  // NEW ENEMY TYPES!
  [EnemyType.JUGGERNAUT]: {
    health: 800,        // MASSIVE HP
    speed: 60,          // Very slow
    damage: 50,         // High damage
    attackRange: 350,
    attackSpeed: 2500,
    moneyDrop: [150, 300],
    xpDrop: [100, 180],
    color: 0x4a0e4e,    // Dark purple - imposing
    size: 36,
    behavior: 'tank',
  },
  [EnemyType.NINJA]: {
    health: 35,         // Very fragile
    speed: 400,         // ULTRA fast
    damage: 25,
    attackRange: 300,
    attackSpeed: 400,   // Quick attacks
    moneyDrop: [60, 120],
    xpDrop: [40, 70],
    color: 0x1a1a1a,    // Near black - stealthy
    size: 14,
    behavior: 'fast',
  },
  [EnemyType.NECROMANCER]: {
    health: 120,
    speed: 100,         // Slow, stays back
    damage: 15,
    attackRange: 500,
    attackSpeed: 3000,  // Slow but summons
    moneyDrop: [100, 200],
    xpDrop: [70, 120],
    color: 0x800080,    // Purple - magic
    size: 20,
    behavior: 'ranged',
  },
  [EnemyType.EXPLODER]: {
    health: 40,
    speed: 280,         // Runs at you
    damage: 80,         // MASSIVE damage on death
    attackRange: 50,    // Has to get close
    attackSpeed: 10000, // Doesn't attack normally
    moneyDrop: [40, 80],
    xpDrop: [30, 50],
    color: 0xff4500,    // Orange-red - volatile
    size: 16,
    behavior: 'berserker',
  },
  [EnemyType.CHARGER]: {
    health: 150,
    speed: 500,         // VERY fast when charging
    damage: 40,
    attackRange: 600,   // Long charge range
    attackSpeed: 3000,  // Cooldown between charges
    moneyDrop: [70, 140],
    xpDrop: [50, 90],
    color: 0xdc143c,    // Crimson - aggressive
    size: 22,
    behavior: 'berserker',
  },
  // ═══════════════════════════════════════════════════════════════
  // LEGENDARY TIER ENEMIES - Ultra rare, ultra deadly!
  // ═══════════════════════════════════════════════════════════════
  [EnemyType.SHADOWLORD]: {
    health: 400,
    speed: 200,
    damage: 45,
    attackRange: 500,
    attackSpeed: 1500,
    moneyDrop: [200, 400],
    xpDrop: [150, 250],
    color: 0x1a1a2e,    // Dark shadow
    size: 32,
    behavior: 'fast',   // Creates shadow clones
  },
  [EnemyType.WARDEN]: {
    health: 600,
    speed: 80,
    damage: 30,
    attackRange: 450,
    attackSpeed: 2500,
    moneyDrop: [180, 350],
    xpDrop: [130, 220],
    color: 0x0984e3,    // Shield blue
    size: 34,
    behavior: 'tank',   // Creates barriers
  },
  [EnemyType.CORRUPTED]: {
    health: 300,
    speed: 160,
    damage: 35,
    attackRange: 400,
    attackSpeed: 1200,
    moneyDrop: [170, 340],
    xpDrop: [120, 200],
    color: 0x6c3483,    // Toxic purple
    size: 26,
    behavior: 'chase',  // Leaves poison trails
  },
  [EnemyType.MIRROR]: {
    health: 250,
    speed: 150,
    damage: 20,
    attackRange: 350,
    attackSpeed: 2000,
    moneyDrop: [220, 450],
    xpDrop: [160, 280],
    color: 0xbdc3c7,    // Reflective silver
    size: 24,
    behavior: 'tank',   // Reflects damage
  },
  [EnemyType.BERSERKER_KING]: {
    health: 500,
    speed: 350,
    damage: 70,
    attackRange: 550,
    attackSpeed: 500,
    moneyDrop: [300, 600],
    xpDrop: [200, 400],
    color: 0xe74c3c,    // Blood red
    size: 36,
    behavior: 'berserker', // Ultimate rage mode
  },
  // ═══════════════════════════════════════════════════════════════
  // VOID TIER ENEMIES - Reality-bending threats!
  // ═══════════════════════════════════════════════════════════════
  [EnemyType.VOID_WALKER]: {
    health: 350,
    speed: 250,
    damage: 35,
    attackRange: 450,
    attackSpeed: 1200,
    moneyDrop: [200, 400],
    xpDrop: [150, 280],
    color: 0x2d0050,    // Purple-black
    size: 22,
    behavior: 'fast',   // Phases in/out
  },
  [EnemyType.ENTROPY]: {
    health: 280,
    speed: 180,
    damage: 25,
    attackRange: 400,
    attackSpeed: 1500,
    moneyDrop: [180, 350],
    xpDrop: [130, 240],
    color: 0x1a0033,    // Deep void
    size: 20,
    behavior: 'chase',  // Reduces player damage
  },
  [EnemyType.NULLIFIER]: {
    health: 320,
    speed: 160,
    damage: 30,
    attackRange: 400,
    attackSpeed: 1800,
    moneyDrop: [220, 440],
    xpDrop: [160, 300],
    color: 0x330066,    // Dark purple
    size: 24,
    behavior: 'chase',  // Disables power-ups
  },
  [EnemyType.ABYSSAL]: {
    health: 200,
    speed: 140,
    damage: 20,
    attackRange: 400,
    attackSpeed: 1500,
    moneyDrop: [160, 320],
    xpDrop: [120, 220],
    color: 0x0d001a,    // Near black
    size: 18,
    behavior: 'chase',  // Grows stronger over time
  },
  [EnemyType.VOID_PROPHET]: {
    health: 250,
    speed: 120,
    damage: 20,
    attackRange: 500,
    attackSpeed: 2000,
    moneyDrop: [250, 500],
    xpDrop: [180, 340],
    color: 0x4d0099,    // Vivid purple
    size: 26,
    behavior: 'ranged',  // Buffs nearby void enemies
  },
  [EnemyType.RIFT_STALKER]: {
    health: 300,
    speed: 300,
    damage: 45,
    attackRange: 500,
    attackSpeed: 1000,
    moneyDrop: [240, 480],
    xpDrop: [170, 320],
    color: 0x6600cc,    // Bright purple
    size: 20,
    behavior: 'fast',   // Teleports behind player
  },
  // ═══════════════════════════════════════════════════════════════
  // MECHANICAL TIER ENEMIES - Robotic precision!
  // ═══════════════════════════════════════════════════════════════
  [EnemyType.DRONE]: {
    health: 150,
    speed: 350,
    damage: 15,
    attackRange: 400,
    attackSpeed: 800,
    moneyDrop: [80, 160],
    xpDrop: [60, 110],
    color: 0x88ccff,    // Light blue
    size: 12,
    behavior: 'fast',   // Formation flyer
  },
  [EnemyType.SIEGE_BOT]: {
    health: 500,
    speed: 80,
    damage: 60,
    attackRange: 700,
    attackSpeed: 3000,
    moneyDrop: [150, 300],
    xpDrop: [100, 200],
    color: 0x556677,    // Steel grey
    size: 30,
    behavior: 'ranged', // Slow mortar
  },
  [EnemyType.OVERCLOCKER]: {
    health: 200,
    speed: 160,
    damage: 15,
    attackRange: 400,
    attackSpeed: 2000,
    moneyDrop: [120, 240],
    xpDrop: [90, 170],
    color: 0x44aaff,    // Electric blue
    size: 18,
    behavior: 'ranged', // Speeds up nearby mechs
  },
  [EnemyType.TESLA_COIL]: {
    health: 400,
    speed: 0,
    damage: 40,
    attackRange: 250,
    attackSpeed: 1000,
    moneyDrop: [140, 280],
    xpDrop: [100, 190],
    color: 0x00ccff,    // Cyan
    size: 22,
    behavior: 'ranged', // Stationary zapper
  },
  [EnemyType.ASSEMBLER]: {
    health: 350,
    speed: 100,
    damage: 20,
    attackRange: 400,
    attackSpeed: 2500,
    moneyDrop: [160, 320],
    xpDrop: [120, 220],
    color: 0x3388bb,    // Teal blue
    size: 24,
    behavior: 'ranged', // Builds mini-drones
  },
  [EnemyType.MECH_TITAN]: {
    health: 700,
    speed: 70,
    damage: 55,
    attackRange: 400,
    attackSpeed: 2000,
    moneyDrop: [200, 400],
    xpDrop: [150, 280],
    color: 0x224466,    // Dark navy
    size: 34,
    behavior: 'tank',   // Heavy mech
  },
}

export class AdvancedEnemy extends Phaser.Physics.Arcade.Sprite {
  public health: number
  public maxHealth: number
  public speed: number
  public damage: number
  private attackRange: number
  private attackSpeed: number
  private lastAttack = 0
  private moneyDrop: [number, number]
  private xpDrop: [number, number]
  private behavior: string
  private healthBar!: Phaser.GameObjects.Graphics
  private nameTag!: Phaser.GameObjects.Text
  public enemyType: EnemyType
  private enraged = false

  // Special ability timers
  private lastSpecialAbility = 0
  private specialAbilityCooldown = 3000 // 3 seconds
  private isPhased = false // For ghost
  private teleportCooldown = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType = EnemyType.GRUNT
  ) {
    super(scene, x, y, '')

    const stats = ENEMY_STATS[type]
    this.enemyType = type
    this.health = stats.health
    this.maxHealth = stats.health
    this.speed = stats.speed
    this.damage = stats.damage
    this.attackRange = stats.attackRange
    this.attackSpeed = stats.attackSpeed
    this.moneyDrop = stats.moneyDrop
    this.xpDrop = stats.xpDrop
    this.behavior = stats.behavior

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Create visual
    this.createVisual(stats.color, stats.size)

    // Set up physics
    this.setCollideWorldBounds(true)
    this.setSize(stats.size * 2, stats.size * 2)

    // Create health bar
    this.healthBar = scene.add.graphics()

    // Create name tag
    const typeNames: Record<EnemyType, string> = {
      [EnemyType.GRUNT]: 'Grunt',
      [EnemyType.SCOUT]: 'Scout',
      [EnemyType.TANK]: 'Tank',
      [EnemyType.SNIPER]: 'Sniper',
      [EnemyType.BERSERKER]: 'Berserker',
      [EnemyType.BOSS]: '💀 BOSS 💀',
      [EnemyType.ASSASSIN]: '🗡️ Assassin',
      [EnemyType.BOMBER]: '💣 Bomber',
      [EnemyType.HEALER]: '💚 Healer',
      [EnemyType.SHIELDER]: '🛡️ Shielder',
      [EnemyType.TELEPORTER]: '🌀 Teleporter',
      [EnemyType.SWARM]: 'Swarm',
      [EnemyType.VAMPIRE]: '🧛 Vampire',
      [EnemyType.SPLITTER]: '⚡ Splitter',
      [EnemyType.GHOST]: '👻 Ghost',
      [EnemyType.JUGGERNAUT]: '🦾 Juggernaut',
      [EnemyType.NINJA]: '🥷 Ninja',
      [EnemyType.NECROMANCER]: '💀 Necromancer',
      [EnemyType.EXPLODER]: '💥 Exploder',
      [EnemyType.CHARGER]: '🐗 Charger',
      // LEGENDARY TIER
      [EnemyType.SHADOWLORD]: '👤 SHADOW LORD',
      [EnemyType.WARDEN]: '🛡️ WARDEN',
      [EnemyType.CORRUPTED]: '☠️ CORRUPTED',
      [EnemyType.MIRROR]: '🪞 MIRROR DEMON',
      [EnemyType.BERSERKER_KING]: '👑 BERSERKER KING',
      // VOID TIER
      [EnemyType.VOID_WALKER]: '🌀 Void Walker',
      [EnemyType.ENTROPY]: '🌑 Entropy',
      [EnemyType.NULLIFIER]: '🚫 Nullifier',
      [EnemyType.ABYSSAL]: '🕳️ Abyssal',
      [EnemyType.VOID_PROPHET]: '🔮 Void Prophet',
      [EnemyType.RIFT_STALKER]: '⚡ Rift Stalker',
      // MECHANICAL TIER
      [EnemyType.DRONE]: '🤖 Drone',
      [EnemyType.SIEGE_BOT]: '🏗️ Siege Bot',
      [EnemyType.OVERCLOCKER]: '⚡ Overclocker',
      [EnemyType.TESLA_COIL]: '⚡ Tesla Coil',
      [EnemyType.ASSEMBLER]: '🔧 Assembler',
      [EnemyType.MECH_TITAN]: '🦾 MECH TITAN',
    }

    this.nameTag = scene.add.text(x, y - 35, typeNames[type], {
      fontSize: type === EnemyType.BOSS ? '16px' : '10px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5)

    this.updateHealthBar()
  }

  private createVisual(color: number, size: number) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false)

    // Body
    graphics.fillStyle(color, 1)
    graphics.fillCircle(size, size, size)

    // Eyes (angry)
    graphics.fillStyle(0xffffff, 1)
    const eyeSize = Math.max(2, size / 5)
    graphics.fillCircle(size - eyeSize * 1.5, size - eyeSize, eyeSize)
    graphics.fillCircle(size + eyeSize * 1.5, size - eyeSize, eyeSize)

    // Pupils (red)
    graphics.fillStyle(0xff0000, 1)
    graphics.fillCircle(size - eyeSize * 1.5, size - eyeSize, eyeSize * 0.7)
    graphics.fillCircle(size + eyeSize * 1.5, size - eyeSize, eyeSize * 0.7)

    // Special markers for types
    if (this.enemyType === EnemyType.TANK) {
      // Armor lines
      graphics.lineStyle(2, 0x000000, 1)
      graphics.strokeCircle(size, size, size - 2)
      graphics.strokeCircle(size, size, size - 5)
    } else if (this.enemyType === EnemyType.SNIPER) {
      // Scope crosshair
      graphics.lineStyle(1, 0x00ff00, 0.8)
      graphics.lineBetween(size - 8, size, size + 8, size)
      graphics.lineBetween(size, size - 8, size, size + 8)
    } else if (this.enemyType === EnemyType.BERSERKER) {
      // Angry mouth
      graphics.lineStyle(2, 0x000000, 1)
      graphics.strokeCircle(size, size + eyeSize * 2, 4)
    } else if (this.enemyType === EnemyType.BOSS) {
      // Crown
      graphics.fillStyle(0xf1c40f, 1)
      graphics.fillTriangle(
        size - size / 2, size - size,
        size - size / 3, size - size * 1.3,
        size - size / 6, size - size
      )
      graphics.fillTriangle(
        size - size / 6, size - size,
        size, size - size * 1.5,
        size + size / 6, size - size
      )
      graphics.fillTriangle(
        size + size / 6, size - size,
        size + size / 3, size - size * 1.3,
        size + size / 2, size - size
      )
    }

    const textureName = `enemy_${this.enemyType}`
    graphics.generateTexture(textureName, size * 2, size * 2)
    graphics.destroy()

    this.setTexture(textureName)
  }

  update(player: Player, weaponSystem?: any, allEnemies?: Phaser.GameObjects.Group) {
    if (!player || !player.active) return

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    )

    // Special enemy type behaviors
    this.handleSpecialBehaviors(player, allEnemies)

    // Behavior logic
    switch (this.behavior) {
      case 'chase':
        this.chasePlayer(player, distance)
        break
      case 'fast':
        this.fastChasePlayer(player, distance)
        break
      case 'tank':
        this.slowChasePlayer(player, distance)
        break
      case 'ranged':
        this.rangedBehavior(player, distance, weaponSystem)
        break
      case 'berserker':
        this.berserkerBehavior(player, distance)
        break
    }

    // Update health bar and name tag
    this.updateHealthBar()
    this.nameTag.setPosition(this.x, this.y - (this.enemyType === EnemyType.BOSS ? 50 : 35))
  }

  // Handle special behaviors for each enemy type
  private handleSpecialBehaviors(player: Player, allEnemies?: Phaser.GameObjects.Group) {
    const currentTime = this.scene.time.now

    switch (this.enemyType) {
      case EnemyType.HEALER:
        // Heal nearby allies every 3 seconds
        if (currentTime - this.lastSpecialAbility > this.specialAbilityCooldown && allEnemies) {
          this.healNearbyAllies(allEnemies)
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.TELEPORTER:
        // Teleport when player gets too close
        const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
        if (distToPlayer < 150 && currentTime > this.teleportCooldown) {
          this.teleportAway(player)
          this.teleportCooldown = currentTime + 2000
        }
        break

      case EnemyType.GHOST:
        // Phase in and out of visibility
        if (currentTime - this.lastSpecialAbility > 4000) {
          this.togglePhase()
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.VAMPIRE:
        // Vampire visual effect (red glow when near player)
        if (Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 100) {
          this.setTint(0xff0000)
        } else {
          this.clearTint()
        }
        break

      case EnemyType.NINJA:
        // Ninja flickers/dodges - visual effect
        if (currentTime - this.lastSpecialAbility > 2000) {
          this.setAlpha(0.3)
          this.scene.time.delayedCall(200, () => {
            if (this.active) this.setAlpha(1)
          })
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.NECROMANCER:
        // Summon minions every 5 seconds
        if (currentTime - this.lastSpecialAbility > 5000) {
          this.summonMinions()
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.CHARGER:
        // Charger glows when preparing to charge
        const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
        if (distToTarget < 400 && distToTarget > 100) {
          this.setTint(0xff4444)
        } else {
          this.clearTint()
        }
        break

      case EnemyType.JUGGERNAUT:
        // Juggernaut gets redder as HP decreases
        const hpPercent = this.health / this.maxHealth
        if (hpPercent < 0.3) {
          this.setTint(0xff0000)
        } else if (hpPercent < 0.6) {
          this.setTint(0xff6666)
        }
        break

      // ═══════════════════════════════════════════════════════════════
      // LEGENDARY ENEMY ABILITIES - Devastating powers!
      // ═══════════════════════════════════════════════════════════════

      case EnemyType.SHADOWLORD:
        // Creates shadow clones every 5 seconds
        if (currentTime - this.lastSpecialAbility > 5000) {
          this.createShadowClone()
          this.lastSpecialAbility = currentTime
        }
        // Ethereal visual effect
        if (Math.random() < 0.03) {
          this.setAlpha(0.5)
          this.scene.time.delayedCall(200, () => {
            if (this.active) this.setAlpha(1)
          })
        }
        break

      case EnemyType.WARDEN:
        // Creates shield barrier every 6 seconds
        if (currentTime - this.lastSpecialAbility > 6000) {
          this.createShieldBarrier()
          this.lastSpecialAbility = currentTime
        }
        // Shield glow effect
        if (Math.random() < 0.02) {
          const glow = this.scene.add.circle(this.x, this.y, ENEMY_STATS[EnemyType.WARDEN].size + 10, 0x0984e3, 0.3)
          this.scene.tweens.add({
            targets: glow,
            scale: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => glow.destroy()
          })
        }
        break

      case EnemyType.CORRUPTED:
        // Leaves poison trail constantly
        if (currentTime - this.lastSpecialAbility > 500) {
          this.leavePoisonTrail()
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.MIRROR:
        // Visual reflection effect
        if (Math.random() < 0.02) {
          this.setTint(0xffffff)
          this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint()
          })
        }
        break

      case EnemyType.BERSERKER_KING:
        // Constant rage aura
        if (Math.random() < 0.05) {
          const rage = this.scene.add.circle(this.x, this.y, 20, 0xe74c3c, 0.4)
          this.scene.tweens.add({
            targets: rage,
            scale: 3,
            alpha: 0,
            duration: 400,
            onComplete: () => rage.destroy()
          })
        }
        // Gets faster over time in combat
        const bkHpPercent = this.health / this.maxHealth
        if (bkHpPercent < 0.5 && !this.enraged) {
          this.enraged = true
          this.speed *= 1.8
          this.setTint(0xff0000)
          // Enrage visual effect
          const enrageText = this.scene.add.text(this.x, this.y - 50, '💢 ENRAGED!', {
            fontSize: '16px',
            color: '#ff0000',
            fontStyle: 'bold'
          }).setOrigin(0.5)
          this.scene.tweens.add({
            targets: enrageText,
            y: enrageText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => enrageText.destroy()
          })
        }
        break

      // ═══════════════════════════════════════════════════════════════
      // VOID TIER ENEMY ABILITIES
      // ═══════════════════════════════════════════════════════════════

      case EnemyType.VOID_WALKER:
        // Phase in and out of reality every 3 seconds
        if (currentTime - this.lastSpecialAbility > 3000) {
          this.isPhased = !this.isPhased
          this.setAlpha(this.isPhased ? 0.2 : 1)
          if (!this.isPhased) {
            // Flash when becoming solid
            const voidFlash = this.scene.add.circle(this.x, this.y, 25, 0x2d0050, 0.6)
            this.scene.tweens.add({
              targets: voidFlash,
              scale: 2,
              alpha: 0,
              duration: 300,
              onComplete: () => voidFlash.destroy()
            })
          }
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.ENTROPY:
        // Entropy aura visual - drains color from surroundings
        if (Math.random() < 0.03) {
          const drainEffect = this.scene.add.circle(this.x, this.y, 30, 0x1a0033, 0.4)
          this.scene.tweens.add({
            targets: drainEffect,
            scale: 2,
            alpha: 0,
            duration: 600,
            onComplete: () => drainEffect.destroy()
          })
        }
        break

      case EnemyType.NULLIFIER:
        // Nullification pulse every 5 seconds
        if (currentTime - this.lastSpecialAbility > 5000) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nullifierPulse', {
              detail: { x: this.x, y: this.y, radius: 200 }
            }))
          }
          const nullPulse = this.scene.add.circle(this.x, this.y, 20, 0x330066, 0.5)
          nullPulse.setStrokeStyle(3, 0x330066)
          this.scene.tweens.add({
            targets: nullPulse,
            scale: 10,
            alpha: 0,
            duration: 800,
            onComplete: () => nullPulse.destroy()
          })
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.ABYSSAL:
        // Grows 5% stronger every 3 seconds
        if (currentTime - this.lastSpecialAbility > 3000) {
          this.health = Math.min(this.maxHealth * 3, this.health * 1.05)
          this.maxHealth = Math.max(this.maxHealth, this.health)
          // Growth visual
          const growEffect = this.scene.add.circle(this.x, this.y, 15, 0x0d001a, 0.6)
          this.scene.tweens.add({
            targets: growEffect,
            scale: 1.5,
            alpha: 0,
            duration: 400,
            onComplete: () => growEffect.destroy()
          })
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.VOID_PROPHET:
        // Buff nearby void enemies every 4 seconds
        if (currentTime - this.lastSpecialAbility > 4000 && allEnemies) {
          allEnemies.getChildren().forEach((enemy: any) => {
            if (enemy !== this && enemy.active && enemy.enemyType &&
                ['void_walker', 'entropy', 'nullifier', 'abyssal', 'rift_stalker'].includes(enemy.enemyType)) {
              const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
              if (dist < 300) {
                enemy.setTint(0x9900ff)
                this.scene.time.delayedCall(500, () => {
                  if (enemy.active) enemy.clearTint()
                })
              }
            }
          })
          // Prophet aura
          const prophetAura = this.scene.add.circle(this.x, this.y, 40, 0x4d0099, 0.3)
          this.scene.tweens.add({
            targets: prophetAura,
            scale: 7,
            alpha: 0,
            duration: 600,
            onComplete: () => prophetAura.destroy()
          })
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.RIFT_STALKER:
        // Teleport behind player every 3 seconds
        if (currentTime - this.lastSpecialAbility > 3000) {
          const angle2 = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y)
          const behindX = player.x - Math.cos(angle2) * 80
          const behindY = player.y - Math.sin(angle2) * 80
          // Vanish effect
          const riftVanish = this.scene.add.circle(this.x, this.y, 15, 0x6600cc, 0.8)
          this.scene.tweens.add({
            targets: riftVanish,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => riftVanish.destroy()
          })
          this.setPosition(
            Phaser.Math.Clamp(behindX, 50, 3000 - 50),
            Phaser.Math.Clamp(behindY, 50, 2000 - 50)
          )
          // Appear effect
          const riftAppear = this.scene.add.circle(this.x, this.y, 20, 0x6600cc, 0.6)
          this.scene.tweens.add({
            targets: riftAppear,
            scale: 0.5,
            alpha: 0,
            duration: 300,
            onComplete: () => riftAppear.destroy()
          })
          this.lastSpecialAbility = currentTime
        }
        break

      // ═══════════════════════════════════════════════════════════════
      // MECHANICAL TIER ENEMY ABILITIES
      // ═══════════════════════════════════════════════════════════════

      case EnemyType.DRONE:
        // Drones flicker their lights
        if (Math.random() < 0.02) {
          this.setTint(0xffffff)
          this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint()
          })
        }
        break

      case EnemyType.SIEGE_BOT:
        // Mortar visual - charging shot
        if (currentTime - this.lastSpecialAbility > 3000) {
          this.setTint(0xff4444)
          this.scene.time.delayedCall(500, () => {
            if (this.active) this.clearTint()
          })
          // Fire mortar event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('siegeMortar', {
              detail: { x: player.x, y: player.y, damage: 40, radius: 100 }
            }))
          }
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.OVERCLOCKER:
        // Speed up nearby mechs every 4 seconds
        if (currentTime - this.lastSpecialAbility > 4000 && allEnemies) {
          allEnemies.getChildren().forEach((enemy: any) => {
            if (enemy !== this && enemy.active && enemy.enemyType &&
                ['drone', 'siege_bot', 'tesla_coil', 'assembler', 'mech_titan'].includes(enemy.enemyType)) {
              const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
              if (dist < 250) {
                enemy.setTint(0x44aaff)
                this.scene.time.delayedCall(400, () => {
                  if (enemy.active) enemy.clearTint()
                })
              }
            }
          })
          // Overclock pulse
          const oclockPulse = this.scene.add.circle(this.x, this.y, 20, 0x44aaff, 0.4)
          this.scene.tweens.add({
            targets: oclockPulse,
            scale: 6,
            alpha: 0,
            duration: 500,
            onComplete: () => oclockPulse.destroy()
          })
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.TESLA_COIL:
        // Zap nearby player every 2 seconds
        if (currentTime - this.lastSpecialAbility > 2000) {
          const zapDist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
          if (zapDist < 250) {
            // Lightning visual
            const lightning = this.scene.add.graphics()
            lightning.lineStyle(3, 0x00ccff, 0.8)
            lightning.lineBetween(this.x, this.y, player.x, player.y)
            this.scene.tweens.add({
              targets: lightning,
              alpha: 0,
              duration: 200,
              onComplete: () => lightning.destroy()
            })
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('teslaZap', {
                detail: { x: this.x, y: this.y, targetX: player.x, targetY: player.y, damage: 15 }
              }))
            }
          }
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.ASSEMBLER:
        // Build mini-drone every 6 seconds
        if (currentTime - this.lastSpecialAbility > 6000) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('assemblerBuild', {
              detail: {
                x: this.x + (Math.random() - 0.5) * 80,
                y: this.y + (Math.random() - 0.5) * 80,
              }
            }))
          }
          // Build visual
          const buildEffect = this.scene.add.circle(this.x, this.y, 30, 0x3388bb, 0.5)
          this.scene.tweens.add({
            targets: buildEffect,
            scale: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => buildEffect.destroy()
          })
          this.lastSpecialAbility = currentTime
        }
        break

      case EnemyType.MECH_TITAN:
        // Mech Titan gets armor plating visual at low HP
        const mtHpPercent = this.health / this.maxHealth
        if (mtHpPercent < 0.3) {
          this.setTint(0xff4444)
        } else if (mtHpPercent < 0.6) {
          this.setTint(0x88aacc)
        }
        break
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LEGENDARY ENEMY ABILITY IMPLEMENTATIONS
  // ═══════════════════════════════════════════════════════════════

  private createShadowClone() {
    // Emit event for GameScene to handle shadow clone spawning
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shadowClone', {
        detail: {
          x: this.x + (Math.random() - 0.5) * 100,
          y: this.y + (Math.random() - 0.5) * 100,
        }
      }))
    }

    // Visual effect
    const shadow = this.scene.add.circle(this.x, this.y, 25, 0x1a1a2e, 0.6)
    this.scene.tweens.add({
      targets: shadow,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => shadow.destroy()
    })
  }

  private createShieldBarrier() {
    // Visual barrier effect
    const barrier = this.scene.add.circle(this.x, this.y, 80, 0x0984e3, 0)
    barrier.setStrokeStyle(4, 0x0984e3, 0.8)

    this.scene.tweens.add({
      targets: barrier,
      scale: 1.5,
      duration: 3000,
      onComplete: () => {
        this.scene.tweens.add({
          targets: barrier,
          alpha: 0,
          duration: 500,
          onComplete: () => barrier.destroy()
        })
      }
    })

    // Emit event for GameScene to track barrier
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shieldBarrier', {
        detail: { x: this.x, y: this.y, radius: 120, duration: 3000 }
      }))
    }
  }

  private leavePoisonTrail() {
    const poison = this.scene.add.circle(this.x, this.y, 15, 0x6c3483, 0.4)
    poison.setDepth(-1)

    // Poison fades over time
    this.scene.tweens.add({
      targets: poison,
      alpha: 0,
      duration: 3000,
      onComplete: () => poison.destroy()
    })

    // Emit poison zone event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('poisonZone', {
        detail: { x: this.x, y: this.y, radius: 15, damage: 5, duration: 3000 }
      }))
    }
  }

  // Necromancer: Summon minions
  private summonMinions() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('necromancerSummon', {
        detail: {
          x: this.x,
          y: this.y,
          count: 2 // Summon 2 minions
        }
      }))
    }

    // Visual effect
    const summonCircle = this.scene.add.circle(this.x, this.y, 50, 0x800080, 0.5)
    this.scene.tweens.add({
      targets: summonCircle,
      scale: 2,
      alpha: 0,
      duration: 600,
      onComplete: () => summonCircle.destroy()
    })
  }

  // Healer: Heal nearby allies
  private healNearbyAllies(allEnemies: Phaser.GameObjects.Group) {
    const healRange = 200
    const healAmount = 20

    allEnemies.getChildren().forEach((enemy: any) => {
      if (enemy !== this && enemy.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
        if (dist < healRange && enemy.health < enemy.maxHealth) {
          enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount)

          // Heal visual effect
          const healEffect = this.scene.add.circle(enemy.x, enemy.y, 30, 0x2ecc71, 0.4)
          this.scene.tweens.add({
            targets: healEffect,
            scale: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => healEffect.destroy()
          })
        }
      }
    })

    // Self heal effect
    const selfHealEffect = this.scene.add.circle(this.x, this.y, 40, 0x2ecc71, 0.6)
    this.scene.tweens.add({
      targets: selfHealEffect,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => selfHealEffect.destroy()
    })
  }

  // Teleporter: Teleport away from player
  private teleportAway(player: Player) {
    // Create vanish effect at current location
    const vanishEffect = this.scene.add.circle(this.x, this.y, 20, 0xaa00ff, 0.8)
    this.scene.tweens.add({
      targets: vanishEffect,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => vanishEffect.destroy()
    })

    // Teleport to random location away from player
    const angle = Math.random() * Math.PI * 2
    const distance = 200 + Math.random() * 200
    const newX = Phaser.Math.Clamp(
      player.x + Math.cos(angle) * distance,
      100,
      3000 - 100
    )
    const newY = Phaser.Math.Clamp(
      player.y + Math.sin(angle) * distance,
      100,
      2000 - 100
    )

    this.setPosition(newX, newY)

    // Create appear effect at new location
    const appearEffect = this.scene.add.circle(newX, newY, 30, 0xaa00ff, 0.6)
    appearEffect.setScale(2)
    this.scene.tweens.add({
      targets: appearEffect,
      scale: 1,
      alpha: 0,
      duration: 300,
      onComplete: () => appearEffect.destroy()
    })
  }

  // Ghost: Toggle phase state
  private togglePhase() {
    this.isPhased = !this.isPhased
    if (this.isPhased) {
      this.setAlpha(0.3)
      // Ghost becomes immune to damage when phased
    } else {
      this.setAlpha(1)
    }
  }

  // Check if ghost is phased (immune to damage)
  isGhostPhased(): boolean {
    return this.enemyType === EnemyType.GHOST && this.isPhased
  }

  private chasePlayer(player: Player, distance: number) {
    if (distance < this.attackRange) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      )
      this.setRotation(angle + Math.PI / 2)
    } else {
      this.setVelocity(0, 0)
    }
  }

  private fastChasePlayer(player: Player, distance: number) {
    // Scouts dart in and out
    if (distance < this.attackRange && distance > 100) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      )
      this.setRotation(angle + Math.PI / 2)
    } else if (distance <= 100) {
      // Too close, back away
      const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y)
      this.setVelocity(
        Math.cos(angle) * this.speed * 0.7,
        Math.sin(angle) * this.speed * 0.7
      )
      this.setRotation(angle + Math.PI / 2)
    } else {
      this.setVelocity(0, 0)
    }
  }

  private slowChasePlayer(player: Player, distance: number) {
    if (distance < this.attackRange) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      )
      this.setRotation(angle + Math.PI / 2)
    } else {
      this.setVelocity(0, 0)
    }
  }

  private rangedBehavior(player: Player, distance: number, weaponSystem: any) {
    // Keep distance and shoot
    if (distance < 400) {
      // Too close, back away
      const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y)
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      )
      this.setRotation(angle + Math.PI / 2)
    } else if (distance < this.attackRange) {
      this.setVelocity(0, 0)
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      this.setRotation(angle + Math.PI / 2)

      // Shoot at player
      if (weaponSystem && this.scene.time.now - this.lastAttack > this.attackSpeed) {
        this.lastAttack = this.scene.time.now
        weaponSystem.fireEnemyBullet(this.x, this.y, angle, this.damage)
      }
    }
  }

  private berserkerBehavior(player: Player, distance: number) {
    // Gets faster as health decreases
    const healthPercent = this.health / this.maxHealth
    if (healthPercent < 0.5 && !this.enraged) {
      this.enraged = true
      this.speed *= 1.5
      this.setTint(0xff0000)
    }

    if (distance < this.attackRange) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      )
      this.setRotation(angle + Math.PI / 2)
    }
  }

  takeDamage(amount: number): boolean {
    // Ghost is immune when phased
    if (this.isGhostPhased()) {
      // Visual feedback for blocked damage
      const blockText = this.scene.add.text(this.x, this.y - 30, 'PHASED', {
        fontSize: '12px',
        color: '#ccccff',
        fontStyle: 'bold'
      }).setOrigin(0.5)
      this.scene.tweens.add({
        targets: blockText,
        y: this.y - 60,
        alpha: 0,
        duration: 500,
        onComplete: () => blockText.destroy()
      })
      return false
    }

    // Mirror enemy reflects 30% of damage back to player!
    if (this.enemyType === EnemyType.MIRROR && Math.random() < 0.3) {
      // Reflect visual
      const reflectText = this.scene.add.text(this.x, this.y - 40, '🪞 REFLECTED!', {
        fontSize: '14px',
        color: '#bdc3c7',
        fontStyle: 'bold'
      }).setOrigin(0.5)
      this.scene.tweens.add({
        targets: reflectText,
        y: this.y - 70,
        alpha: 0,
        duration: 600,
        onComplete: () => reflectText.destroy()
      })

      // Mirror flash
      this.setTint(0xffffff)
      this.scene.time.delayedCall(150, () => {
        if (this.active) this.clearTint()
      })

      // Emit reflect event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mirrorReflect', {
          detail: { damage: Math.floor(amount * 0.5) }
        }))
      }
    }

    this.health -= amount
    if (this.health < 0) this.health = 0

    // Visual feedback
    this.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        if (this.enraged) {
          this.setTint(0xff0000)
        } else {
          this.clearTint()
        }
      }
    })

    this.updateHealthBar()

    // Splitter: Spawn smaller enemies when killed
    if (this.health <= 0 && this.enemyType === EnemyType.SPLITTER) {
      this.onSplitterDeath()
    }

    // Exploder: Explode on death dealing area damage
    if (this.health <= 0 && this.enemyType === EnemyType.EXPLODER) {
      this.onExploderDeath()
    }

    // Return true if killed
    return this.health <= 0
  }

  // Exploder: Explode on death
  private onExploderDeath() {
    // Emit event for GameScene to handle explosion damage
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('exploderDeath', {
        detail: {
          x: this.x,
          y: this.y,
          damage: 40,
          radius: 150
        }
      }))
    }

    // Visual explosion effect
    const explosion = this.scene.add.circle(this.x, this.y, 20, 0xff4500, 0.8)
    this.scene.tweens.add({
      targets: explosion,
      scale: 8,
      alpha: 0,
      duration: 400,
      onComplete: () => explosion.destroy()
    })
  }

  // Splitter: Spawn smaller enemies on death
  private onSplitterDeath() {
    // Emit event for GameScene to handle spawning split enemies
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('splitterDeath', {
        detail: {
          x: this.x,
          y: this.y,
          count: 2 + Math.floor(Math.random() * 2) // 2-3 smaller enemies
        }
      }))
    }
  }

  isDead(): boolean {
    return this.health <= 0
  }

  getMoneyDrop(): number {
    return Phaser.Math.Between(this.moneyDrop[0], this.moneyDrop[1])
  }

  getXPDrop(): number {
    return Phaser.Math.Between(this.xpDrop[0], this.xpDrop[1])
  }

  getDamage(): number {
    return this.damage
  }

  isBoss(): boolean {
    return this.enemyType === EnemyType.BOSS
  }

  private updateHealthBar() {
    this.healthBar.clear()

    if (this.health > 0 && this.health < this.maxHealth) {
      const barWidth = this.enemyType === EnemyType.BOSS ? 80 : 40
      const barHeight = this.enemyType === EnemyType.BOSS ? 6 : 4
      const yOffset = this.enemyType === EnemyType.BOSS ? 35 : 25

      // Background
      this.healthBar.fillStyle(0x000000, 0.5)
      this.healthBar.fillRect(
        this.x - barWidth / 2,
        this.y - yOffset,
        barWidth,
        barHeight
      )

      // Health
      const healthPercent = this.health / this.maxHealth
      let healthColor = 0xe74c3c
      if (healthPercent > 0.6) healthColor = 0x2ecc71
      else if (healthPercent > 0.3) healthColor = 0xf39c12

      this.healthBar.fillStyle(healthColor, 1)
      this.healthBar.fillRect(
        this.x - barWidth / 2,
        this.y - yOffset,
        barWidth * healthPercent,
        barHeight
      )
    }
  }

  destroy(fromScene?: boolean) {
    this.healthBar.destroy()
    this.nameTag.destroy()
    super.destroy(fromScene)
  }
}
