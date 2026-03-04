import * as Phaser from 'phaser'
import Player from './Player'

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface ItemDefinition {
  id: string
  name: string
  rarity: ItemRarity
  effect: (player: Player) => void
  description: string
  color: number
}

export const ITEM_POOL: ItemDefinition[] = [
  // Health items
  {
    id: 'health_small',
    name: 'Nano Repair',
    rarity: ItemRarity.COMMON,
    effect: (player) => player.heal(20),
    description: '+20 HP',
    color: 0x2ecc71
  },
  {
    id: 'health_medium',
    name: 'Med Kit',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => player.heal(50),
    description: '+50 HP',
    color: 0x27ae60
  },
  {
    id: 'health_large',
    name: 'Full Restore',
    rarity: ItemRarity.RARE,
    effect: (player) => player.heal(200),
    description: 'Full HP Restore',
    color: 0x1abc9c
  },

  // Damage upgrades
  {
    id: 'damage_small',
    name: 'Power Core',
    rarity: ItemRarity.COMMON,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 5
      }
    },
    description: '+5% Damage',
    color: 0xe74c3c
  },
  {
    id: 'damage_medium',
    name: 'Amplifier',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 10
      }
    },
    description: '+10% Damage',
    color: 0xc0392b
  },
  {
    id: 'damage_large',
    name: 'Quantum Core',
    rarity: ItemRarity.EPIC,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 25
      }
    },
    description: '+25% Damage!',
    color: 0xff0266
  },

  // Critical hit upgrades
  {
    id: 'crit_chance',
    name: 'Precision Chip',
    rarity: ItemRarity.RARE,
    effect: (player) => {
      if (player.shopCritBonus !== undefined) {
        player.shopCritBonus += 0.1
      }
    },
    description: '+10% Crit Chance',
    color: 0xf39c12
  },
  {
    id: 'crit_damage',
    name: 'Critical Matrix',
    rarity: ItemRarity.EPIC,
    effect: (player) => {
      if (player.shopCritBonus !== undefined) {
        player.shopCritBonus += 0.25
      }
    },
    description: '+25% Crit Boost',
    color: 0xe67e22
  },

  // Speed upgrades
  {
    id: 'speed_boost',
    name: 'Thruster Module',
    rarity: ItemRarity.COMMON,
    effect: (player) => {
      if (player.shopSpeedBonus !== undefined) {
        player.shopSpeedBonus += 10
      }
    },
    description: '+10% Speed',
    color: 0x3498db
  },
  {
    id: 'speed_boost_large',
    name: 'Hyper Thrusters',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => {
      if (player.shopSpeedBonus !== undefined) {
        player.shopSpeedBonus += 20
      }
    },
    description: '+20% Speed',
    color: 0x2980b9
  },

  // Fire rate
  {
    id: 'fire_rate',
    name: 'Overclocked Barrel',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => {
      if (player.shopFireRateBonus !== undefined) {
        player.shopFireRateBonus += 15
      }
    },
    description: '+15% Fire Rate',
    color: 0x9b59b6
  },
  {
    id: 'fire_rate_large',
    name: 'Rapid Fire Core',
    rarity: ItemRarity.RARE,
    effect: (player) => {
      if (player.shopFireRateBonus !== undefined) {
        player.shopFireRateBonus += 30
      }
    },
    description: '+30% Fire Rate',
    color: 0x8e44ad
  },

  // Ammo
  {
    id: 'ammo_max',
    name: 'Expanded Magazine',
    rarity: ItemRarity.COMMON,
    effect: (player) => {
      if (player.shopAmmoBonus !== undefined) {
        player.shopAmmoBonus += 10
      }
    },
    description: '+10 Max Ammo',
    color: 0x34495e
  },
  {
    id: 'ammo_refill',
    name: 'Ammo Pack',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => {
      // Refill ammo using shop bonus
      if (player.shopAmmoBonus !== undefined) {
        player.shopAmmoBonus += 5
      }
      player.heal(0) // Triggers stat refresh
    },
    description: '+5 Max Ammo Bonus',
    color: 0x95a5a6
  },

  // Legendary items
  {
    id: 'max_health',
    name: 'Bio Enhancement',
    rarity: ItemRarity.LEGENDARY,
    effect: (player) => {
      player.maxHealth += 50
      player.heal(50)
    },
    description: '+50 Max HP & Heal',
    color: 0x00ff00
  },
  {
    id: 'god_mode',
    name: 'Quantum Amplifier',
    rarity: ItemRarity.LEGENDARY,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 50
      }
      if (player.shopFireRateBonus !== undefined) {
        player.shopFireRateBonus += 50
      }
    },
    description: '+50% Damage & Fire Rate!',
    color: 0xff0266
  },
  {
    id: 'super_speed',
    name: 'Warp Drive',
    rarity: ItemRarity.LEGENDARY,
    effect: (player) => {
      if (player.shopSpeedBonus !== undefined) {
        player.shopSpeedBonus += 50
      }
    },
    description: '+50% Speed!',
    color: 0x00d9ff
  },
  // ═══════════════════════════════════════════════════════════════
  // EXPANSION ITEMS - New powerful drops!
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'void_shard',
    name: 'Void Shard',
    rarity: ItemRarity.EPIC,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 15
      }
    },
    description: '+15% Damage to Void Enemies',
    color: 0x2d0050
  },
  {
    id: 'mechanical_core',
    name: 'Mechanical Core',
    rarity: ItemRarity.RARE,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 20
      }
    },
    description: '+20% Damage to Mech Enemies',
    color: 0x44aaff
  },
  {
    id: 'time_crystal',
    name: 'Time Crystal',
    rarity: ItemRarity.LEGENDARY,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) player.shopDamageBonus += 10
      if (player.shopSpeedBonus !== undefined) player.shopSpeedBonus += 10
      if (player.shopFireRateBonus !== undefined) player.shopFireRateBonus += 10
    },
    description: '+10% All Stats This Run!',
    color: 0xf9ca24
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    rarity: ItemRarity.LEGENDARY,
    effect: (player) => {
      player.maxHealth += 100
      player.heal(player.maxHealth)
    },
    description: 'Auto-Revive with 50% HP!',
    color: 0xff6600
  },
  {
    id: 'berserkers_rage',
    name: "Berserker's Rage",
    rarity: ItemRarity.EPIC,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 30
      }
    },
    description: '+30% Damage, -15% Defense',
    color: 0xe74c3c
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    rarity: ItemRarity.RARE,
    effect: (player) => {
      if (player.shopSpeedBonus !== undefined) {
        player.shopSpeedBonus += 20
      }
    },
    description: '+20% Dodge Chance',
    color: 0x2c3e50
  },
  {
    id: 'plasma_battery',
    name: 'Plasma Battery',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => {
      if (player.shopAmmoBonus !== undefined) {
        player.shopAmmoBonus += 100
      }
    },
    description: '+100 Max Ammo',
    color: 0x00ccff
  },
  {
    id: 'healing_totem',
    name: 'Healing Totem',
    rarity: ItemRarity.RARE,
    effect: (player) => {
      player.heal(100)
      player.maxHealth += 30
    },
    description: 'Regen 3 HP/sec for Run',
    color: 0x2ecc71
  },
  {
    id: 'gold_magnet',
    name: 'Gold Magnet',
    rarity: ItemRarity.UNCOMMON,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 5
      }
    },
    description: '+50% Gold Drops',
    color: 0xffd700
  },
  {
    id: 'xp_catalyst',
    name: 'XP Catalyst',
    rarity: ItemRarity.EPIC,
    effect: (player) => {
      if (player.shopDamageBonus !== undefined) {
        player.shopDamageBonus += 10
      }
    },
    description: '+40% XP Gains',
    color: 0x9b59b6
  },
]

