/**
 * SettingsManager - Singleton settings manager for DotSlayer
 * Persistent across sessions via localStorage
 */

export interface GameSettings {
  // Audio
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  musicMuted: boolean
  sfxMuted: boolean

  // Graphics
  particleQuality: 'low' | 'medium' | 'high'
  screenShake: boolean
  showDamageNumbers: boolean
  showMinimap: boolean

  // Accessibility
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  largeText: boolean
  reducedMotion: boolean

  // Gameplay
  autoReload: boolean
  showTutorialHints: boolean
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.5,
  musicVolume: 0.3,
  sfxVolume: 0.5,
  musicMuted: false,
  sfxMuted: false,
  particleQuality: 'medium',
  screenShake: true,
  showDamageNumbers: true,
  showMinimap: true,
  colorblindMode: 'none',
  largeText: false,
  reducedMotion: false,
  autoReload: true,
  showTutorialHints: true,
}

const STORAGE_KEY = 'dotslayer_settings'

export class SettingsManager {
  private static instance: SettingsManager
  private settings: GameSettings
  private listeners: Set<(settings: GameSettings) => void>

  private constructor() {
    this.listeners = new Set()
    this.settings = this.load()
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager()
    }
    return SettingsManager.instance
  }

  // ---------------------------------------------------------------------------
  // Load / Save
  // ---------------------------------------------------------------------------

  private load(): GameSettings {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_SETTINGS }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>
        // Merge with defaults so any newly-added keys get their default value
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load settings:', e)
    }
    return { ...DEFAULT_SETTINGS }
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    } catch (e) {
      console.warn('Failed to save settings:', e)
    }
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  get<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key]
  }

  getAll(): GameSettings {
    return { ...this.settings }
  }

  // ---------------------------------------------------------------------------
  // Setters
  // ---------------------------------------------------------------------------

  set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value
    this.save()
    this.notifyListeners()
  }

  // ---------------------------------------------------------------------------
  // Computed audio volumes
  // ---------------------------------------------------------------------------

  getEffectiveMusicVolume(): number {
    if (this.settings.musicMuted) return 0
    return this.settings.masterVolume * this.settings.musicVolume
  }

  getEffectiveSfxVolume(): number {
    if (this.settings.sfxMuted) return 0
    return this.settings.masterVolume * this.settings.sfxVolume
  }

  // ---------------------------------------------------------------------------
  // Listener pattern
  // ---------------------------------------------------------------------------

  onChange(callback: (settings: GameSettings) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners(): void {
    const snapshot = this.getAll()
    this.listeners.forEach(cb => cb(snapshot))
  }

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS }
    this.save()
    this.notifyListeners()
  }

  // ---------------------------------------------------------------------------
  // Particle quality helper
  // ---------------------------------------------------------------------------

  getParticleMultiplier(): number {
    switch (this.settings.particleQuality) {
      case 'low':    return 0.3
      case 'medium': return 1.0
      case 'high':   return 2.0
    }
  }
}

export const settingsManager = SettingsManager.getInstance()
