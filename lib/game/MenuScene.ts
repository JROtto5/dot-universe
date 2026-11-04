import * as Phaser from 'phaser'
import { SaveManager } from '../supabase/SaveManager'
import { LeaderboardService } from '../supabase/LeaderboardService'
import { SaveData, LeaderboardEntry } from '../supabase/client'
import { endlessMode } from './EndlessMode'
import { challengeModes, CHALLENGE_MODES, ChallengeMode } from './ChallengeModes'
// CONVERGENCE UPDATE
import { prestigeSystem, TALENT_DEFINITIONS } from './PrestigeSystem'
import { companionSystem, COMPANION_DEFINITIONS, CompanionType } from './CompanionSystem'
import { settingsManager, GameSettings, DEFAULT_SETTINGS } from './SettingsManager'
import { getWeeklyModifier } from './SeasonalEvents'
// EVOLUTION UPDATE
import { cosmeticSystem, PLAYER_SKINS, WEAPON_SKINS, KILL_EFFECTS, TITLES, TRAIL_EFFECTS, CosmeticCategory } from './CosmeticSystem'

// Color palette for sci-fi cyber theme
const COLORS = {
  bg: 0x0a1929,          // Deep space blue
  panel: 0x1a2332,       // Dark blue-grey
  accent: 0x05878a,      // Cyan tech
  accent2: 0x00d9ff,     // Bright cyan
  highlight: 0x0fefef,   // Electric blue
  text: 0xe0f4ff,        // Light blue-white
  gold: 0x00d9ff,        // Cyan (replaced gold)
  silver: 0x88c0d0,
  bronze: 0x5e81ac,
}

// PLAYER CLASSES - Different starting weapons and stats!
export interface PlayerClass {
  id: string
  name: string
  description: string
  icon: string
  color: number
  startingWeapon: number // weapon index
  bonusHealth: number    // extra health %
  bonusDamage: number    // extra damage %
  bonusSpeed: number     // extra speed %
  bonusFireRate: number  // extra fire rate %
  special: string        // unique ability description
}

export const PLAYER_CLASSES: PlayerClass[] = [
  {
    id: 'soldier',
    name: 'SOLDIER',
    description: 'Balanced fighter. Good all-around stats.',
    icon: '🎖️',
    color: 0x3498db,
    startingWeapon: 0,  // Pistol
    bonusHealth: 10,
    bonusDamage: 10,
    bonusSpeed: 0,
    bonusFireRate: 0,
    special: '+10% HP & Damage'
  },
  {
    id: 'gunslinger',
    name: 'GUNSLINGER',
    description: 'Fast shooter with rapid fire. Low health.',
    icon: '🔫',
    color: 0xf39c12,
    startingWeapon: 1,  // SMG
    bonusHealth: -20,
    bonusDamage: 0,
    bonusSpeed: 15,
    bonusFireRate: 30,
    special: '+30% Fire Rate, -20% HP'
  },
  {
    id: 'tank',
    name: 'TANK',
    description: 'Heavy armor, slow but powerful.',
    icon: '🛡️',
    color: 0x27ae60,
    startingWeapon: 2,  // Shotgun
    bonusHealth: 50,
    bonusDamage: 25,
    bonusSpeed: -20,
    bonusFireRate: -15,
    special: '+50% HP, +25% Damage'
  },
  {
    id: 'assassin',
    name: 'ASSASSIN',
    description: 'Glass cannon. Extreme damage, fragile.',
    icon: '🗡️',
    color: 0x9b59b6,
    startingWeapon: 3,  // Sniper
    bonusHealth: -30,
    bonusDamage: 75,
    bonusSpeed: 25,
    bonusFireRate: -10,
    special: '+75% Damage, -30% HP'
  },
  {
    id: 'berserker',
    name: 'BERSERKER',
    description: 'Gets stronger as health drops!',
    icon: '🔥',
    color: 0xe74c3c,
    startingWeapon: 0,  // Pistol
    bonusHealth: 0,
    bonusDamage: 0,
    bonusSpeed: 10,
    bonusFireRate: 10,
    special: 'Damage +50% when below 50% HP'
  },
  {
    id: 'vampire',
    name: 'VAMPIRE',
    description: 'Heals from kills. Start weak, grow strong.',
    icon: '🧛',
    color: 0x8e44ad,
    startingWeapon: 1,  // SMG
    bonusHealth: -10,
    bonusDamage: -10,
    bonusSpeed: 15,
    bonusFireRate: 20,
    special: 'Heal 3% HP per kill'
  }
]

export default class MenuScene extends Phaser.Scene {
  private leaderboardService!: LeaderboardService
  private saveManager!: SaveManager
  private leaderboardContainer!: Phaser.GameObjects.Container
  private saveSlotContainers: Phaser.GameObjects.Container[] = []
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter
  private refreshTimer?: Phaser.Time.TimerEvent
  private userId: string | null = null // Authenticated user ID
  private playerName: string = 'Player' // Default player name

  // Class selection
  private classSelectionContainer: Phaser.GameObjects.Container | null = null
  private selectedClass: PlayerClass = PLAYER_CLASSES[0]

  // CONVERGENCE UPDATE: Prestige, Settings, Companion overlays
  private prestigeOverlay: Phaser.GameObjects.Container | null = null
  private settingsOverlay: Phaser.GameObjects.Container | null = null
  private companionOverlay: Phaser.GameObjects.Container | null = null
  private cosmeticsOverlay: Phaser.GameObjects.Container | null = null

  constructor() {
    super({ key: 'MenuScene' })
  }

  preload() {
    // Create a simple square particle texture
    const graphics = this.add.graphics()
    graphics.fillStyle(COLORS.accent, 1)
    graphics.fillRect(0, 0, 8, 8)
    graphics.generateTexture('particle', 8, 8)
    graphics.destroy()
  }

  create() {
    this.initServices()

    // Get authenticated user from registry
    const currentUser = this.registry.get('currentUser')
    if (currentUser) {
      this.userId = currentUser.id
      this.playerName = currentUser.displayName || 'Player'
    }

    // Check challenge mode unlocks
    try {
      const progress = JSON.parse(localStorage.getItem('dotslayer_progress') || '{}')
      const synergyStats = JSON.parse(localStorage.getItem('dotslayer_synergy_stats') || '{}')
      challengeModes.checkUnlocks(progress.highestFloor || 0, synergyStats.bossesKilled || 0)
    } catch (e) { /* ignore */ }

    this.createBackground()
    this.createParticles()
    this.createTitle()
    this.createConvergenceButtons()
    this.createGameModeButtons()
    this.loadAndDisplayLeaderboard()
    this.loadAndDisplaySaveSlots()
    this.startAutoRefresh()
  }

  private initServices() {
    this.leaderboardService = LeaderboardService.getInstance()
    this.saveManager = SaveManager.getInstance()
  }

  /**
   * True while this scene is still running. Async callbacks (leaderboard /
   * save fetches) can resolve after the scene or the whole game was destroyed
   * (e.g. React strict-mode remount, navigating away), at which point
   * `this.scene` (the ScenePlugin) has already been torn down and calling
   * `this.scene.isActive()` throws.
   */
  private isSceneAlive(): boolean {
    try {
      return !!this.sys && !!this.sys.settings && this.sys.isActive() && !!this.add
    } catch {
      return false
    }
  }