// ═══════════════════════════════════════════════════════════════
// ARTIFACT SYSTEM - Unique legendary items with trigger-effect mechanics
// ═══════════════════════════════════════════════════════════════

export type ArtifactTrigger =
  | { type: 'on_nth_shot'; n: number }
  | { type: 'on_kill_streak'; kills: number; window: number }
  | { type: 'on_hit_received'; chance: number }
  | { type: 'on_kill'; chance: number }
  | { type: 'on_kill_count'; every: number }
  | { type: 'passive' }
  | { type: 'on_death' }
  | { type: 'on_reload'; chance: number }
  | { type: 'on_low_health'; threshold: number }
  | { type: 'on_timer'; interval: number }

export type ArtifactEffect =
  | { type: 'freeze_time'; duration: number }
  | { type: 'black_hole'; duration: number }
  | { type: 'reflect_damage'; mult: number }
  | { type: 'damage_multiplier'; mult: number; duration: number }
  | { type: 'heal'; percent: number }
  | { type: 'chain_lightning'; targets: number; damage: number }
  | { type: 'fire_nova'; damage: number; radius: number }
  | { type: 'revive'; healthPercent: number }
  | { type: 'teleport_behind' }
  | { type: 'freeze_enemies'; duration: number }
  | { type: 'damage_aura'; dps: number; radius: number; duration: number }
  | { type: 'buff_damage'; percent: number; duration: number }
  | { type: 'instant_reload' }
  | { type: 'stun_boss'; duration: number }

