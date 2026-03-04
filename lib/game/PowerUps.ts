import * as Phaser from 'phaser'
import Player from './Player'

export enum PowerUpType {
  HEALTH = 'health',
  AMMO = 'ammo',
  DAMAGE_BOOST = 'damage_boost',
  SPEED_BOOST = 'speed_boost',
  INVINCIBILITY = 'invincibility',
  MULTI_SHOT = 'multi_shot',
  RAPID_FIRE = 'rapid_fire',
  MAGNET = 'magnet',
  FREEZE = 'freeze',
  XP_BOOST = 'xp_boost',
  GOLD_RUSH = 'gold_rush',
  NUKE = 'nuke',
  REGEN = 'regen',
  // ═══════════════════════════════════════════════════════════════
  // LEGENDARY POWER-UPS - Game-changing abilities!
  // ═══════════════════════════════════════════════════════════════
  METEOR_STORM = 'meteor_storm',     // Rains meteors on all enemies
  TITAN_MODE = 'titan_mode',         // Giant size + massive damage
  LASER_BEAM = 'laser_beam',         // Continuous laser attack
  BLACK_HOLE = 'black_hole',         // Sucks in all enemies to center
  CHAIN_LIGHTNING = 'chain_lightning', // Lightning bounces between enemies
  SHADOW_CLONE = 'shadow_clone',     // Creates AI-controlled clone
  BERSERKER_RAGE = 'berserker_rage', // Unlimited ammo + speed + damage
  TIME_STOP = 'time_stop',           // Completely freezes time
  // ULTRA LEGENDARY POWER-UPS
  GRAVITY_WELL = 'gravity_well',
  PLASMA_STORM = 'plasma_storm',
  MIRROR_SHIELD = 'mirror_shield',
  QUANTUM_SPLIT = 'quantum_split',
  VOID_RIFT = 'void_rift',
  OVERDRIVE = 'overdrive',
  DEATH_AURA = 'death_aura',
  TEMPORAL_LOOP = 'temporal_loop',
}

interface PowerUpConfig {
  color: number
  icon: string
  duration?: number
  value?: number
}