  /**
   * Single source of truth for the vertical layout of the start menu.
   * Sections are stacked bottom-up (utility buttons, save slots, optional game
   * modes) and the leaderboard panel gets whatever space is left below the
   * title block, so the sections can never overlap regardless of viewport.
   */
  private getMenuLayout() {
    const { width, height } = this.scale
    const isSmallScreen = width < 600

    // Header: title (y=80), subtitle (y=140), prestige / weekly lines (y=170/195)
    const contentTop = (prestigeSystem.getPrestigeLevel() > 0 ? 195 : 170) + 20

    // Footer: utility button row
    const utilityBtnSize = isSmallScreen ? 36 : 44
    const utilityY = height - (isSmallScreen ? 40 : 50)
    const utilityTop = utilityY - utilityBtnSize / 2

    // Save slots sit directly above the utility row
    const slotHeight = isSmallScreen ? 90 : 110
    const slotY = utilityTop - 16 - slotHeight / 2
    const saveLabelY = slotY - slotHeight / 2 - 22
    let sectionTop = saveLabelY - 18

    // Optional game-mode row above the save slots
    const showModes = endlessMode.isUnlocked() || challengeModes.getAllModes().some(m => m.unlocked)
    let modesButtonY = 0
    if (showModes) {
      const modeBtnHeight = isSmallScreen ? 45 : 55
      const hasBestEndless = endlessMode.isUnlocked() && endlessMode.getBestFloor() > 0
      const modesBottom = sectionTop - 12 - (hasBestEndless ? 22 : 0)
      modesButtonY = modesBottom - modeBtnHeight / 2
      // "GAME MODES" label is drawn 40px above the button centre
      sectionTop = modesButtonY - 40 - 14
    }

    // Leaderboard fills the remaining gap (capped at 380px, centred in the gap)
    const gapTop = contentTop
    const gapBottom = sectionTop - 14
    const panelHeight = Math.max(0, Math.min(380, gapBottom - gapTop))
    const panelY = (gapTop + gapBottom) / 2
    const panelTop = panelY - panelHeight / 2

    const entrySpacing = isSmallScreen ? 28 : 32
    const firstEntryOffset = 60
    const maxEntries = Math.min(
      isSmallScreen ? 8 : 10,
      Math.max(1, Math.floor((panelHeight - firstEntryOffset - 14) / entrySpacing) + 1)
    )

    return {
      isSmallScreen,
      utilityY,
      slotY,
      slotHeight,
      saveLabelY,
      showModes,
      modesButtonY,
      panelY,
      panelTop,
      panelHeight,
      showLeaderboard: panelHeight >= 110,
      entrySpacing,
      firstEntryOffset,
      maxEntries,
    }
  }

