import * as Phaser from 'phaser'

export interface WeaponType {
  name: string
  damage: number
  fireRate: number
  ammo: number
  maxAmmo: number
}

export const WEAPON_TYPES: WeaponType[] = [
  { name: 'Pistol', damage: 10, fireRate: 300, ammo: 50, maxAmmo: 50 },
  { name: 'Shotgun', damage: 25, fireRate: 800, ammo: 20, maxAmmo: 20 },
  { name: 'SMG', damage: 6, fireRate: 100, ammo: 120, maxAmmo: 120 },
  { name: 'Rifle', damage: 35, fireRate: 500, ammo: 30, maxAmmo: 30 },
  { name: 'Sniper', damage: 100, fireRate: 1500, ammo: 8, maxAmmo: 8 },
  { name: 'Minigun', damage: 4, fireRate: 50, ammo: 300, maxAmmo: 300 },
  { name: 'Rocket Launcher', damage: 200, fireRate: 2000, ammo: 5, maxAmmo: 5 },
  { name: 'Laser Rifle', damage: 15, fireRate: 150, ammo: 80, maxAmmo: 80 },
  // NEW WEAPONS
  { name: 'Flamethrower', damage: 8, fireRate: 30, ammo: 200, maxAmmo: 200 },
  { name: 'Rail Gun', damage: 500, fireRate: 3000, ammo: 2, maxAmmo: 2 },
  { name: 'Grenade Launcher', damage: 120, fireRate: 2000, ammo: 4, maxAmmo: 4 },
]

// EVOLUTION UPDATE: Per-weapon bullet visuals
export interface BulletVisual {
  color: number
  size: number
  shape: 'circle' | 'rect' | 'triangle'
  glow?: number
}

export const BULLET_VISUALS: Record<string, BulletVisual> = {
  Pistol: { color: 0xffff00, size: 4, shape: 'circle' },
  Shotgun: { color: 0xff6600, size: 5, shape: 'circle', glow: 0xff9900 },
  SMG: { color: 0x00ff00, size: 3, shape: 'circle' },
  Rifle: { color: 0x3498db, size: 4, shape: 'rect' },
  Sniper: { color: 0xff0000, size: 3, shape: 'rect', glow: 0xff3333 },
  Minigun: { color: 0xf1c40f, size: 2, shape: 'circle' },
  'Rocket Launcher': { color: 0xff6600, size: 6, shape: 'circle', glow: 0xff3300 },
  'Laser Rifle': { color: 0x00ffff, size: 3, shape: 'rect', glow: 0x00ccff },
  Flamethrower: { color: 0xff3300, size: 4, shape: 'circle', glow: 0xff6600 },
  'Rail Gun': { color: 0x9900ff, size: 4, shape: 'rect', glow: 0xcc66ff },
  'Grenade Launcher': { color: 0xff9900, size: 6, shape: 'circle', glow: 0xffcc00 },
  Laser: { color: 0x00ffff, size: 3, shape: 'rect', glow: 0x00ccff },
  Rocket: { color: 0xff6600, size: 6, shape: 'circle', glow: 0xff3300 },
  Plasma: { color: 0x9b59b6, size: 5, shape: 'circle', glow: 0xbb77dd },
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  public damage: number

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number) {
    super(scene, x, y, '')

    this.damage = damage

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Create bullet visual
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false)
    graphics.fillStyle(0xffff00, 1)
    graphics.fillCircle(4, 4, 4)
    graphics.generateTexture('bullet', 8, 8)
    graphics.destroy()

    this.setTexture('bullet')
    this.setSize(8, 8)

    // Add glow effect
    this.setTint(0xffff00)
  }

  fire(angle: number) {
    const speed = 600

    this.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    )

    this.setRotation(angle)

    // Destroy after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      if (this.active) {
        this.destroy()
      }
    })
  }
}

export class WeaponSystem {
  public bullets: Phaser.GameObjects.Group
  public enemyBullets: Phaser.GameObjects.Group

  constructor(private scene: Phaser.Scene) {
    this.bullets = scene.add.group({
      classType: Bullet,
      maxSize: 200,
      runChildUpdate: false,
    })

    this.enemyBullets = scene.add.group({
      classType: Bullet,
      maxSize: 100,
      runChildUpdate: false,
    })
  }

  fireBullet(x: number, y: number, angle: number, damage: number) {
    const bullet = this.bullets.get(x, y, '', undefined, true) as Bullet

    if (bullet) {
      bullet.damage = damage
      bullet.fire(angle)

      // Muzzle flash
      this.createMuzzleFlash(x, y, angle)
    }
  }

  fireEnemyBullet(x: number, y: number, angle: number, damage: number) {
    const bullet = this.enemyBullets.get(x, y, '', undefined, true) as Bullet

    if (bullet) {
      bullet.damage = damage
      bullet.fire(angle)
      bullet.setTint(0xff0000) // Red bullets for enemies

      // Different muzzle flash
      this.createMuzzleFlash(x, y, angle, 0xff0000)
    }
  }

  private createMuzzleFlash(x: number, y: number, angle: number, color: number = 0xffff00) {
    const flash = this.scene.add.circle(
      x + Math.cos(angle) * 20,
      y + Math.sin(angle) * 20,
      8,
      color,
      0.8
    )

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 100,
      onComplete: () => flash.destroy(),
    })
  }

  update(time: number, delta: number) {
    // Clean up off-screen bullets
    const cleanupBullets = (group: Phaser.GameObjects.Group) => {
      group.children.entries.forEach((bullet: any) => {
        if (bullet.active) {
          const cam = this.scene.cameras.main
          const worldView = cam.worldView

          if (
            bullet.x < worldView.x - 100 ||
            bullet.x > worldView.x + worldView.width + 100 ||
            bullet.y < worldView.y - 100 ||
            bullet.y > worldView.y + worldView.height + 100
          ) {
            bullet.destroy()
          }
        }
      })
    }

    cleanupBullets(this.bullets)
    cleanupBullets(this.enemyBullets)
  }
}