const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.HEALTH]: { color: 0x2ecc71, icon: '❤️', value: 50 },
  [PowerUpType.AMMO]: { color: 0xf39c12, icon: '📦', value: 100 },
  [PowerUpType.DAMAGE_BOOST]: { color: 0xe74c3c, icon: '💥', duration: 10000 },
  [PowerUpType.SPEED_BOOST]: { color: 0x3498db, icon: '⚡', duration: 8000 },
  [PowerUpType.INVINCIBILITY]: { color: 0xf1c40f, icon: '🛡️', duration: 5000 },
  [PowerUpType.MULTI_SHOT]: { color: 0x9b59b6, icon: '🎯', duration: 12000 },
  [PowerUpType.RAPID_FIRE]: { color: 0xe67e22, icon: '🔫', duration: 10000 },
  [PowerUpType.MAGNET]: { color: 0xff00ff, icon: '🧲', duration: 15000 },
  [PowerUpType.FREEZE]: { color: 0x00bfff, icon: '❄️', duration: 5000 },
  [PowerUpType.XP_BOOST]: { color: 0x00ff00, icon: '✨', duration: 20000 },
  [PowerUpType.GOLD_RUSH]: { color: 0xffd700, icon: '💰', duration: 15000 },
  [PowerUpType.NUKE]: { color: 0xff0000, icon: '☢️', value: 1000 },
  [PowerUpType.REGEN]: { color: 0xff69b4, icon: '💗', duration: 12000, value: 5 },
  // ═══════════════════════════════════════════════════════════════
  // LEGENDARY POWER-UPS - Ultra rare game-changers!
  // ═══════════════════════════════════════════════════════════════
  [PowerUpType.METEOR_STORM]: { color: 0xff6600, icon: '☄️', duration: 8000 },
  [PowerUpType.TITAN_MODE]: { color: 0x6c5b7b, icon: '🗿', duration: 15000 },
  [PowerUpType.LASER_BEAM]: { color: 0x00ff00, icon: '⚡', duration: 6000 },
  [PowerUpType.BLACK_HOLE]: { color: 0x4b0082, icon: '🌀', duration: 5000 },
  [PowerUpType.CHAIN_LIGHTNING]: { color: 0x00ffff, icon: '⚡', duration: 10000 },
  [PowerUpType.SHADOW_CLONE]: { color: 0x8b008b, icon: '👥', duration: 20000 },
  [PowerUpType.BERSERKER_RAGE]: { color: 0xff0000, icon: '😈', duration: 12000 },
  [PowerUpType.TIME_STOP]: { color: 0xffffff, icon: '⏱️', duration: 5000 },
  // ULTRA LEGENDARY POWER-UPS
  [PowerUpType.GRAVITY_WELL]: { color: 0x4b0082, icon: '🌐', duration: 8000 },
  [PowerUpType.PLASMA_STORM]: { color: 0x00ffff, icon: '⛈️', duration: 10000 },
  [PowerUpType.MIRROR_SHIELD]: { color: 0xc0c0c0, icon: '🪞', duration: 12000 },
  [PowerUpType.QUANTUM_SPLIT]: { color: 0xff00ff, icon: '👥', duration: 15000 },
  [PowerUpType.VOID_RIFT]: { color: 0x2d0050, icon: '🕳️', duration: 6000 },
  [PowerUpType.OVERDRIVE]: { color: 0xff4500, icon: '🔥', duration: 10000 },
  [PowerUpType.DEATH_AURA]: { color: 0x800000, icon: '💀', duration: 8000 },
  [PowerUpType.TEMPORAL_LOOP]: { color: 0xf9ca24, icon: '⏰', duration: 10000 },
}

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType
  public icon: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: PowerUpType
  ) {
    super(scene, x, y, '')

    this.powerUpType = type
    const config = POWERUP_CONFIGS[type]

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Create visual
    this.createVisual(config.color)

    // Icon
    this.icon = scene.add.text(x, y, config.icon, {
      fontSize: '24px',
    }).setOrigin(0.5)

    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    scene.tweens.add({
      targets: this.icon,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Pulse effect
    scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Auto-despawn after 20 seconds
    scene.time.delayedCall(20000, () => {
      if (this.active) {
        this.fadeAndDestroy()
      }
    })
  }

  private createVisual(color: number) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false)

    // Glowing circle
    graphics.fillStyle(color, 0.8)
    graphics.fillCircle(16, 16, 16)

    // Outline glow
    graphics.lineStyle(3, color, 0.5)
    graphics.strokeCircle(16, 16, 18)

    graphics.generateTexture(`powerup_${this.powerUpType}`, 32, 32)
    graphics.destroy()

    this.setTexture(`powerup_${this.powerUpType}`)
  }

  collect(player: Player): void {
    const config = POWERUP_CONFIGS[this.powerUpType]

    switch (this.powerUpType) {
      case PowerUpType.HEALTH:
        player.heal(config.value!)
        break
      case PowerUpType.AMMO:
        player.addAmmo(config.value!)
        break
      case PowerUpType.DAMAGE_BOOST:
        player.activateDamageBoost(config.duration!)
        break
      case PowerUpType.SPEED_BOOST:
        player.activateSpeedBoost(config.duration!)
        break
      case PowerUpType.INVINCIBILITY:
        player.activateInvincibility(config.duration!)
        break
      case PowerUpType.MULTI_SHOT:
        player.activateMultiShot(config.duration!)
        break
      case PowerUpType.RAPID_FIRE:
        player.activateRapidFire(config.duration!)
        break
      case PowerUpType.MAGNET:
        player.activateMagnet(config.duration!)
        break
      case PowerUpType.FREEZE:
        player.activateFreeze(config.duration!)
        break
      case PowerUpType.XP_BOOST:
        player.activateXPBoost(config.duration!)
        break
      case PowerUpType.GOLD_RUSH:
        player.activateGoldRush(config.duration!)
        break
      case PowerUpType.NUKE:
        player.activateNuke()
        break
      case PowerUpType.REGEN:
        player.activateRegen(config.duration!, config.value!)
        break
      // ═══════════════════════════════════════════════════════════════
      // LEGENDARY POWER-UPS
      // ═══════════════════════════════════════════════════════════════
      case PowerUpType.METEOR_STORM:
        player.activateMeteorStorm(config.duration!)
        this.emitMessage('☄️ METEOR STORM! Rain fire upon your enemies!', 'legendary')
        break
      case PowerUpType.TITAN_MODE:
        player.activateTitanMode(config.duration!)
        this.emitMessage('🗿 TITAN MODE! You are now UNSTOPPABLE!', 'legendary')
        break
      case PowerUpType.LASER_BEAM:
        player.activateLaserBeam(config.duration!)
        this.emitMessage('⚡ LASER BEAM! Continuous destruction!', 'legendary')
        break
      case PowerUpType.BLACK_HOLE:
        player.activateBlackHole(config.duration!)
        this.emitMessage('🌀 BLACK HOLE! All enemies drawn to their doom!', 'legendary')
        break
      case PowerUpType.CHAIN_LIGHTNING:
        player.activateChainLightning(config.duration!)
        this.emitMessage('⚡ CHAIN LIGHTNING! Zap them all!', 'legendary')
        break
      case PowerUpType.SHADOW_CLONE:
        player.activateShadowClone(config.duration!)
        this.emitMessage('👥 SHADOW CLONE! Fight alongside your double!', 'legendary')
        break
      case PowerUpType.BERSERKER_RAGE:
        player.activateBerserkerRage(config.duration!)
        this.emitMessage('😈 BERSERKER RAGE! UNLIMITED POWER!', 'legendary')
        break
      case PowerUpType.TIME_STOP:
        player.activateTimeStop(config.duration!)
        this.emitMessage('⏱️ TIME STOP! The world stands still!', 'legendary')
        break
      case PowerUpType.GRAVITY_WELL:
        player.activateBlackHole(config.duration!)
        this.emitMessage('🌐 GRAVITY WELL! All enemies pulled to the center!', 'legendary')
        break
      case PowerUpType.PLASMA_STORM:
        player.activateChainLightning(config.duration!)
        this.emitMessage('⛈️ PLASMA STORM! Lightning rains from the sky!', 'legendary')
        break
      case PowerUpType.MIRROR_SHIELD:
        player.activateInvincibility(config.duration!)
        this.emitMessage('🪞 MIRROR SHIELD! All damage reflected back!', 'legendary')
        break
      case PowerUpType.QUANTUM_SPLIT:
        player.activateShadowClone(config.duration!)
        this.emitMessage('👥 QUANTUM SPLIT! 3 clones fight alongside you!', 'legendary')
        break
      case PowerUpType.VOID_RIFT:
        player.activateBlackHole(config.duration!)
        this.emitMessage('🕳️ VOID RIFT! Enemies sucked into oblivion!', 'legendary')
        break
      case PowerUpType.OVERDRIVE:
        player.activateBerserkerRage(config.duration!)
        this.emitMessage('🔥 OVERDRIVE! All stats DOUBLED!', 'legendary')
        break
      case PowerUpType.DEATH_AURA:
        player.activateMeteorStorm(config.duration!)
        this.emitMessage('💀 DEATH AURA! All nearby enemies take damage!', 'legendary')
        break
      case PowerUpType.TEMPORAL_LOOP:
        player.activateTimeStop(config.duration!)
        this.emitMessage('⏰ TEMPORAL LOOP! Time rewinds for you!', 'legendary')
        break
    }

    // Collect effect
    this.scene.tweens.add({
      targets: [this, this.icon],
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.icon.destroy()
        this.destroy()
      },
    })

    // Particle burst
    this.createCollectEffect()
  }

  private createCollectEffect() {
    const config = POWERUP_CONFIGS[this.powerUpType]

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        4,
        config.color
      )

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 50,
        y: this.y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy(),
      })
    }
  }

  private fadeAndDestroy() {
    this.scene.tweens.add({
      targets: [this, this.icon],
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.icon.destroy()
        this.destroy()
      },
    })
  }

  private emitMessage(text: string, type: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gameEvent', {
        detail: {
          type: 'message',
          data: { text, type }
        }
      }))
    }
  }
}