  private createBackground() {
    const { width, height } = this.scale

    // Almost black background
    this.add.rectangle(0, 0, width * 2, height * 2, COLORS.bg).setOrigin(0)

    // Animated grid pattern
    const graphics = this.add.graphics()
    graphics.lineStyle(1, COLORS.panel, 0.3)

    const gridSize = 50
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y)
    }
  }

  private createParticles() {
    const { width, height } = this.scale

    // Floating glowing squares
    this.particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: { min: -100, max: height + 100 },
      speedY: { min: 20, max: 50 },
      lifespan: 10000,
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.8, end: 0 },
      tint: [COLORS.accent, COLORS.accent2, COLORS.highlight],
      frequency: 300,
      blendMode: 'ADD'
    })
  }

  private createTitle() {
    const { width } = this.scale

    // Main title
    const title = this.add.text(width / 2, 80, 'DOT SLAYER', {
      fontSize: '72px',
      fontStyle: 'bold',
      color: `#${COLORS.accent.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5)

    // Subtitle
    const subtitle = this.add.text(width / 2, 140, '150 FLOORS CHALLENGE', {
      fontSize: '28px',
      color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    // Pulsing glow effect
    this.tweens.add({
      targets: [title, subtitle],
      scale: { from: 1, to: 1.02 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createGameModeButtons() {
    const { width, height } = this.scale
    const centerX = width / 2
    const layout = this.getMenuLayout()
    const isSmallScreen = layout.isSmallScreen
    // buttonY is the historical anchor: label at buttonY - 30, buttons at buttonY + 10
    const buttonY = layout.modesButtonY - 10

    // Only show if any modes are unlocked
    const endlessUnlocked = endlessMode.isUnlocked()
    const allModes = challengeModes.getAllModes()
    const unlockedModes = allModes.filter(m => m.unlocked)

    if (!endlessUnlocked && unlockedModes.length === 0) return

    // "GAME MODES" label
    this.add.text(centerX, buttonY - 30, 'GAME MODES', {
      fontSize: isSmallScreen ? '16px' : '20px',
      fontStyle: 'bold',
      color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5)

    const buttonWidth = isSmallScreen ? 100 : 130
    const buttonHeight = isSmallScreen ? 45 : 55
    const spacing = isSmallScreen ? 10 : 15

    // Build list of mode buttons to show
    const buttons: Array<{ label: string; icon: string; color: number; onClick: () => void }> = []

    if (endlessUnlocked) {
      buttons.push({
        label: 'ENDLESS',
        icon: '🌌',
        color: 0xff0266,
        onClick: () => {
          this.registry.set('gameMode', 'endless')
          this.showClassSelection()
        }
      })
    }

    for (const mode of unlockedModes) {
      buttons.push({
        label: mode.name.split(' ')[0], // First word only for compactness
        icon: mode.icon,
        color: mode.color,
        onClick: () => {
          this.registry.set('gameMode', `challenge_${mode.id}`)
          this.showClassSelection()
        }
      })
    }

    // Render buttons horizontally centered
    const totalWidth = buttons.length * buttonWidth + (buttons.length - 1) * spacing
    const startX = centerX - totalWidth / 2 + buttonWidth / 2

    buttons.forEach((btn, index) => {
      const x = startX + index * (buttonWidth + spacing)
      const y = buttonY + 10

      const bg = this.add.rectangle(x, y, buttonWidth, buttonHeight, COLORS.panel, 0.9)
      bg.setStrokeStyle(2, btn.color, 0.7)
      bg.setInteractive({ useHandCursor: true })

      const label = this.add.text(x, y - 6, btn.icon, {
        fontSize: isSmallScreen ? '16px' : '20px',
      }).setOrigin(0.5)

      const text = this.add.text(x, y + 14, btn.label, {
        fontSize: isSmallScreen ? '9px' : '11px',
        fontStyle: 'bold',
        color: `#${btn.color.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5)

      bg.on('pointerover', () => {
        bg.setStrokeStyle(3, COLORS.highlight, 1)
        this.tweens.add({ targets: [bg, label, text], scale: 1.05, duration: 150 })
      })
      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, btn.color, 0.7)
        this.tweens.add({ targets: [bg, label, text], scale: 1, duration: 150 })
      })
      bg.on('pointerdown', btn.onClick)
    })

    // Show best endless floor if applicable
    if (endlessUnlocked && endlessMode.getBestFloor() > 0) {
      this.add.text(centerX, buttonY + 50, `Best Endless: Floor ${endlessMode.getBestFloor()}`, {
        fontSize: '12px',
        color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5)
    }
  }

  private async loadAndDisplayLeaderboard() {
    const { width } = this.scale
    const centerX = width / 2
    const layout = this.getMenuLayout()
    const isSmallScreen = layout.isSmallScreen

    // Not enough vertical room (very short viewport): skip the panel rather
    // than drawing it on top of the save slots.
    if (!layout.showLeaderboard) return

    // Leaderboard panel background - responsive sizing
    const panelWidth = Math.min(700, width * 0.9)
    const panelHeight = layout.panelHeight
    const panelX = centerX
    const panelY = layout.panelY

    const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, COLORS.panel, 0.9)
    panel.setStrokeStyle(2, COLORS.accent, 0.5)

    // Header - responsive font size
    const headerFontSize = isSmallScreen ? '24px' : '32px'
    const header = this.add.text(panelX, panelY - panelHeight/2 + 25, '🏆 LEADERBOARD', {
      fontSize: headerFontSize,
      fontStyle: 'bold',
      color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5)

    // Container for leaderboard entries
    this.leaderboardContainer = this.add.container(0, 0)

    // Fetch and display leaderboard
    await this.refreshLeaderboard()
  }

  private async refreshLeaderboard() {
    if (!this.leaderboardContainer) return

    // Clear existing entries
    this.leaderboardContainer.removeAll(true)

    const { width } = this.scale
    const centerX = width / 2
    const layout = this.getMenuLayout()
    const isSmallScreen = layout.isSmallScreen
    const startY = layout.panelTop + layout.firstEntryOffset
    const entrySpacing = layout.entrySpacing
    const messageY = layout.panelY + 10

    try {
      // Only fetch as many entries as fit in the panel
      const topScores = await this.leaderboardService.getTopScores(layout.maxEntries)

      // Check if scene is still active after async operation
      if (!this.isSceneAlive()) return

      if (topScores.length === 0) {
        const noScoresText = this.add.text(centerX, messageY, 'No scores yet!', {
          fontSize: isSmallScreen ? '16px' : '20px',
          color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5)
        this.leaderboardContainer.add(noScoresText)
        return
      }

      topScores.forEach((entry, index) => {
        const entryY = startY + index * entrySpacing
        this.createLeaderboardEntry(entry, index + 1, entryY)
      })
    } catch (error) {
      console.error('Failed to load leaderboard:', error)

      // Check if scene is still active before showing error
      if (!this.isSceneAlive()) return

      const errorText = this.add.text(centerX, messageY, 'Failed to load', {
        fontSize: isSmallScreen ? '16px' : '20px',
        color: `#${COLORS.highlight.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5)
      this.leaderboardContainer.add(errorText)
    }
  }

  private createLeaderboardEntry(entry: LeaderboardEntry, rank: number, y: number) {
    const { width } = this.scale
    const centerX = width / 2
    const panelWidth = Math.min(700, width * 0.85)
    const isSmallScreen = width < 600

    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
    let textColor = COLORS.text

    if (rank === 1) textColor = COLORS.gold
    else if (rank === 2) textColor = COLORS.silver
    else if (rank === 3) textColor = COLORS.bronze

    // Font sizes based on screen size
    const fontSize = isSmallScreen ? '14px' : '18px'
    const smallFontSize = isSmallScreen ? '12px' : '16px'

    // Rank/medal
    const rankText = this.add.text(centerX - panelWidth/2 + 20, y, medal, {
      fontSize: fontSize,
      color: `#${textColor.toString(16).padStart(6, '0')}`,
      fontStyle: rank <= 3 ? 'bold' : 'normal',
    }).setOrigin(0, 0.5)

    // Player name - truncate long names
    let playerName = entry.display_name || 'Anonymous'
    const maxNameLength = isSmallScreen ? 8 : 12
    if (playerName.length > maxNameLength) {
      playerName = playerName.substring(0, maxNameLength) + '...'
    }
    const nameText = this.add.text(centerX - panelWidth/2 + 60, y, playerName, {
      fontSize: fontSize,
      color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
    }).setOrigin(0, 0.5)

    // Score - positioned relative to panel
    const scoreX = isSmallScreen ? centerX + 20 : centerX + 30
    const scoreText = this.add.text(scoreX, y, `$${entry.score.toLocaleString()}`, {
      fontSize: fontSize,
      fontStyle: 'bold',
      color: `#${COLORS.accent.toString(16).padStart(6, '0')}`,
    }).setOrigin(0, 0.5)

    // Stage reached - right aligned
    const stageText = this.add.text(centerX + panelWidth/2 - 20, y, `F${entry.floor_reached}`, {
      fontSize: smallFontSize,
      color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
    }).setOrigin(1, 0.5)

    this.leaderboardContainer.add([rankText, nameText, scoreText, stageText])
  }

  private async loadAndDisplaySaveSlots() {
    const { width } = this.scale
    const centerX = width / 2
    const layout = this.getMenuLayout()
    const isSmallScreen = layout.isSmallScreen
    const bottomY = layout.slotY

    // Save slots label - positioned above slots
    const label = this.add.text(centerX, layout.saveLabelY, 'SAVE SLOTS', {
      fontSize: isSmallScreen ? '18px' : '24px',
      fontStyle: 'bold',
      color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5)

    // Responsive slot spacing
    const slotSpacing = isSmallScreen ? Math.min(180, width / 3.5) : 220

    try {
      // Check if user is authenticated
      if (!this.userId) {
        console.error('No user ID available - user not authenticated')
        // Still create empty slots for UI
        for (let slot = 1; slot <= 3; slot++) {
          const slotX = centerX + (slot - 2) * slotSpacing
          const slotY = bottomY
          this.createSaveSlot(slot, slotX, slotY, undefined)
        }
        return
      }

      const saves = await this.saveManager.listSaves(this.userId)

      // Check if scene is still active after async operation
      if (!this.isSceneAlive()) return

      const savesBySlot = new Map<number, SaveData>()
      saves.forEach(save => savesBySlot.set(save.save_slot, save))

      // Create 3 save slots
      for (let slot = 1; slot <= 3; slot++) {
        const slotX = centerX + (slot - 2) * slotSpacing
        const slotY = bottomY
        const saveData = savesBySlot.get(slot)

        this.createSaveSlot(slot, slotX, slotY, saveData)
      }
    } catch (error) {
      console.error('Failed to load saves:', error)
    }
  }

  private createSaveSlot(slot: number, x: number, y: number, saveData?: SaveData) {
    const { width } = this.scale
    const isSmallScreen = width < 600
    const container = this.add.container(x, y)

    // Slot background - responsive sizing
    const slotWidth = isSmallScreen ? 160 : 200
    const slotHeight = isSmallScreen ? 90 : 110
    const bg = this.add.rectangle(0, 0, slotWidth, slotHeight, COLORS.panel, 0.9)
    bg.setStrokeStyle(2, COLORS.accent, 0.5)
    bg.setInteractive({ useHandCursor: true })

    // Slot label - responsive
    const labelY = isSmallScreen ? -35 : -42
    const slotLabel = this.add.text(0, labelY, `SLOT ${slot}`, {
      fontSize: isSmallScreen ? '12px' : '14px',
      fontStyle: 'bold',
      color: `#${COLORS.accent.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5)

    container.add([bg, slotLabel])

    if (saveData) {
      const pd = saveData.player_data

      // Check if save is dead
      if (!saveData.is_alive) {
        // Dead save - show skull and grayed out
        bg.setFillStyle(0x2c1010, 0.9)
        bg.setStrokeStyle(2, 0x8b0000, 0.7)

        const skullText = this.add.text(0, -20, '💀', {
          fontSize: '40px',
        }).setOrigin(0.5)

        const deadText = this.add.text(0, 15, 'DEAD', {
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#8b0000',
        }).setOrigin(0.5)

        const statsText = this.add.text(0, 35, `Lvl ${pd.level} | Floor ${saveData.floor_number}`, {
          fontSize: '12px',
          color: '#666666',
        }).setOrigin(0.5)

        container.add([skullText, deadText, statsText])

        // Click to start new game in this slot
        bg.on('pointerover', () => {
          bg.setStrokeStyle(3, COLORS.highlight, 1)
          this.tweens.add({
            targets: container,
            scale: 1.05,
            duration: 200,
          })
        })

        bg.on('pointerout', () => {
          bg.setStrokeStyle(2, 0x8b0000, 0.7)
          this.tweens.add({
            targets: container,
            scale: 1,
            duration: 200,
          })
        })

        bg.on('pointerdown', () => {
          // Start new game (will overwrite dead save)
          this.startNewGame()
        })
      } else {
        // Alive save - display save info
        const levelText = this.add.text(0, -15, `Level ${pd.level}`, {
          fontSize: '18px',
          fontStyle: 'bold',
          color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5)

        const moneyText = this.add.text(0, 5, `$${pd.money.toLocaleString()}`, {
          fontSize: '16px',
          color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5)

        const stageText = this.add.text(0, 25, `Floor ${saveData.floor_number}`, {
          fontSize: '14px',
          color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5)

        container.add([levelText, moneyText, stageText])

        // Continue button
        bg.on('pointerover', () => {
          bg.setStrokeStyle(3, COLORS.accent2, 1)
          this.tweens.add({
            targets: container,
            scale: 1.05,
            duration: 200,
          })
        })

        bg.on('pointerout', () => {
          bg.setStrokeStyle(2, COLORS.accent, 0.5)
          this.tweens.add({
            targets: container,
            scale: 1,
            duration: 200,
          })
        })

        bg.on('pointerdown', () => {
          this.continueGame(saveData)
        })
      }
    } else {
      // Empty slot - New Game
      const newGameText = this.add.text(0, 0, 'NEW GAME', {
        fontSize: '20px',
        fontStyle: 'bold',
        color: `#${COLORS.highlight.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5)

      container.add(newGameText)

      // New game button
      bg.on('pointerover', () => {
        bg.setStrokeStyle(3, COLORS.highlight, 1)
        this.tweens.add({
          targets: container,
          scale: 1.05,
          duration: 200,
        })
      })

      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, COLORS.accent, 0.5)
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 200,
        })
      })

      bg.on('pointerdown', () => {
        this.startNewGame()
      })
    }

    this.saveSlotContainers.push(container)
  }

  private startAutoRefresh() {
    // Refresh leaderboard every 30 seconds
    this.refreshTimer = this.time.addEvent({
      delay: 30000,
      callback: () => this.refreshLeaderboard(),
      loop: true
    })
  }

  private startNewGame() {
    // Show class selection UI
    this.showClassSelection()
  }

  private showClassSelection() {
    const { width, height } = this.scale
    const centerX = width / 2
    const centerY = height / 2

    // Create container for class selection
    this.classSelectionContainer = this.add.container(0, 0)

    // Dark overlay
    const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.85)
    overlay.setOrigin(0)
    this.classSelectionContainer.add(overlay)

    // Title - positioned relative to center
    const title = this.add.text(centerX, centerY - 280, 'CHOOSE YOUR CLASS', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)
    this.classSelectionContainer.add(title)

    // Subtitle
    const subtitle = this.add.text(centerX, centerY - 240, 'Each class has unique bonuses and starting weapons', {
      fontSize: '16px',
      color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5)
    this.classSelectionContainer.add(subtitle)

    // Create class cards - 3 per row, CENTERED on screen
    const cardWidth = 180
    const cardHeight = 180
    const cardsPerRow = 3
    const spacing = 20

    // Calculate total grid dimensions
    const numRows = Math.ceil(PLAYER_CLASSES.length / cardsPerRow)
    const totalGridWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing
    const totalGridHeight = numRows * cardHeight + (numRows - 1) * spacing

    // Center the grid
    const startX = centerX - totalGridWidth / 2 + cardWidth / 2
    const startY = centerY - totalGridHeight / 2 + cardHeight / 2 - 20

    PLAYER_CLASSES.forEach((playerClass, index) => {
      const row = Math.floor(index / cardsPerRow)
      const col = index % cardsPerRow
      const x = startX + col * (cardWidth + spacing)
      const y = startY + row * (cardHeight + spacing)

      this.createClassCard(playerClass, x, y, cardWidth, cardHeight)
    })

    // Back button - positioned below the cards with more spacing
    const buttonY = centerY + 200
    const backBtn = this.add.rectangle(centerX - 130, buttonY, 150, 45, COLORS.panel, 0.9)
    backBtn.setStrokeStyle(2, COLORS.accent, 0.5)
    backBtn.setInteractive({ useHandCursor: true })

    const backText = this.add.text(centerX - 130, buttonY, '← BACK', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: `#${COLORS.text.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5)

    backBtn.on('pointerover', () => backBtn.setStrokeStyle(3, COLORS.highlight, 1))
    backBtn.on('pointerout', () => backBtn.setStrokeStyle(2, COLORS.accent, 0.5))
    backBtn.on('pointerdown', () => this.hideClassSelection())

    this.classSelectionContainer.add([backBtn, backText])

    // Start button - with more spacing from back button
    const startBtn = this.add.rectangle(centerX + 130, buttonY, 150, 45, COLORS.accent, 0.9)
    startBtn.setStrokeStyle(2, COLORS.accent2, 1)
    startBtn.setInteractive({ useHandCursor: true })

    const startText = this.add.text(centerX + 130, buttonY, 'START →', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5)

    startBtn.on('pointerover', () => {
      startBtn.setFillStyle(COLORS.accent2, 1)
      this.tweens.add({ targets: startBtn, scale: 1.05, duration: 100 })
    })
    startBtn.on('pointerout', () => {
      startBtn.setFillStyle(COLORS.accent, 0.9)
      this.tweens.add({ targets: startBtn, scale: 1, duration: 100 })
    })
    startBtn.on('pointerdown', () => this.launchGameWithClass())

    this.classSelectionContainer.add([startBtn, startText])

    // Tutorial skip toggle
    const tutorialComplete = typeof window !== 'undefined' && localStorage.getItem('dotslayer_tutorial_complete') === 'true'
    const tutorialLabel = tutorialComplete ? 'Tutorial: SKIPPED' : 'Tutorial: ON'
    const tutorialToggle = this.add.text(centerX, buttonY + 50, tutorialLabel, {
      fontSize: '14px',
      color: tutorialComplete ? '#95a5a6' : '#2ecc71',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    tutorialToggle.on('pointerdown', () => {
      const isComplete = localStorage.getItem('dotslayer_tutorial_complete') === 'true'
      localStorage.setItem('dotslayer_tutorial_complete', isComplete ? 'false' : 'true')
      tutorialToggle.setText(isComplete ? 'Tutorial: ON' : 'Tutorial: SKIPPED')
      tutorialToggle.setColor(isComplete ? '#2ecc71' : '#95a5a6')
    })

    this.classSelectionContainer.add(tutorialToggle)
  }

  private createClassCard(playerClass: PlayerClass, x: number, y: number, width: number, height: number) {
    if (!this.classSelectionContainer) return

    const isSelected = this.selectedClass.id === playerClass.id

    // Card background
    const bg = this.add.rectangle(x, y, width, height, isSelected ? playerClass.color : COLORS.panel, 0.9)
    bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? COLORS.highlight : COLORS.accent, isSelected ? 1 : 0.5)
    bg.setInteractive({ useHandCursor: true })

    // Icon - centered in upper portion
    const icon = this.add.text(x, y - 50, playerClass.icon, {
      fontSize: '36px',
    }).setOrigin(0.5)

    // Name
    const name = this.add.text(x, y - 15, playerClass.name, {
      fontSize: '14px',
      fontStyle: 'bold',
      color: isSelected ? '#ffffff' : `#${COLORS.accent2.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5)

    // Description - compact
    const desc = this.add.text(x, y + 10, playerClass.description, {
      fontSize: '10px',
      color: isSelected ? '#dddddd' : `#${COLORS.text.toString(16).padStart(6, '0')}`,
      wordWrap: { width: width - 15 },
      align: 'center',
    }).setOrigin(0.5, 0)

    // Special ability - at bottom
    const special = this.add.text(x, y + 55, playerClass.special, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: isSelected ? '#ffff00' : `#${COLORS.gold.toString(16).padStart(6, '0')}`,
      wordWrap: { width: width - 10 },
      align: 'center',
    }).setOrigin(0.5)

    this.classSelectionContainer.add([bg, icon, name, desc, special])

    // Click handler
    bg.on('pointerdown', () => {
      this.selectedClass = playerClass
      this.hideClassSelection()
      this.showClassSelection() // Refresh to show new selection
    })

    bg.on('pointerover', () => {
      if (!isSelected) {
        bg.setStrokeStyle(3, COLORS.highlight, 0.8)
        this.tweens.add({ targets: [bg, icon, name, desc, special], scale: 1.02, duration: 100 })
      }
    })

    bg.on('pointerout', () => {
      if (!isSelected) {
        bg.setStrokeStyle(2, COLORS.accent, 0.5)
        this.tweens.add({ targets: [bg, icon, name, desc, special], scale: 1, duration: 100 })
      }
    })
  }

  private hideClassSelection() {
    if (this.classSelectionContainer) {
      this.classSelectionContainer.destroy()
      this.classSelectionContainer = null
    }
  }

  private launchGameWithClass() {
    // Store selected class in registry
    this.registry.set('selectedClass', this.selectedClass)

    // Fade out with class color flash
    const r = (this.selectedClass.color >> 16) & 0xff
    const g = (this.selectedClass.color >> 8) & 0xff
    const b = this.selectedClass.color & 0xff
    this.cameras.main.flash(300, r, g, b, false)

    this.time.delayedCall(300, () => {
      this.scene.start('GameSceneV3')
    })
  }

  private async continueGame(saveData: SaveData) {
    // Store save data for GameSceneV3 to load
    this.registry.set('loadSaveData', saveData)

    // Fade out with cyan flash
    this.cameras.main.flash(300, 3, 218, 198, false)

    this.time.delayedCall(300, () => {
      this.scene.start('GameSceneV3')
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // CONVERGENCE UPDATE: Prestige, Settings, Companion buttons
  // ═══════════════════════════════════════════════════════════════

  private createConvergenceButtons() {
    const { width, height } = this.scale
    const isSmallScreen = width < 600

    // Show prestige level badge if > 0
    const pLevel = prestigeSystem.getPrestigeLevel()
    const ngTier = prestigeSystem.getNGPlusTier()
    if (pLevel > 0) {
      this.add.text(width / 2, 170, `⭐ Prestige ${pLevel}${ngTier > 0 ? ` | NG+${ngTier}` : ''} | ${prestigeSystem.getAvailableAP()} AP`, {
        fontSize: isSmallScreen ? '13px' : '16px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5)
    }

    // Weekly modifier display
    const weeklyMod = getWeeklyModifier()
    this.add.text(width / 2, pLevel > 0 ? 195 : 170, `${weeklyMod.icon} Weekly: ${weeklyMod.name}`, {
      fontSize: isSmallScreen ? '11px' : '13px',
      color: '#88c0d0',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5)

    // Row of utility buttons: Prestige | Companions | Settings
    const btnSize = isSmallScreen ? 36 : 44
    const btnSpacing = isSmallScreen ? 8 : 12
    const btnY = height - (isSmallScreen ? 40 : 50)
    const buttons = [
      { label: '⭐', tooltip: 'PRESTIGE', onClick: () => this.showPrestigeOverlay(), show: pLevel > 0 || this.hasReachedFloor50() },
      { label: '🐾', tooltip: 'COMPANIONS', onClick: () => this.showCompanionOverlay(), show: companionSystem.getUnlockedCompanions().length > 0 },
      { label: '🎨', tooltip: 'COSMETICS', onClick: () => this.showCosmeticsOverlay(), show: true },
      { label: '⚙️', tooltip: 'SETTINGS', onClick: () => this.showSettingsOverlay(), show: true },
    ].filter(b => b.show)

    const totalBtnWidth = buttons.length * btnSize + (buttons.length - 1) * btnSpacing
    const btnStartX = width / 2 - totalBtnWidth / 2 + btnSize / 2

    buttons.forEach((btn, i) => {
      const x = btnStartX + i * (btnSize + btnSpacing)
      const bg = this.add.rectangle(x, btnY, btnSize, btnSize, COLORS.panel, 0.9)
      bg.setStrokeStyle(2, COLORS.accent, 0.5)
      bg.setInteractive({ useHandCursor: true })
      const icon = this.add.text(x, btnY - 4, btn.label, { fontSize: isSmallScreen ? '16px' : '20px' }).setOrigin(0.5)
      const label = this.add.text(x, btnY + 16, btn.tooltip, { fontSize: '8px', color: `#${COLORS.text.toString(16).padStart(6, '0')}` }).setOrigin(0.5)
      bg.on('pointerover', () => { bg.setStrokeStyle(3, COLORS.highlight, 1); this.tweens.add({ targets: [bg, icon, label], scale: 1.1, duration: 100 }) })
      bg.on('pointerout', () => { bg.setStrokeStyle(2, COLORS.accent, 0.5); this.tweens.add({ targets: [bg, icon, label], scale: 1, duration: 100 }) })
      bg.on('pointerdown', btn.onClick)
    })
  }

  private hasReachedFloor50(): boolean {
    try {
      const progress = JSON.parse(localStorage.getItem('dotslayer_progress') || '{}')
      return (progress.highestFloor || 0) >= 50
    } catch { return false }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRESTIGE OVERLAY with Talent Tree
  // ═══════════════════════════════════════════════════════════════

  private showPrestigeOverlay() {
    if (this.prestigeOverlay) return
    const { width, height } = this.scale
    const cx = width / 2, cy = height / 2

    this.prestigeOverlay = this.add.container(0, 0).setDepth(1000)
    const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.9).setOrigin(0)
    this.prestigeOverlay.add(overlay)

    // Title
    const title = this.add.text(cx, 30, `⭐ ASCENSION — Prestige ${prestigeSystem.getPrestigeLevel()}`, {
      fontSize: '28px', fontStyle: 'bold', color: '#ffd700', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)
    this.prestigeOverlay.add(title)

    // AP display
    const apText = this.add.text(cx, 65, `Available AP: ${prestigeSystem.getAvailableAP()} | NG+ Tier: ${prestigeSystem.getNGPlusTier()}`, {
      fontSize: '16px', color: '#00d9ff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5)
    this.prestigeOverlay.add(apText)

    // Stats
    const stats = prestigeSystem.getPrestigeStats()
    const statsText = this.add.text(cx, 90, `Total Prestiges: ${stats.totalPrestiges} | Highest Floor: ${stats.highestFloorEver} | Total AP Earned: ${stats.totalAPEarned}`, {
      fontSize: '12px', color: '#88c0d0'
    }).setOrigin(0.5)
    this.prestigeOverlay.add(statsText)

    // Talent tree — 3 columns
    const branches = ['combat', 'survival', 'fortune'] as const
    const branchNames = { combat: '⚔️ COMBAT', survival: '🛡️ SURVIVAL', fortune: '💰 FORTUNE' }
    const branchColors = { combat: '#ff4444', survival: '#44ff44', fortune: '#ffcc00' }
    const colWidth = Math.min(220, (width - 60) / 3)
    const startX = cx - colWidth
    const startY = 120

    branches.forEach((branch, col) => {
      const bx = startX + col * colWidth
      const branchLabel = this.add.text(bx, startY, branchNames[branch], {
        fontSize: '16px', fontStyle: 'bold', color: branchColors[branch], stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5)
      this.prestigeOverlay!.add(branchLabel)

      const talents = TALENT_DEFINITIONS.filter(t => t.branch === branch)
      talents.forEach((talent, i) => {
        const ty = startY + 35 + i * 60
        const rank = prestigeSystem.getTalentRank(talent.id)
        const maxed = rank >= talent.maxRank
        const canUnlock = prestigeSystem.canUnlockTalent(talent.id)
        const cost = rank < talent.costs.length ? talent.costs[rank] : 0

        const nodeColor = maxed ? 0xffd700 : canUnlock.canUnlock ? 0x00d9ff : 0x333333
        const node = this.add.rectangle(bx, ty, colWidth - 20, 50, nodeColor, maxed ? 0.4 : 0.2)
        node.setStrokeStyle(2, nodeColor, maxed ? 1 : 0.6)
        if (canUnlock.canUnlock && !maxed) node.setInteractive({ useHandCursor: true })
        this.prestigeOverlay!.add(node)

        const nameStr = `${talent.name} ${maxed ? '(MAX)' : `[${rank}/${talent.maxRank}]`}`
        const nameText = this.add.text(bx, ty - 10, nameStr, {
          fontSize: '12px', fontStyle: 'bold', color: maxed ? '#ffd700' : '#ffffff'
        }).setOrigin(0.5)
        this.prestigeOverlay!.add(nameText)

        const descStr = maxed ? talent.description : `${talent.description} — Cost: ${cost} AP`
        const descText = this.add.text(bx, ty + 8, descStr, {
          fontSize: '10px', color: '#88c0d0', wordWrap: { width: colWidth - 30 }, align: 'center'
        }).setOrigin(0.5)
        this.prestigeOverlay!.add(descText)

        if (canUnlock.canUnlock && !maxed) {
          node.on('pointerdown', () => {
            if (prestigeSystem.unlockTalent(talent.id)) {
              this.closePrestigeOverlay()
              this.showPrestigeOverlay() // Refresh
            }
          })
          node.on('pointerover', () => node.setStrokeStyle(3, COLORS.highlight, 1))
          node.on('pointerout', () => node.setStrokeStyle(2, nodeColor, 0.6))
        }
      })
    })

    // NG+ tier selector
    const ngY = height - 100
    const ngLabel = this.add.text(cx, ngY, 'NG+ Tier (applies on next run):', {
      fontSize: '14px', color: '#ffffff'
    }).setOrigin(0.5)
    this.prestigeOverlay.add(ngLabel)

    for (let t = 0; t <= 5; t++) {
      const tx = cx - 125 + t * 50
      const active = prestigeSystem.getNGPlusTier() === t
      const btn = this.add.rectangle(tx, ngY + 30, 40, 30, active ? COLORS.accent : COLORS.panel, 0.9)
      btn.setStrokeStyle(2, active ? COLORS.highlight : COLORS.accent, active ? 1 : 0.5)
      btn.setInteractive({ useHandCursor: true })
      const label = this.add.text(tx, ngY + 30, t === 0 ? 'OFF' : `+${t}`, {
        fontSize: '12px', fontStyle: 'bold', color: active ? '#ffffff' : '#88c0d0'
      }).setOrigin(0.5)
      this.prestigeOverlay.add([btn, label])

      btn.on('pointerdown', () => {
        prestigeSystem.setNGPlusTier(t)
        this.closePrestigeOverlay()
        this.showPrestigeOverlay()
      })
    }

    // Reset talents button
    const resetBtn = this.add.text(cx - 200, ngY + 30, 'Reset Talents', {
      fontSize: '12px', color: '#ff6666', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    resetBtn.on('pointerdown', () => {
      prestigeSystem.resetTalents()
      this.closePrestigeOverlay()
      this.showPrestigeOverlay()
    })
    this.prestigeOverlay.add(resetBtn)

    // Close button
    this.addCloseButton(this.prestigeOverlay, () => this.closePrestigeOverlay())
  }

  private closePrestigeOverlay() {
    if (this.prestigeOverlay) { this.prestigeOverlay.destroy(); this.prestigeOverlay = null }
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPANION SELECTION OVERLAY
  // ═══════════════════════════════════════════════════════════════

  private showCompanionOverlay() {
    if (this.companionOverlay) return
    const { width, height } = this.scale
    const cx = width / 2, cy = height / 2

    this.companionOverlay = this.add.container(0, 0).setDepth(1000)
    const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.9).setOrigin(0)
    this.companionOverlay.add(overlay)

    const title = this.add.text(cx, 30, '🐾 COMPANIONS', {
      fontSize: '28px', fontStyle: 'bold', color: '#44ff44', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)
    this.companionOverlay.add(title)

    const active = companionSystem.getActiveCompanion()
    const subtitle = this.add.text(cx, 65, active ? `Active: ${COMPANION_DEFINITIONS[active].name}` : 'None equipped', {
      fontSize: '16px', color: '#88c0d0'
    }).setOrigin(0.5)
    this.companionOverlay.add(subtitle)

    // Companion cards — 3 per row
    const allTypes: CompanionType[] = ['attack_drone', 'shield_bot', 'heal_sprite', 'speed_ghost', 'loot_magnet', 'boss_hunter']
    const cardW = Math.min(180, (width - 80) / 3)
    const cardH = 140
    const spacing = 15

    allTypes.forEach((type, i) => {
      const def = COMPANION_DEFINITIONS[type]
      const unlocked = companionSystem.isUnlocked(type)
      const isActive = active === type
      const level = companionSystem.getLevel(type)
      const row = Math.floor(i / 3)
      const col = i % 3
      const x = cx - cardW - spacing / 2 + col * (cardW + spacing)
      const y = 120 + row * (cardH + spacing)

      const bg = this.add.rectangle(x, y, cardW, cardH, isActive ? def.color : COLORS.panel, isActive ? 0.3 : 0.2)
      bg.setStrokeStyle(2, unlocked ? (isActive ? COLORS.highlight : def.color) : 0x333333, unlocked ? 0.8 : 0.3)
      if (unlocked) bg.setInteractive({ useHandCursor: true })
      this.companionOverlay!.add(bg)

      const icon = this.add.text(x, y - 40, unlocked ? def.icon : '🔒', { fontSize: '24px' }).setOrigin(0.5)
      const name = this.add.text(x, y - 15, unlocked ? def.name : 'Locked', {
        fontSize: '13px', fontStyle: 'bold', color: unlocked ? '#ffffff' : '#555555'
      }).setOrigin(0.5)
      this.companionOverlay!.add([icon, name])

      if (unlocked) {
        const levelText = this.add.text(x, y + 5, `Level ${level}/30`, {
          fontSize: '11px', color: '#88c0d0'
        }).setOrigin(0.5)
        const passiveText = this.add.text(x, y + 22, def.passiveBonus, {
          fontSize: '9px', color: '#aaaaaa', wordWrap: { width: cardW - 15 }, align: 'center'
        }).setOrigin(0.5)

        // XP bar
        const barW = cardW - 30
        const barH = 6
        const barY = y + 42
        const barBg = this.add.rectangle(x, barY, barW, barH, 0x333333).setOrigin(0.5)
        const progress = companionSystem.getXPProgress(type)
        const barFill = this.add.rectangle(x - barW / 2 + (barW * progress) / 2, barY, barW * progress, barH, def.color).setOrigin(0.5)

        // Abilities list
        const abilities = def.abilities.map((a, idx) => {
          const unlockLevel = a.unlockLevel
          const abilityUnlocked = level >= unlockLevel
          return `${abilityUnlocked ? '✓' : '○'} Lv${unlockLevel}: ${a.name}`
        }).join('  ')
        const abText = this.add.text(x, y + 55, abilities, {
          fontSize: '8px', color: '#666666', wordWrap: { width: cardW - 10 }, align: 'center'
        }).setOrigin(0.5)

        this.companionOverlay!.add([levelText, passiveText, barBg, barFill, abText])

        bg.on('pointerdown', () => {
          if (isActive) {
            companionSystem.unequipCompanion()
          } else {
            companionSystem.equipCompanion(type)
          }
          this.closeCompanionOverlay()
          this.showCompanionOverlay()
        })
        bg.on('pointerover', () => bg.setStrokeStyle(3, COLORS.highlight, 1))
        bg.on('pointerout', () => bg.setStrokeStyle(2, isActive ? COLORS.highlight : def.color, 0.8))
      } else {
        const lockText = this.add.text(x, y + 15, `Unlocks from Floor ${def.unlockBossFloor} boss`, {
          fontSize: '9px', color: '#555555', wordWrap: { width: cardW - 15 }, align: 'center'
        }).setOrigin(0.5)
        this.companionOverlay!.add(lockText)
      }
    })

    this.addCloseButton(this.companionOverlay, () => this.closeCompanionOverlay())
  }

  private closeCompanionOverlay() {
    if (this.companionOverlay) { this.companionOverlay.destroy(); this.companionOverlay = null }
  }

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS OVERLAY
  // ═══════════════════════════════════════════════════════════════

  private showSettingsOverlay() {
    if (this.settingsOverlay) return
    const { width, height } = this.scale
    const cx = width / 2

    this.settingsOverlay = this.add.container(0, 0).setDepth(1000)
    const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.9).setOrigin(0)
    this.settingsOverlay.add(overlay)

    const title = this.add.text(cx, 30, '⚙️ SETTINGS', {
      fontSize: '28px', fontStyle: 'bold', color: '#00d9ff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)
    this.settingsOverlay.add(title)

    const settings = settingsManager.getAll()
    let curY = 80

    // Audio section
    curY = this.addSettingsSection('AUDIO', curY, cx)
    curY = this.addVolumeSlider('Master Volume', 'masterVolume', settings.masterVolume, curY, cx)
    curY = this.addVolumeSlider('Music Volume', 'musicVolume', settings.musicVolume, curY, cx)
    curY = this.addVolumeSlider('SFX Volume', 'sfxVolume', settings.sfxVolume, curY, cx)
    curY = this.addSettingsToggle('Music Muted', 'musicMuted', settings.musicMuted, curY, cx)
    curY = this.addSettingsToggle('SFX Muted', 'sfxMuted', settings.sfxMuted, curY, cx)

    // Graphics section
    curY = this.addSettingsSection('GRAPHICS', curY + 10, cx)
    curY = this.addSettingsToggle('Screen Shake', 'screenShake', settings.screenShake, curY, cx)
    curY = this.addSettingsToggle('Damage Numbers', 'showDamageNumbers', settings.showDamageNumbers, curY, cx)
    curY = this.addSettingsToggle('Minimap', 'showMinimap', settings.showMinimap, curY, cx)

    // Accessibility
    curY = this.addSettingsSection('ACCESSIBILITY', curY + 10, cx)
    curY = this.addSettingsToggle('Large Text', 'largeText', settings.largeText, curY, cx)
    curY = this.addSettingsToggle('Reduced Motion', 'reducedMotion', settings.reducedMotion, curY, cx)

    // Gameplay
    curY = this.addSettingsSection('GAMEPLAY', curY + 10, cx)
    curY = this.addSettingsToggle('Auto Reload', 'autoReload', settings.autoReload, curY, cx)
    curY = this.addSettingsToggle('Tutorial Hints', 'showTutorialHints', settings.showTutorialHints, curY, cx)

    // Reset button
    const resetBtn = this.add.text(cx, curY + 15, 'Reset to Defaults', {
      fontSize: '14px', color: '#ff6666', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    resetBtn.on('pointerdown', () => {
      settingsManager.reset()
      this.closeSettingsOverlay()
      this.showSettingsOverlay()
    })
    this.settingsOverlay.add(resetBtn)

    this.addCloseButton(this.settingsOverlay, () => this.closeSettingsOverlay())
  }

  private addSettingsSection(label: string, y: number, cx: number): number {
    const text = this.add.text(cx, y, label, {
      fontSize: '16px', fontStyle: 'bold', color: '#00d9ff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5)
    this.settingsOverlay!.add(text)
    return y + 25
  }

  private addSettingsToggle(label: string, key: keyof GameSettings, value: boolean, y: number, cx: number): number {
    const labelText = this.add.text(cx - 120, y, label, {
      fontSize: '13px', color: '#e0f4ff'
    }).setOrigin(0, 0.5)

    const toggleBg = this.add.rectangle(cx + 100, y, 50, 22, value ? 0x2ecc71 : 0x555555, 0.9)
    toggleBg.setStrokeStyle(1, 0x888888, 0.5)
    toggleBg.setInteractive({ useHandCursor: true })

    const toggleText = this.add.text(cx + 100, y, value ? 'ON' : 'OFF', {
      fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5)

    toggleBg.on('pointerdown', () => {
      const newVal = !settingsManager.get(key)
      settingsManager.set(key, newVal as any)
      toggleBg.setFillStyle(newVal ? 0x2ecc71 : 0x555555, 0.9)
      toggleText.setText(newVal ? 'ON' : 'OFF')
    })

    this.settingsOverlay!.add([labelText, toggleBg, toggleText])
    return y + 28
  }

  private addVolumeSlider(label: string, key: keyof GameSettings, value: number, y: number, cx: number): number {
    const labelText = this.add.text(cx - 120, y, label, {
      fontSize: '13px', color: '#e0f4ff'
    }).setOrigin(0, 0.5)

    const barW = 120
    const barX = cx + 40
    const barBg = this.add.rectangle(barX, y, barW, 12, 0x333333).setOrigin(0, 0.5)
    const barFill = this.add.rectangle(barX, y, barW * (value as number), 12, 0x00d9ff).setOrigin(0, 0.5)

    const valText = this.add.text(barX + barW + 10, y, `${Math.round((value as number) * 100)}%`, {
      fontSize: '11px', color: '#88c0d0'
    }).setOrigin(0, 0.5)

    barBg.setInteractive({ useHandCursor: true })
    barBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const newVal = Math.max(0, Math.min(1, (pointer.x - barBg.x) / barW))
      settingsManager.set(key, Math.round(newVal * 100) / 100 as any)
      barFill.width = barW * newVal
      valText.setText(`${Math.round(newVal * 100)}%`)
    })

    this.settingsOverlay!.add([labelText, barBg, barFill, valText])
    return y + 28
  }

  private closeSettingsOverlay() {
    if (this.settingsOverlay) { this.settingsOverlay.destroy(); this.settingsOverlay = null }
  }

  // ═══════════════════════════════════════════════════════════════
  // COSMETICS OVERLAY
  // ═══════════════════════════════════════════════════════════════

  private showCosmeticsOverlay() {
    if (this.cosmeticsOverlay) return
    const { width, height } = this.scale
    const cx = width / 2

    this.cosmeticsOverlay = this.add.container(0, 0).setDepth(1000)
    const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.9).setOrigin(0)
    this.cosmeticsOverlay.add(overlay)

    const title = this.add.text(cx, 30, '🎨 COSMETICS', {
      fontSize: '28px', fontStyle: 'bold', color: '#ff66cc', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)
    this.cosmeticsOverlay.add(title)

    // Tab buttons
    const tabs: { label: string; category: CosmeticCategory }[] = [
      { label: 'Skins', category: 'playerSkin' },
      { label: 'Bullets', category: 'weaponSkin' },
      { label: 'Kill FX', category: 'killEffect' },
      { label: 'Titles', category: 'title' },
      { label: 'Trails', category: 'trailEffect' },
    ]

    let activeTab: CosmeticCategory = 'playerSkin'
    const tabY = 70
    const tabW = Math.min(80, (width - 40) / tabs.length)

    const renderTab = (category: CosmeticCategory) => {
      // Remove previous items (all children after first 2 + tabs = keep first elements)
      const keepCount = 2 + tabs.length * 2 // overlay bg + title + (bg + label per tab)
      while (this.cosmeticsOverlay!.length > keepCount) {
        const child = this.cosmeticsOverlay!.getAt(keepCount)
        if (child) { (child as any).destroy?.(); this.cosmeticsOverlay!.removeAt(keepCount) }
        else break
      }

      const equipped = cosmeticSystem.getEquipped()
      let items: Array<{ id: string; name: string; unlocked: boolean; isEquipped: boolean; colorHint: number; desc: string }> = []

      if (category === 'playerSkin') {
        items = cosmeticSystem.getAllPlayerSkins().map(s => ({
          id: s.id, name: s.name, unlocked: s.unlocked,
          isEquipped: equipped.playerSkin === s.id,
          colorHint: s.bodyColor, desc: s.unlock.description,
        }))
      } else if (category === 'weaponSkin') {
        items = cosmeticSystem.getAllWeaponSkins().map(s => ({
          id: s.id, name: s.name, unlocked: s.unlocked,
          isEquipped: equipped.weaponSkin === s.id,
          colorHint: s.bulletColor, desc: s.unlock.description,
        }))
      } else if (category === 'killEffect') {
        items = cosmeticSystem.getAllKillEffects().map(e => ({
          id: e.id, name: e.name, unlocked: e.unlocked,
          isEquipped: equipped.killEffect === e.id,
          colorHint: e.color, desc: e.unlock.description,
        }))
      } else if (category === 'title') {
        items = cosmeticSystem.getAllTitles().map(t => ({
          id: t.id, name: t.displayText || t.name, unlocked: t.unlocked,
          isEquipped: equipped.title === t.id,
          colorHint: t.color, desc: t.unlock.description,
        }))
      } else if (category === 'trailEffect') {
        items = cosmeticSystem.getAllTrailEffects().map(t => ({
          id: t.id, name: t.name, unlocked: t.unlocked,
          isEquipped: equipped.trailEffect === t.id,
          colorHint: t.color, desc: t.unlock.description,
        }))
      }

      const cols = Math.min(4, Math.floor((width - 40) / 140))
      const cardW = Math.min(130, (width - 40) / cols - 10)
      const cardH = 70
      const startX = cx - (cols * (cardW + 10)) / 2 + cardW / 2
      const startY = tabY + 50

      items.forEach((item, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        const x = startX + col * (cardW + 10)
        const y = startY + row * (cardH + 8)

        if (y > height - 50) return // Skip if off screen

        const bgColor = item.isEquipped ? 0x00d9ff : item.unlocked ? COLORS.panel : 0x111111
        const bg = this.add.rectangle(x, y, cardW, cardH, bgColor, item.isEquipped ? 0.35 : 0.25)
        bg.setStrokeStyle(2, item.isEquipped ? COLORS.highlight : item.unlocked ? item.colorHint : 0x333333, item.unlocked ? 0.8 : 0.3)
        if (item.unlocked && !item.isEquipped) bg.setInteractive({ useHandCursor: true })
        this.cosmeticsOverlay!.add(bg)

        const colorDot = this.add.circle(x - cardW / 2 + 15, y - 10, 6, item.unlocked ? item.colorHint : 0x333333)
        this.cosmeticsOverlay!.add(colorDot)

        const nameText = this.add.text(x - cardW / 2 + 28, y - 16, item.unlocked ? item.name : '???', {
          fontSize: '11px', fontStyle: 'bold', color: item.unlocked ? '#ffffff' : '#555555',
          wordWrap: { width: cardW - 35 }
        }).setOrigin(0, 0)
        this.cosmeticsOverlay!.add(nameText)

        const descText = this.add.text(x, y + 16, item.isEquipped ? 'EQUIPPED' : (item.unlocked ? 'Click to equip' : item.desc), {
          fontSize: '9px', color: item.isEquipped ? '#00d9ff' : item.unlocked ? '#88c0d0' : '#666666',
          wordWrap: { width: cardW - 10 }, align: 'center'
        }).setOrigin(0.5)
        this.cosmeticsOverlay!.add(descText)

        if (item.unlocked && !item.isEquipped) {
          bg.on('pointerdown', () => {
            cosmeticSystem.equip(category, item.id)
            this.closeCosmeticsOverlay()
            this.showCosmeticsOverlay()
          })
          bg.on('pointerover', () => bg.setStrokeStyle(3, COLORS.highlight, 1))
          bg.on('pointerout', () => bg.setStrokeStyle(2, item.colorHint, 0.8))
        }
      })
    }

    // Create tab buttons
    tabs.forEach((tab, i) => {
      const tx = cx - (tabs.length * tabW) / 2 + tabW / 2 + i * tabW
      const isActive = tab.category === activeTab
      const bg = this.add.rectangle(tx, tabY, tabW - 4, 24, isActive ? COLORS.accent : COLORS.panel, 0.9)
      bg.setStrokeStyle(1, isActive ? COLORS.highlight : COLORS.accent, isActive ? 1 : 0.5)
      bg.setInteractive({ useHandCursor: true })
      const label = this.add.text(tx, tabY, tab.label, {
        fontSize: '11px', fontStyle: 'bold', color: isActive ? '#ffffff' : '#88c0d0'
      }).setOrigin(0.5)
      this.cosmeticsOverlay!.add([bg, label])

      bg.on('pointerdown', () => {
        activeTab = tab.category
        this.closeCosmeticsOverlay()
        this.showCosmeticsOverlay()
      })
    })

    // Render initial tab
    renderTab(activeTab)

    this.addCloseButton(this.cosmeticsOverlay, () => this.closeCosmeticsOverlay())
  }

  private closeCosmeticsOverlay() {
    if (this.cosmeticsOverlay) { this.cosmeticsOverlay.destroy(); this.cosmeticsOverlay = null }
  }

  private addCloseButton(container: Phaser.GameObjects.Container, onClose: () => void) {
    const { width } = this.scale
    const closeBtn = this.add.text(width - 40, 20, '✕', {
      fontSize: '28px', fontStyle: 'bold', color: '#ff4444'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', onClose)
    closeBtn.on('pointerover', () => closeBtn.setScale(1.2))
    closeBtn.on('pointerout', () => closeBtn.setScale(1))
    container.add(closeBtn)
  }

  shutdown() {
    // Cleanup
    if (this.refreshTimer) {
      this.refreshTimer.remove()
    }
    if (this.particles) {
      this.particles.stop()
    }
  }
}