export interface ArtifactDefinition {
  id: string
  name: string
  icon: string
  rarity: ItemRarity.EPIC | ItemRarity.LEGENDARY
  description: string
  trigger: ArtifactTrigger
  effect: ArtifactEffect
  color: number
}

export const ARTIFACT_POOL: ArtifactDefinition[] = [
  {
    id: 'chrono_shard', name: 'Chrono Shard', icon: '⏱️',
    rarity: ItemRarity.LEGENDARY, color: 0x74b9ff,
    description: 'Every 10th shot freezes time for 0.5s',
    trigger: { type: 'on_nth_shot', n: 10 },
    effect: { type: 'freeze_time', duration: 500 }
  },
  {
    id: 'void_heart', name: 'Void Heart', icon: '🖤',
    rarity: ItemRarity.LEGENDARY, color: 0x2d0050,
    description: '5 kills in 3s creates a black hole',
    trigger: { type: 'on_kill_streak', kills: 5, window: 3000 },
    effect: { type: 'black_hole', duration: 2000 }
  },
  {
    id: 'mirror_shield', name: 'Mirror Shield', icon: '🪞',
    rarity: ItemRarity.EPIC, color: 0xdfe6e9,
    description: '15% chance to reflect damage when hit',
    trigger: { type: 'on_hit_received', chance: 0.15 },
    effect: { type: 'reflect_damage', mult: 2.0 }
  },
  {
    id: 'berserkers_oath', name: "Berserker's Oath", icon: '🔥',
    rarity: ItemRarity.LEGENDARY, color: 0xff0000,
    description: 'Below 25% HP: 3x damage, but cannot heal',
    trigger: { type: 'on_low_health', threshold: 0.25 },
    effect: { type: 'damage_multiplier', mult: 3.0, duration: 0 }
  },
  {
    id: 'phoenix_plume', name: 'Phoenix Plume', icon: '🔥',
    rarity: ItemRarity.LEGENDARY, color: 0xff6600,
    description: 'Revive once on death with 50% HP + fire nova',
    trigger: { type: 'on_death' },
    effect: { type: 'revive', healthPercent: 0.5 }
  },
  {
    id: 'thunder_core', name: 'Thunder Core', icon: '⚡',
    rarity: ItemRarity.EPIC, color: 0xf9ca24,
    description: 'Every 20 kills triggers chain lightning (5 targets)',
    trigger: { type: 'on_kill_count', every: 20 },
    effect: { type: 'chain_lightning', targets: 5, damage: 100 }
  },
  {
    id: 'vampire_fang', name: 'Vampire Fang', icon: '🧛',
    rarity: ItemRarity.EPIC, color: 0xc0392b,
    description: 'Heal 5% of max HP on each kill',
    trigger: { type: 'on_kill', chance: 1.0 },
    effect: { type: 'heal', percent: 0.05 }
  },
  {
    id: 'gravity_lens', name: 'Gravity Lens', icon: '🌀',
    rarity: ItemRarity.EPIC, color: 0x6c5ce7,
    description: 'Every 15th shot curves toward nearest enemy',
    trigger: { type: 'on_nth_shot', n: 15 },
    effect: { type: 'black_hole', duration: 500 }
  },
  {
    id: 'shadow_step', name: 'Shadow Step', icon: '👤',
    rarity: ItemRarity.EPIC, color: 0x2c3e50,
    description: '20% chance to teleport behind attacker when hit',
    trigger: { type: 'on_hit_received', chance: 0.20 },
    effect: { type: 'teleport_behind' }
  },
  {
    id: 'inferno_ring', name: 'Inferno Ring', icon: '💍',
    rarity: ItemRarity.LEGENDARY, color: 0xff4500,
    description: 'Fire nova (200 dmg) every 30s in combat',
    trigger: { type: 'on_timer', interval: 30000 },
    effect: { type: 'fire_nova', damage: 200, radius: 250 }
  },
  {
    id: 'frost_crown', name: 'Frost Crown', icon: '👑',
    rarity: ItemRarity.EPIC, color: 0x74b9ff,
    description: '25% chance on kill to freeze nearby enemies 2s',
    trigger: { type: 'on_kill', chance: 0.25 },
    effect: { type: 'freeze_enemies', duration: 2000 }
  },
  {
    id: 'nano_swarm', name: 'Nano Swarm', icon: '🤖',
    rarity: ItemRarity.EPIC, color: 0x00cec9,
    description: 'Damage aura deals 15 DPS in 150px radius',
    trigger: { type: 'passive' },
    effect: { type: 'damage_aura', dps: 15, radius: 150, duration: 0 }
  },
  {
    id: 'quantum_core', name: 'Quantum Core', icon: '⚛️',
    rarity: ItemRarity.EPIC, color: 0x6c5ce7,
    description: '10% chance on reload for instant double magazine',
    trigger: { type: 'on_reload', chance: 0.10 },
    effect: { type: 'instant_reload' }
  },
  {
    id: 'soul_harvester', name: 'Soul Harvester', icon: '💀',
    rarity: ItemRarity.LEGENDARY, color: 0x8e44ad,
    description: '10+ kill streak: +50% damage for 5s',
    trigger: { type: 'on_kill_streak', kills: 10, window: 10000 },
    effect: { type: 'buff_damage', percent: 50, duration: 5000 }
  },
  {
    id: 'titans_gauntlet', name: "Titan's Gauntlet", icon: '🥊',
    rarity: ItemRarity.LEGENDARY, color: 0x6c5b7b,
    description: '20% chance to stun boss for 1s on hit',
    trigger: { type: 'on_hit_received', chance: 0.20 },
    effect: { type: 'stun_boss', duration: 1000 }
  },
]