export class PowerUpManager {
  private scene: Phaser.Scene
  public powerUps: Phaser.GameObjects.Group

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.powerUps = scene.add.group()
  }

  spawnRandomPowerUp(x: number, y: number) {
    // Weighted random selection - rare power-ups have lower weights
    const weightedTypes: { type: PowerUpType; weight: number }[] = [
      { type: PowerUpType.HEALTH, weight: 20 },
      { type: PowerUpType.AMMO, weight: 20 },
      { type: PowerUpType.DAMAGE_BOOST, weight: 10 },
      { type: PowerUpType.SPEED_BOOST, weight: 10 },
      { type: PowerUpType.INVINCIBILITY, weight: 5 },
      { type: PowerUpType.MULTI_SHOT, weight: 8 },
      { type: PowerUpType.RAPID_FIRE, weight: 8 },
      { type: PowerUpType.MAGNET, weight: 6 },
      { type: PowerUpType.FREEZE, weight: 5 },
      { type: PowerUpType.XP_BOOST, weight: 7 },
      { type: PowerUpType.GOLD_RUSH, weight: 7 },
      { type: PowerUpType.NUKE, weight: 1 }, // Very rare!
      { type: PowerUpType.REGEN, weight: 6 },
      // ═══════════════════════════════════════════════════════════════
      // LEGENDARY POWER-UPS - Ultra rare! (0.5 weight each)
      // ═══════════════════════════════════════════════════════════════
      { type: PowerUpType.METEOR_STORM, weight: 0.5 },
      { type: PowerUpType.TITAN_MODE, weight: 0.5 },
      { type: PowerUpType.LASER_BEAM, weight: 0.5 },
      { type: PowerUpType.BLACK_HOLE, weight: 0.5 },
      { type: PowerUpType.CHAIN_LIGHTNING, weight: 0.5 },
      { type: PowerUpType.SHADOW_CLONE, weight: 0.5 },
      { type: PowerUpType.BERSERKER_RAGE, weight: 0.5 },
      { type: PowerUpType.TIME_STOP, weight: 0.5 },
      // ULTRA LEGENDARY POWER-UPS (0.3 weight each)
      { type: PowerUpType.GRAVITY_WELL, weight: 0.3 },
      { type: PowerUpType.PLASMA_STORM, weight: 0.3 },
      { type: PowerUpType.MIRROR_SHIELD, weight: 0.3 },
      { type: PowerUpType.QUANTUM_SPLIT, weight: 0.3 },
      { type: PowerUpType.VOID_RIFT, weight: 0.3 },
      { type: PowerUpType.OVERDRIVE, weight: 0.3 },
      { type: PowerUpType.DEATH_AURA, weight: 0.3 },
      { type: PowerUpType.TEMPORAL_LOOP, weight: 0.3 },
    ]

    const totalWeight = weightedTypes.reduce((sum, w) => sum + w.weight, 0)
    let random = Math.random() * totalWeight
    let selectedType = PowerUpType.HEALTH

    for (const wt of weightedTypes) {
      random -= wt.weight
      if (random <= 0) {
        selectedType = wt.type
        break
      }
    }

    const powerUp = new PowerUp(this.scene, x, y, selectedType)
    this.powerUps.add(powerUp)
  }

  spawnPowerUp(x: number, y: number, type: PowerUpType) {
    const powerUp = new PowerUp(this.scene, x, y, type)
    this.powerUps.add(powerUp)
  }

  // Chance to drop power-up from enemy
  tryDropPowerUp(x: number, y: number): void {
    // 30% chance to drop
    if (Math.random() < 0.3) {
      this.spawnRandomPowerUp(x, y)
    }
  }
}