/**
 * Roll for artifact drop (from bosses or elite enemies)
 */
export function rollArtifactDrop(isBoss: boolean, isLegendary: boolean): ArtifactDefinition | null {
  const dropChance = isLegendary ? 0.40 : (isBoss ? 0.10 : 0.02)
  if (Math.random() > dropChance) return null

  // Filter by rarity - legendary bosses can drop legendary artifacts
  const pool = isLegendary
    ? ARTIFACT_POOL
    : ARTIFACT_POOL.filter(a => a.rarity === ItemRarity.EPIC)

  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export class ItemDrop extends Phaser.Physics.Arcade.Sprite {
  private item: ItemDefinition
  private floatTween?: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, x: number, y: number, item: ItemDefinition) {
    super(scene, x, y, '')

    this.item = item

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.createVisual()
    this.setCollideWorldBounds(true)

    // Floating animation
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 15,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Glow effect
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.7, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createVisual() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false)
    const size = 20

    // Draw item based on rarity
    graphics.fillStyle(this.item.color, 1)

    // Different shapes for different rarities
    switch (this.item.rarity) {
      case ItemRarity.LEGENDARY:
        // Glowing diamond shape
        graphics.fillCircle(size, size, size)
        // Outer glow
        graphics.lineStyle(3, this.item.color, 0.5)
        graphics.strokeCircle(size, size, size * 1.5)
        graphics.lineStyle(2, 0xffffff, 0.3)
        graphics.strokeCircle(size, size, size * 0.6)
        break
      case ItemRarity.EPIC:
        // Glowing circle
        graphics.fillCircle(size, size, size)
        graphics.lineStyle(2, this.item.color, 0.5)
        graphics.strokeCircle(size, size, size * 1.3)
        break
      case ItemRarity.RARE:
        // Diamond
        graphics.fillRect(size * 0.3, size * 0.3, size * 1.4, size * 1.4)
        graphics.lineStyle(2, this.item.color, 0.3)
        graphics.strokeRect(size * 0.1, size * 0.1, size * 1.8, size * 1.8)
        break
      case ItemRarity.UNCOMMON:
        // Triangle
        graphics.fillTriangle(size, 0, 0, size * 2, size * 2, size * 2)
        break
      default:
        // Circle
        graphics.fillCircle(size, size, size)
    }

    graphics.generateTexture(`item_${this.item.id}_${Date.now()}`, size * 2.5, size * 2.5)
    graphics.destroy()

    this.setTexture(`item_${this.item.id}_${Date.now()}`)
    this.setScale(1.2)
  }

  collect(player: Player) {
    // Apply item effect
    this.item.effect(player)

    // Show pickup message with rarity color
    const text = this.scene.add.text(this.x, this.y - 40, this.item.name, {
      fontSize: '18px',
      color: `#${this.item.color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    const descText = this.scene.add.text(this.x, this.y - 20, this.item.description, {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Float up and fade out
    this.scene.tweens.add({
      targets: [text, descText],
      y: `-=60`,
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy()
        descText.destroy()
      }
    })

    // Particle burst effect
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      tint: this.item.color,
      lifespan: 600,
      quantity: 20,
      blendMode: 'ADD'
    })

    this.scene.time.delayedCall(600, () => particles.destroy())

    // Cleanup
    if (this.floatTween) {
      this.floatTween.remove()
    }
    this.destroy()
  }

  getItem(): ItemDefinition {
    return this.item
  }
}

// Roll for item drop
export function rollItemDrop(floorNumber: number, dropChance: number): ItemDefinition | null {
  // Check if item drops
  if (Math.random() > dropChance) return null

  // Rarity weights (higher floors have better drops)
  const floorBonus = Math.min(floorNumber / 100, 1) // 0 to 1

  const rarityWeights = {
    [ItemRarity.COMMON]: 50 - (floorBonus * 20),      // 50% → 30%
    [ItemRarity.UNCOMMON]: 30,                         // 30% constant
    [ItemRarity.RARE]: 15 + (floorBonus * 10),        // 15% → 25%
    [ItemRarity.EPIC]: 4 + (floorBonus * 8),          // 4% → 12%
    [ItemRarity.LEGENDARY]: 1 + (floorBonus * 2)      // 1% → 3%
  }

  // Roll rarity
  const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0)
  let roll = Math.random() * totalWeight
  let selectedRarity: ItemRarity = ItemRarity.COMMON

  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    roll -= weight
    if (roll <= 0) {
      selectedRarity = rarity as ItemRarity
      break
    }
  }

  // Filter items by rarity and pick random
  const itemsOfRarity = ITEM_POOL.filter(item => item.rarity === selectedRarity)
  if (itemsOfRarity.length === 0) return null

  return itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)]
}
