'use client'

import { useEffect, useState, CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/context/AuthContext'
import { supabase } from '../../lib/supabase/client'
import { SocialShare } from '../../lib/components/SocialShare'
import { prestigeSystem } from '../../lib/game/PrestigeSystem'
import { companionSystem, COMPANION_DEFINITIONS } from '../../lib/game/CompanionSystem'
import { elementalSystem } from '../../lib/game/ElementalSystem'
import type { ElementType } from '../../lib/game/ElementalSystem'
import type { CompanionType } from '../../lib/game/CompanionSystem'

interface PlayerStats {
  // DotSlayer stats
  slayer: {
    highestFloor: number
    totalKills: number
    totalDamage: number
    bossesDefeated: number
    gamesPlayed: number
    gamesWon: number
    bestCombo: number
    totalGoldEarned: number
    perfectFloors: number
    totalPlaytime: number
  }
  // Dot Clicker stats
  clicker: {
    totalDots: number
    totalPrestiges: number
    highestDps: number
    buildingsPurchased: number
    totalPlaytime: number
  }
  // Cross-game
  synergyLevel: number
  achievementsUnlocked: number
  totalAchievements: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  game: 'slayer' | 'clicker' | 'synergy'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

const ACHIEVEMENT_LIST: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // DotSlayer achievements
  { id: 'first_kill', name: 'First Blood', description: 'Kill your first enemy', icon: '🗡️', game: 'slayer', rarity: 'common' },
  { id: 'floor_10', name: 'Getting Started', description: 'Reach floor 10', icon: '🏃', game: 'slayer', rarity: 'common' },
  { id: 'floor_50', name: 'Halfway There', description: 'Reach floor 50', icon: '🏔️', game: 'slayer', rarity: 'uncommon' },
  { id: 'floor_100', name: 'Tower Conqueror', description: 'Complete all 100 floors', icon: '🏆', game: 'slayer', rarity: 'legendary' },
  { id: 'boss_10', name: 'Boss Hunter', description: 'Defeat 10 bosses', icon: '👹', game: 'slayer', rarity: 'uncommon' },
  { id: 'boss_50', name: 'Boss Slayer', description: 'Defeat 50 bosses', icon: '☠️', game: 'slayer', rarity: 'rare' },
  { id: 'combo_50', name: 'Combo Starter', description: 'Reach 50x combo', icon: '🔥', game: 'slayer', rarity: 'common' },
  { id: 'combo_100', name: 'Combo Master', description: 'Reach 100x combo', icon: '⚡', game: 'slayer', rarity: 'rare' },
  { id: 'combo_200', name: 'Combo God', description: 'Reach 200x combo', icon: '🌟', game: 'slayer', rarity: 'epic' },
  { id: 'kills_1000', name: 'Mass Slayer', description: 'Kill 1,000 enemies', icon: '💀', game: 'slayer', rarity: 'uncommon' },
  { id: 'kills_10000', name: 'Extinction', description: 'Kill 10,000 enemies', icon: '🌋', game: 'slayer', rarity: 'epic' },
  { id: 'perfect_floor', name: 'Untouchable', description: 'Complete a floor without taking damage', icon: '🛡️', game: 'slayer', rarity: 'uncommon' },
  { id: 'perfect_10', name: 'Ghost', description: 'Complete 10 floors without taking damage', icon: '👻', game: 'slayer', rarity: 'rare' },

  // Dot Clicker achievements
  { id: 'first_click', name: 'Click!', description: 'Click your first dot', icon: '👆', game: 'clicker', rarity: 'common' },
  { id: 'dots_million', name: 'Millionaire', description: 'Earn 1 million dots', icon: '💰', game: 'clicker', rarity: 'common' },
  { id: 'dots_billion', name: 'Billionaire', description: 'Earn 1 billion dots', icon: '🏦', game: 'clicker', rarity: 'uncommon' },
  { id: 'dots_trillion', name: 'Trillionaire', description: 'Earn 1 trillion dots', icon: '💎', game: 'clicker', rarity: 'rare' },
  { id: 'prestige_1', name: 'Rebirth', description: 'Prestige for the first time', icon: '🔄', game: 'clicker', rarity: 'common' },
  { id: 'prestige_5', name: 'Reborn', description: 'Prestige 5 times', icon: '⭐', game: 'clicker', rarity: 'uncommon' },
  { id: 'prestige_10', name: 'Transcendence', description: 'Prestige 10 times', icon: '✨', game: 'clicker', rarity: 'rare' },
  { id: 'buildings_50', name: 'Empire Builder', description: 'Own 50 buildings', icon: '🏭', game: 'clicker', rarity: 'uncommon' },
  { id: 'dps_million', name: 'Automation King', description: 'Reach 1 million DPS', icon: '⚙️', game: 'clicker', rarity: 'rare' },

  // Cross-game achievements
  { id: 'synergy_5', name: 'Connected', description: 'Reach synergy level 5', icon: '🔗', game: 'synergy', rarity: 'uncommon' },
  { id: 'synergy_10', name: 'Intertwined', description: 'Reach synergy level 10', icon: '🌐', game: 'synergy', rarity: 'rare' },
  { id: 'synergy_20', name: 'Universal', description: 'Reach synergy level 20', icon: '🌌', game: 'synergy', rarity: 'epic' },
  { id: 'both_games', name: 'Universe Explorer', description: 'Play both games', icon: '🚀', game: 'synergy', rarity: 'common' },
  { id: 'dedicated', name: 'Dedicated Player', description: 'Play for 10 total hours', icon: '⏰', game: 'synergy', rarity: 'rare' },
]

function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toString()
  if (n < 1000000) return (n / 1000).toFixed(1) + 'K'
  if (n < 1000000000) return (n / 1000000).toFixed(2) + 'M'
  if (n < 1000000000000) return (n / 1000000000).toFixed(2) + 'B'
  if (n < 1000000000000000) return (n / 1000000000000).toFixed(2) + 'T'
  return (n / 1000000000000000).toFixed(2) + 'Q'
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${Math.floor(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  if (hours < 24) return `${hours}h ${mins}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

// Styles
const styles: { [key: string]: CSSProperties } = {
  profileContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050510 0%, #0a0a20 25%, #150a25 50%, #0a1520 75%, #050510 100%)',
    color: 'white',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    paddingBottom: '40px',
  },
  loading: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050510 0%, #0a0a20 25%, #150a25 50%, #0a1520 75%, #050510 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00d9ff',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(0, 217, 255, 0.2)',
    borderTopColor: '#00d9ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  profileHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    display: 'inline-block',
    color: '#00d9ff',
    background: 'none',
    border: 'none',
    marginBottom: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap' as const,
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d9ff, #ff6b00)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.3)',
  },
  infoText: {
    flex: 1,
  },
  infoTextH1: {
    fontSize: '2rem',
    margin: '0 0 8px 0',
  },
  synergyBadge: {
    display: 'inline-block',
    padding: '5px 15px',
    background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(241, 196, 15, 0.1))',
    border: '1px solid rgba(243, 156, 18, 0.3)',
    borderRadius: '20px',
    color: '#f1c40f',
    fontSize: '0.9rem',
  },
  shareProfileBtn: {
    background: 'linear-gradient(135deg, #00d9ff, #0099cc)',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    fontSize: '1rem',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    padding: '20px',
    flexWrap: 'wrap' as const,
  },
  tab: {
    padding: '12px 30px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '25px',
    color: '#888',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  tabActive: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 150, 255, 0.1))',
    border: '1px solid rgba(0, 217, 255, 0.4)',
    borderRadius: '25px',
    color: '#00d9ff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  profileContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
  },
  statsSection: {
    background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8), rgba(15, 20, 35, 0.9))',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statsSectionH2: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
  },
  slayerH2: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#ff6b00',
  },
  clickerH2: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#00d9ff',
  },
  gameIcon: {
    fontSize: '1.5rem',
  },
  statsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
  },
  statCard: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center' as const,
  },
  statCardHighlightSlayer: {
    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 50, 0, 0.1))',
    border: '1px solid rgba(255, 107, 0, 0.2)',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center' as const,
  },
  statCardHighlightClicker: {
    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(0, 150, 255, 0.1))',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center' as const,
  },
  statValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  statValueSlayer: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ff6b00',
  },
  statValueClicker: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#00d9ff',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#888',
    marginTop: '5px',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
  },
  achievementCard: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s',
  },
  achievementCardLocked: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s',
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: '2rem',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementInfoH3: {
    margin: '0 0 5px 0',
    fontSize: '1rem',
  },
  achievementInfoP: {
    margin: '0 0 8px 0',
    fontSize: '0.85rem',
    color: '#888',
  },
  rarityBadgeBase: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  rarityCommon: {
    background: '#9e9e9e',
    color: '#fff',
  },
  rarityUncommon: {
    background: '#4caf50',
    color: '#fff',
  },
  rarityRare: {
    background: '#2196f3',
    color: '#fff',
  },
  rarityEpic: {
    background: '#9c27b0',
    color: '#fff',
  },
  rarityLegendary: {
    background: '#ff9800',
    color: '#000',
  },
  milestonesContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  milestoneSection: {
    background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8), rgba(15, 20, 35, 0.9))',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  milestoneSectionH2Slayer: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#ff6b00',
  },
  milestoneSectionH2Clicker: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#00d9ff',
  },
  milestoneSectionH2Synergy: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#f1c40f',
  },
  milestoneSectionH2Recent: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#00d9ff',
  },
  milestoneTrack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    overflowX: 'auto' as const,
    padding: '10px 0',
  },
  milestoneNode: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    minWidth: '80px',
  },
  nodeIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(100, 100, 100, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: '3px solid #555',
    transition: 'all 0.3s',
  },
  nodeIconCompleted: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: '3px solid #2ecc71',
    boxShadow: '0 0 20px rgba(46, 204, 113, 0.4)',
    transition: 'all 0.3s',
  },
  nodeIconLegendary: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f39c12, #f1c40f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: '3px solid #f1c40f',
    transition: 'all 0.3s',
  },
  nodeIconLegendaryCompleted: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f39c12, #f1c40f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: '3px solid #f1c40f',
    boxShadow: '0 0 30px rgba(241, 196, 15, 0.6)',
    animation: 'legendaryPulse 2s ease-in-out infinite',
    transition: 'all 0.3s',
  },
  nodeLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  nodeLabelCompleted: {
    fontSize: '0.75rem',
    color: '#2ecc71',
  },
  milestoneLine: {
    flex: 1,
    height: '4px',
    background: '#333',
    minWidth: '20px',
  },
  milestoneProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  progressBar: {
    flex: 1,
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  },
  progressFillSlayer: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
    background: 'linear-gradient(90deg, #ff6b00, #ff4400)',
  },
  progressText: {
    fontSize: '0.9rem',
    color: '#888',
    minWidth: '100px',
  },
  prestigeTrack: {
    marginTop: '20px',
  },
  prestigeTrackH3: {
    fontSize: '1rem',
    color: '#00d9ff',
    margin: '0 0 15px 0',
  },
  prestigeBadges: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  prestigeBadge: {
    padding: '8px 16px',
    background: 'rgba(100, 100, 100, 0.2)',
    border: '2px solid #555',
    borderRadius: '20px',
    fontSize: '0.9rem',
    color: '#666',
  },
  prestigeBadgeUnlocked: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(241, 196, 15, 0.1))',
    border: '2px solid #f1c40f',
    borderRadius: '20px',
    fontSize: '0.9rem',
    color: '#f1c40f',
  },
  synergyMeter: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    flexWrap: 'wrap' as const,
  },
  synergyLevelDisplay: {
    textAlign: 'center' as const,
  },
  levelNumber: {
    display: 'block',
    fontSize: '4rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #f39c12, #f1c40f)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  levelLabel: {
    display: 'block',
    color: '#888',
    fontSize: '0.9rem',
  },
  synergyBonuses: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  bonusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
  },
  bonusIcon: {
    fontSize: '1.2rem',
  },
  bonusText: {
    color: '#2ecc71',
    fontWeight: 600,
  },
  recentRuns: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  runCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '15px 20px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  runCardVictory: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '15px 20px',
    background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(46, 204, 113, 0.3)',
  },
  runFloor: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#ff6b00',
    minWidth: '100px',
  },
  runStats: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    color: '#888',
    fontSize: '0.9rem',
  },
  victoryBadge: {
    color: '#2ecc71',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'milestones' | 'mastery' | 'challenges' | 'collection'>('stats')
  const [showShare, setShowShare] = useState(false)
  const [recentRuns, setRecentRuns] = useState<any[]>([])
  const [hoveredBackBtn, setHoveredBackBtn] = useState(false)
  const [hoveredShareBtn, setHoveredShareBtn] = useState(false)
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'slayer' | 'clicker' | 'synergy'>('all')

  // CONVERGENCE: Prestige, Companions, Elemental stats
  const [prestigeLevel, setPrestigeLevel] = useState(0)
  const [ngPlusTier, setNGPlusTier] = useState(0)
  const [totalAPEarned, setTotalAPEarned] = useState(0)
  const [highestFloorEver, setHighestFloorEver] = useState(0)
  const [unlockedCompanions, setUnlockedCompanions] = useState<CompanionType[]>([])
  const [companionLevels, setCompanionLevels] = useState<Record<string, number>>({})
  const [elementalKills, setElementalKills] = useState<Record<ElementType, number>>({ fire: 0, ice: 0, lightning: 0, void: 0 })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return

      try {
        // Load display name
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        setDisplayName(profile?.display_name || user.email?.split('@')[0] || 'Player')

        // Load slayer stats
        const { data: slayerProgress } = await supabase
          .from('slayer_progress')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Load clicker stats
        const { data: clickerSave } = await supabase
          .from('clicker_saves')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Load achievements
        const { data: achievementsData } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)

        // Calculate synergy level
        const slayerFloors = slayerProgress?.highest_floor || 0
        const clickerPrestiges = clickerSave?.total_prestiges || 0
        const synergyLevel = Math.floor(Math.sqrt((slayerFloors + clickerPrestiges * 5) / 10))

        setStats({
          slayer: {
            highestFloor: slayerProgress?.highest_floor || 0,
            totalKills: slayerProgress?.total_kills || 0,
            totalDamage: slayerProgress?.total_damage || 0,
            bossesDefeated: slayerProgress?.bosses_defeated || 0,
            gamesPlayed: slayerProgress?.games_played || 0,
            gamesWon: slayerProgress?.games_won || 0,
            bestCombo: slayerProgress?.best_combo || 0,
            totalGoldEarned: slayerProgress?.total_gold || 0,
            perfectFloors: slayerProgress?.perfect_floors || 0,
            totalPlaytime: slayerProgress?.total_playtime || 0,
          },
          clicker: {
            totalDots: clickerSave?.total_dots || 0,
            totalPrestiges: clickerSave?.total_prestiges || 0,
            highestDps: clickerSave?.stats?.highestDps || 0,
            buildingsPurchased: clickerSave?.stats?.buildingsPurchased || 0,
            totalPlaytime: clickerSave?.stats?.totalPlaytime || 0,
          },
          synergyLevel,
          achievementsUnlocked: achievementsData?.length || 0,
          totalAchievements: ACHIEVEMENT_LIST.length,
        })

        // Map achievements
        const unlockedIds = new Set(achievementsData?.map(a => a.achievement_id) || [])
        const mappedAchievements = ACHIEVEMENT_LIST.map(a => ({
          ...a,
          unlocked: unlockedIds.has(a.id),
          unlockedAt: achievementsData?.find(ua => ua.achievement_id === a.id)?.unlocked_at,
        }))
        setAchievements(mappedAchievements)

        // Load recent runs from leaderboard
        const { data: recentRunsData } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentRuns(recentRunsData || [])

      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    loadProfileData()
  }, [user])

  // CONVERGENCE: Load prestige, companion, and elemental data
  useEffect(() => {
    try {
      setPrestigeLevel(prestigeSystem.getPrestigeLevel())
      setNGPlusTier(prestigeSystem.getNGPlusTier())
      const pStats = prestigeSystem.getPrestigeStats()
      setTotalAPEarned(pStats.totalAPEarned)
      setHighestFloorEver(pStats.highestFloorEver)
    } catch { /* not initialized */ }
    try {
      const companions = companionSystem.getUnlockedCompanions()
      setUnlockedCompanions(companions)
      const levels: Record<string, number> = {}
      companions.forEach(c => { levels[c] = companionSystem.getLevel(c) })
      setCompanionLevels(levels)
    } catch { /* not initialized */ }
    try {
      setElementalKills(elementalSystem.getElementalKills())
    } catch { /* not initialized */ }
  }, [])

  if (loading) {
    return (
      <div style={styles.loading}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes legendaryPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
        <div style={styles.loadingSpinner}></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!user) return null

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9e9e9e'
      case 'uncommon': return '#4caf50'
      case 'rare': return '#2196f3'
      case 'epic': return '#9c27b0'
      case 'legendary': return '#ff9800'
      default: return '#9e9e9e'
    }
  }

  const getRarityStyle = (rarity: string): CSSProperties => {
    const base = styles.rarityBadgeBase
    switch (rarity) {
      case 'common': return { ...base, ...styles.rarityCommon }
      case 'uncommon': return { ...base, ...styles.rarityUncommon }
      case 'rare': return { ...base, ...styles.rarityRare }
      case 'epic': return { ...base, ...styles.rarityEpic }
      case 'legendary': return { ...base, ...styles.rarityLegendary }
      default: return { ...base, ...styles.rarityCommon }
    }
  }

  return (
    <div style={styles.profileContainer}>
      {/* Keyframe animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes legendaryPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {/* Header */}
      <header style={styles.profileHeader}>
        <button
          style={{
            ...styles.backBtn,
            color: hoveredBackBtn ? '#fff' : '#00d9ff',
          }}
          onClick={() => router.push('/hub')}
          onMouseEnter={() => setHoveredBackBtn(true)}
          onMouseLeave={() => setHoveredBackBtn(false)}
        >
          ← Back to Hub
        </button>
        <div style={styles.profileInfo}>
          <div style={styles.avatar}>
            <span>{displayName.charAt(0).toUpperCase()}</span>
          </div>
          <div style={styles.infoText}>
            <h1 style={styles.infoTextH1}>{displayName}</h1>
            <p style={{ margin: 0 }}>
              <span style={styles.synergyBadge}>🔗 Synergy Level {stats?.synergyLevel || 0}</span>
            </p>
          </div>
          <button
            style={{
              ...styles.shareProfileBtn,
              transform: hoveredShareBtn ? 'translateY(-2px)' : 'none',
              boxShadow: hoveredShareBtn ? '0 5px 20px rgba(0, 217, 255, 0.3)' : 'none',
            }}
            onClick={() => setShowShare(true)}
            onMouseEnter={() => setHoveredShareBtn(true)}
            onMouseLeave={() => setHoveredShareBtn(false)}
          >
            📤 Share
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={styles.tabs}>
        {[
          { id: 'stats' as const, label: 'Overview', icon: '📊' },
          { id: 'achievements' as const, label: `Achievements (${stats?.achievementsUnlocked || 0}/${stats?.totalAchievements || 0})`, icon: '🏆' },
          { id: 'milestones' as const, label: 'Slayer', icon: '⚔️' },
          { id: 'challenges' as const, label: 'Clicker', icon: '●' },
          { id: 'mastery' as const, label: 'Mastery', icon: '🔫' },
          { id: 'collection' as const, label: 'Collection', icon: '📦' },
        ].map(tab => (
          <button
            key={tab.id}
            style={activeTab === tab.id ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={styles.profileContent}>
        {activeTab === 'stats' && stats && (
          <div>
            {/* Overview Banner */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.85), rgba(15, 20, 35, 0.95))',
              borderRadius: '20px', padding: '25px', marginBottom: '25px',
              border: '1px solid rgba(243, 156, 18, 0.15)', textAlign: 'center',
            }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#889', letterSpacing: '3px', marginBottom: '5px' }}>UNIVERSE LEVEL</span>
              <span style={{
                fontSize: '3rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #f39c12, #f1c40f, #ff6b00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{stats.synergyLevel}</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px', flexWrap: 'wrap' as const }}>
                <div style={{ padding: '8px 16px', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '10px', border: '1px solid rgba(255, 107, 0, 0.2)' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: '#ff6b00' }}>{stats.slayer.highestFloor}</span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#778' }}>Best Floor</span>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '10px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: '#00d9ff' }}>{formatNumber(stats.clicker.totalDots)}</span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#778' }}>Total Dots</span>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '10px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: '#2ecc71' }}>{stats.achievementsUnlocked}/{stats.totalAchievements}</span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#778' }}>Achievements</span>
                </div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              {/* DotSlayer Stats */}
              <div style={styles.statsSection}>
                <h2 style={styles.slayerH2}><span style={styles.gameIcon}>⚔️</span> DotSlayer</h2>
                <div style={styles.statsCards}>
                  <div style={styles.statCardHighlightSlayer}>
                    <span style={styles.statValueSlayer}>{stats.slayer.highestFloor}</span>
                    <span style={styles.statLabel}>Highest Floor</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{formatNumber(stats.slayer.totalKills)}</span>
                    <span style={styles.statLabel}>Total Kills</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.slayer.bossesDefeated}</span>
                    <span style={styles.statLabel}>Bosses Defeated</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.slayer.bestCombo}x</span>
                    <span style={styles.statLabel}>Best Combo</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.slayer.gamesWon}/{stats.slayer.gamesPlayed}</span>
                    <span style={styles.statLabel}>Games Won</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{formatNumber(stats.slayer.totalDamage)}</span>
                    <span style={styles.statLabel}>Total Damage</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{formatNumber(stats.slayer.totalGoldEarned)}</span>
                    <span style={styles.statLabel}>Gold Earned</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.slayer.perfectFloors}</span>
                    <span style={styles.statLabel}>Perfect Floors</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{formatTime(stats.slayer.totalPlaytime)}</span>
                    <span style={styles.statLabel}>Playtime</span>
                  </div>
                </div>
                {/* Inline floor progress bar */}
                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#889' }}>Campaign Progress</span>
                    <span style={{ fontSize: '0.75rem', color: '#ff6b00', fontWeight: 600 }}>{stats.slayer.highestFloor}/150</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (stats.slayer.highestFloor / 150) * 100)}%`, background: 'linear-gradient(90deg, #ff6b00, #ff4400)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* Dot Clicker Stats */}
              <div style={styles.statsSection}>
                <h2 style={styles.clickerH2}><span style={styles.gameIcon}>●</span> Dot Clicker</h2>
                <div style={styles.statsCards}>
                  <div style={styles.statCardHighlightClicker}>
                    <span style={styles.statValueClicker}>{formatNumber(stats.clicker.totalDots)}</span>
                    <span style={styles.statLabel}>Total Dots</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.clicker.totalPrestiges}</span>
                    <span style={styles.statLabel}>Prestiges</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{formatNumber(stats.clicker.highestDps)}</span>
                    <span style={styles.statLabel}>Peak DPS</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.clicker.buildingsPurchased}</span>
                    <span style={styles.statLabel}>Buildings</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{formatTime(stats.clicker.totalPlaytime)}</span>
                    <span style={styles.statLabel}>Playtime</span>
                  </div>
                </div>
                {/* Prestige badges inline */}
                <div style={{ marginTop: '15px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#889', marginBottom: '6px' }}>Prestige Milestones</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                    {[1, 5, 10, 25, 50, 100].map(p => (
                      <span key={p} style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                        background: stats.clicker.totalPrestiges >= p ? 'rgba(243, 156, 18, 0.15)' : 'rgba(100, 100, 100, 0.15)',
                        border: `1px solid ${stats.clicker.totalPrestiges >= p ? 'rgba(243, 156, 18, 0.4)' : 'rgba(100, 100, 100, 0.3)'}`,
                        color: stats.clicker.totalPrestiges >= p ? '#f1c40f' : '#555',
                      }}>⭐ {p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CONVERGENCE: Prestige Stats */}
            <div style={{ marginTop: '30px' }}>
              <div style={styles.statsGrid}>
                <div style={{
                  ...styles.statsSection,
                  border: '1px solid rgba(243, 156, 18, 0.15)',
                }}>
                  <h2 style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    margin: '0 0 20px 0', fontSize: '1.3rem', color: '#f1c40f',
                  }}><span style={styles.gameIcon}>⭐</span> Prestige</h2>
                  <div style={styles.statsCards}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(241, 196, 15, 0.1))',
                      border: '1px solid rgba(243, 156, 18, 0.2)',
                      borderRadius: '12px', padding: '15px', textAlign: 'center' as const,
                    }}>
                      <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#f1c40f' }}>
                        {'★'.repeat(Math.min(prestigeLevel, 5))}{prestigeLevel > 5 ? `+${prestigeLevel - 5}` : ''} {prestigeLevel}
                      </span>
                      <span style={styles.statLabel}>Prestige Level</span>
                    </div>
                    <div style={styles.statCard}>
                      <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: ngPlusTier > 0 ? '#ff0266' : '#555' }}>
                        {ngPlusTier > 0 ? `NG+${ngPlusTier}` : 'Base'}
                      </span>
                      <span style={styles.statLabel}>NG+ Tier</span>
                    </div>
                    <div style={styles.statCard}>
                      <span style={styles.statValue}>{totalAPEarned}</span>
                      <span style={styles.statLabel}>Total AP Earned</span>
                    </div>
                    <div style={styles.statCard}>
                      <span style={styles.statValue}>{highestFloorEver}</span>
                      <span style={styles.statLabel}>Highest Floor Ever</span>
                    </div>
                  </div>
                </div>

                {/* Companions Section */}
                <div style={{
                  ...styles.statsSection,
                  border: '1px solid rgba(46, 204, 113, 0.15)',
                }}>
                  <h2 style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    margin: '0 0 20px 0', fontSize: '1.3rem', color: '#2ecc71',
                  }}><span style={styles.gameIcon}>🐾</span> Companions</h2>
                  {unlockedCompanions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                      {unlockedCompanions.map(cType => {
                        const def = COMPANION_DEFINITIONS[cType]
                        const level = companionLevels[cType] || 0
                        return (
                          <div key={cType} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: '10px',
                            border: `1px solid #${def.color.toString(16).padStart(6, '0')}40`,
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>{def.icon}</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ display: 'block', color: '#ddd', fontWeight: 600, fontSize: '0.9rem' }}>{def.name}</span>
                              <span style={{ display: 'block', color: '#778', fontSize: '0.75rem' }}>{def.passiveBonus}</span>
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <span style={{ display: 'block', color: '#2ecc71', fontWeight: 700, fontSize: '1.1rem' }}>Lv.{level}</span>
                              <span style={{ display: 'block', color: '#556', fontSize: '0.65rem' }}>/30</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' as const, padding: '20px', color: '#556' }}>
                      <span style={{ display: 'block', fontSize: '2rem', marginBottom: '8px' }}>🐾</span>
                      <span style={{ fontSize: '0.85rem' }}>No companions unlocked yet</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#445', marginTop: '4px' }}>Defeat bosses to unlock companions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CONVERGENCE: Elemental Kills */}
            <div style={{ marginTop: '25px' }}>
              <div style={{
                ...styles.statsSection,
                border: '1px solid rgba(0, 217, 255, 0.1)',
              }}>
                <h2 style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  margin: '0 0 20px 0', fontSize: '1.3rem', color: '#00d9ff',
                }}><span style={styles.gameIcon}>⚡</span> Elemental Kills</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {([
                    { type: 'fire' as ElementType, name: 'Fire', icon: '🔥', color: '#ff6600' },
                    { type: 'ice' as ElementType, name: 'Ice', icon: '❄️', color: '#00ccff' },
                    { type: 'lightning' as ElementType, name: 'Lightning', icon: '⚡', color: '#ffcc00' },
                    { type: 'void' as ElementType, name: 'Void', icon: '🌀', color: '#9b59b6' },
                  ]).map(elem => {
                    const kills = elementalKills[elem.type] || 0
                    return (
                      <div key={elem.type} style={{
                        textAlign: 'center' as const,
                        padding: '14px 10px',
                        background: `${elem.color}10`,
                        border: `1px solid ${elem.color}30`,
                        borderRadius: '12px',
                      }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '6px' }}>{elem.icon}</span>
                        <span style={{ display: 'block', color: elem.color, fontWeight: 700, fontSize: '1.2rem' }}>{formatNumber(kills)}</span>
                        <span style={{ display: 'block', color: '#778', fontSize: '0.7rem', marginTop: '4px' }}>{elem.name}</span>
                      </div>
                    )
                  })}
                </div>
                {(() => {
                  const total = Object.values(elementalKills).reduce((a, b) => a + b, 0)
                  return total > 0 ? (
                    <div style={{ marginTop: '12px', textAlign: 'center' as const }}>
                      <span style={{ color: '#889', fontSize: '0.8rem' }}>Total Elemental Kills: </span>
                      <span style={{ color: '#00d9ff', fontWeight: 700, fontSize: '0.9rem' }}>{formatNumber(total)}</span>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            {/* Category Filters */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
              {[
                { id: 'all' as const, label: 'All', color: '#fff' },
                { id: 'slayer' as const, label: 'DotSlayer', color: '#ff6b00' },
                { id: 'clicker' as const, label: 'Dot Clicker', color: '#00d9ff' },
                { id: 'synergy' as const, label: 'Cross-Game', color: '#f1c40f' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setAchievementFilter(f.id)}
                  style={{
                    padding: '8px 18px',
                    background: achievementFilter === f.id ? `${f.color}20` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${achievementFilter === f.id ? f.color + '50' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '20px',
                    color: achievementFilter === f.id ? f.color : '#778',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Rarity Summary */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map(rarity => {
                const filtered = achievements.filter(a => (achievementFilter === 'all' || a.game === achievementFilter))
                const total = filtered.filter(a => a.rarity === rarity).length
                const unlocked = filtered.filter(a => a.rarity === rarity && a.unlocked).length
                return total > 0 ? (
                  <div key={rarity} style={{ textAlign: 'center' }}>
                    <span style={{ ...getRarityStyle(rarity), fontSize: '0.65rem', padding: '2px 8px' }}>{rarity}</span>
                    <span style={{ display: 'block', color: getRarityColor(rarity), fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>{unlocked}/{total}</span>
                  </div>
                ) : null
              })}
            </div>
            {/* Achievement Grid */}
            <div style={styles.achievementsGrid}>
              {achievements
                .filter(a => achievementFilter === 'all' || a.game === achievementFilter)
                .sort((a, b) => {
                  const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
                  if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
                  return rarityOrder[b.rarity] - rarityOrder[a.rarity]
                })
                .map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    ...(achievement.unlocked ? {
                      ...styles.achievementCard,
                      background: `rgba(${getRarityColor(achievement.rarity).replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.1)`,
                      borderColor: getRarityColor(achievement.rarity),
                    } : styles.achievementCardLocked),
                  }}
                >
                  <div style={styles.achievementIcon}>{achievement.unlocked ? achievement.icon : '🔒'}</div>
                  <div style={styles.achievementInfo}>
                    <h3 style={styles.achievementInfoH3}>{achievement.unlocked ? achievement.name : '???'}</h3>
                    <p style={styles.achievementInfoP}>{achievement.unlocked ? achievement.description : 'Keep playing to unlock'}</p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                      <span style={getRarityStyle(achievement.rarity)}>{achievement.rarity}</span>
                      <span style={{ ...styles.rarityBadgeBase, background: achievement.game === 'slayer' ? '#ff6b0033' : achievement.game === 'clicker' ? '#00d9ff33' : '#f1c40f33', color: achievement.game === 'slayer' ? '#ff6b00' : achievement.game === 'clicker' ? '#00d9ff' : '#f1c40f' }}>
                        {achievement.game === 'slayer' ? 'Slayer' : achievement.game === 'clicker' ? 'Clicker' : 'Cross-Game'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'milestones' && stats && (
          <div style={styles.milestonesContent}>
            {/* DotSlayer Journey */}
            <div style={styles.milestoneSection}>
              <h2 style={styles.milestoneSectionH2Slayer}>⚔️ DotSlayer Journey</h2>
              <div style={styles.milestoneTrack}>
                {[
                  { floor: 1, icon: '🏃', label: 'Floor 1' },
                  { floor: 10, icon: '⚡', label: 'Floor 10' },
                  { floor: 25, icon: '🔥', label: 'Floor 25' },
                  { floor: 50, icon: '💀', label: 'Floor 50' },
                  { floor: 100, icon: '👹', label: 'Floor 100' },
                  { floor: 150, icon: '🏆', label: 'Floor 150', legendary: true },
                ].map((m, i, arr) => (
                  <div key={m.floor} style={{ display: 'contents' }}>
                    <div style={styles.milestoneNode}>
                      <span style={stats.slayer.highestFloor >= m.floor ? (m.legendary ? styles.nodeIconLegendaryCompleted : styles.nodeIconCompleted) : (m.legendary ? styles.nodeIconLegendary : styles.nodeIcon)}>{m.icon}</span>
                      <span style={stats.slayer.highestFloor >= m.floor ? styles.nodeLabelCompleted : styles.nodeLabel}>{m.label}</span>
                    </div>
                    {i < arr.length - 1 && <div style={styles.milestoneLine}></div>}
                  </div>
                ))}
              </div>
              <div style={styles.milestoneProgress}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFillSlayer, width: `${Math.min((stats.slayer.highestFloor / 150) * 100, 100)}%` }}></div>
                </div>
                <span style={styles.progressText}>{stats.slayer.highestFloor}/150 Floors</span>
              </div>
            </div>

            {/* Stat Visualization - Bar Charts */}
            <div style={styles.milestoneSection}>
              <h2 style={styles.milestoneSectionH2Slayer}>📊 Combat Stats</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {[
                  { label: 'Total Kills', value: stats.slayer.totalKills, max: Math.max(stats.slayer.totalKills, 10000), color: '#e74c3c' },
                  { label: 'Total Damage', value: stats.slayer.totalDamage, max: Math.max(stats.slayer.totalDamage, 100000), color: '#ff6b00' },
                  { label: 'Bosses Defeated', value: stats.slayer.bossesDefeated, max: Math.max(stats.slayer.bossesDefeated, 50), color: '#9b59b6' },
                  { label: 'Best Combo', value: stats.slayer.bestCombo, max: Math.max(stats.slayer.bestCombo, 200), color: '#f39c12' },
                  { label: 'Gold Earned', value: stats.slayer.totalGoldEarned, max: Math.max(stats.slayer.totalGoldEarned, 50000), color: '#f1c40f' },
                  { label: 'Perfect Floors', value: stats.slayer.perfectFloors, max: Math.max(stats.slayer.perfectFloors, 20), color: '#2ecc71' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#aab' }}>{stat.label}</span>
                      <span style={{ fontSize: '0.8rem', color: stat.color, fontWeight: 700 }}>{formatNumber(stat.value)}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (stat.value / stat.max) * 100)}%`, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#889', fontSize: '0.85rem' }}>Win Rate</span>
                <span style={{ color: '#2ecc71', fontWeight: 700, fontSize: '0.95rem' }}>
                  {stats.slayer.gamesPlayed > 0 ? Math.round((stats.slayer.gamesWon / stats.slayer.gamesPlayed) * 100) : 0}%
                  <span style={{ color: '#667', fontWeight: 400, fontSize: '0.75rem', marginLeft: '6px' }}>({stats.slayer.gamesWon}/{stats.slayer.gamesPlayed})</span>
                </span>
              </div>
            </div>

            {/* Recent Runs */}
            {recentRuns.length > 0 && (
              <div style={styles.milestoneSection}>
                <h2 style={styles.milestoneSectionH2Recent}>📜 Recent Runs</h2>
                <div style={styles.recentRuns}>
                  {recentRuns.map((run, i) => (
                    <div key={run.id || i} style={run.was_victory ? styles.runCardVictory : styles.runCard}>
                      <div style={styles.runFloor}>Floor {run.floor_reached}</div>
                      <div style={styles.runStats}>
                        <span>💰 {formatNumber(run.score)}</span>
                        <span>💀 {run.kills} kills</span>
                        <span>⏱️ {formatTime(run.time_played / 60)}</span>
                      </div>
                      {run.was_victory && <span style={styles.victoryBadge}>🏆 VICTORY</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weapon Mastery Tab */}
        {activeTab === 'mastery' && (
          <div style={{ padding: '20px 0' }}>
            <h2 style={{ textAlign: 'center', color: '#f39c12', marginBottom: '10px', fontSize: '1.3rem' }}>🔫 Weapon Mastery</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '10px', fontSize: '0.85rem' }}>
              Kill enemies with each weapon to earn permanent damage bonuses that persist across runs!
            </p>
            {/* Mastery Summary */}
            {(() => {
              const weapons = ['Pistol', 'Shotgun', 'SMG', 'Rifle', 'Sniper', 'Minigun', 'Rocket Launcher', 'Laser Rifle', 'Flamethrower', 'Rail Gun', 'Grenade Launcher']
              const allKills = weapons.map(w => {
                try { const d = JSON.parse(localStorage.getItem('dotslayer_weapon_mastery') || '{}'); return d.kills?.[w] || 0 } catch { return 0 }
              })
              const totalKills = allKills.reduce((a, b) => a + b, 0)
              const mastered = allKills.filter(k => k >= 50000).length
              return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
                  <div style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(243, 156, 18, 0.1)', borderRadius: '10px', border: '1px solid rgba(243, 156, 18, 0.2)' }}>
                    <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800, color: '#f39c12' }}>{totalKills.toLocaleString()}</span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#778' }}>Total Weapon Kills</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(255, 2, 102, 0.1)', borderRadius: '10px', border: '1px solid rgba(255, 2, 102, 0.2)' }}>
                    <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800, color: '#ff0266' }}>{mastered}/{weapons.length}</span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#778' }}>Grandmaster</span>
                  </div>
                </div>
              )
            })()}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {['Pistol', 'Shotgun', 'SMG', 'Rifle', 'Sniper', 'Minigun', 'Rocket Launcher', 'Laser Rifle', 'Flamethrower', 'Rail Gun', 'Grenade Launcher'].map(weapon => {
                const kills = (() => { try { const d = JSON.parse(localStorage.getItem('dotslayer_weapon_mastery') || '{}'); return d.kills?.[weapon] || 0 } catch { return 0 } })()
                const ranks = [
                  { name: 'Novice', req: 0, color: '#95a5a6', bonus: '+0%' },
                  { name: 'Apprentice', req: 100, color: '#2ecc71', bonus: '+5%' },
                  { name: 'Journeyman', req: 500, color: '#3498db', bonus: '+10%' },
                  { name: 'Expert', req: 2000, color: '#9b59b6', bonus: '+20%' },
                  { name: 'Master', req: 10000, color: '#f39c12', bonus: '+35%' },
                  { name: 'Grandmaster', req: 50000, color: '#ff0266', bonus: '+50%' },
                ]
                let rank = ranks[0]
                let nextRank: typeof ranks[0] | null = ranks[1]
                for (let i = ranks.length - 1; i >= 0; i--) {
                  if (kills >= ranks[i].req) { rank = ranks[i]; nextRank = ranks[i + 1] || null; break }
                }
                const progress = nextRank ? Math.min(100, ((kills - rank.req) / (nextRank.req - rank.req)) * 100) : 100
                const rankIndex = ranks.indexOf(rank)

                return (
                  <div key={weapon} style={{
                    background: 'rgba(20, 25, 40, 0.8)', borderRadius: '10px', padding: '14px 15px',
                    border: `1px solid ${rank.color}40`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{weapon}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: rank.color, fontWeight: 700, fontSize: '0.8rem' }}>{rank.name}</span>
                        <span style={{ color: rank.color, fontSize: '0.65rem', background: `${rank.color}20`, padding: '1px 6px', borderRadius: '8px' }}>{rank.bonus}</span>
                      </div>
                    </div>
                    {/* Rank pips */}
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                      {ranks.map((r, i) => (
                        <div key={r.name} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= rankIndex ? r.color : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ color: '#aab', fontSize: '0.8rem', fontWeight: 600 }}>{kills.toLocaleString()} kills</span>
                      {nextRank ? (
                        <span style={{ color: '#556', fontSize: '0.7rem' }}>Next: {nextRank.name} ({nextRank.req.toLocaleString()})</span>
                      ) : (
                        <span style={{ color: '#ff0266', fontSize: '0.7rem', fontWeight: 600 }}>MAX RANK</span>
                      )}
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}88)`, borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Clicker Tab - Stats + Prestige Progress */}
        {activeTab === 'challenges' && stats && (
          <div style={styles.milestonesContent}>
            {/* Clicker Empire Overview */}
            <div style={styles.milestoneSection}>
              <h2 style={styles.milestoneSectionH2Clicker}>● Dot Clicker Empire</h2>
              <div style={styles.milestoneTrack}>
                {[
                  { dots: 1000, icon: '👆', label: '1K' },
                  { dots: 1000000, icon: '💰', label: '1M' },
                  { dots: 1000000000, icon: '🏦', label: '1B' },
                  { dots: 1000000000000, icon: '💎', label: '1T' },
                ].map((m, i, arr) => (
                  <div key={m.dots} style={{ display: 'contents' }}>
                    <div style={styles.milestoneNode}>
                      <span style={stats.clicker.totalDots >= m.dots ? (m.dots >= 1000000000000 ? styles.nodeIconLegendaryCompleted : styles.nodeIconCompleted) : (m.dots >= 1000000000000 ? styles.nodeIconLegendary : styles.nodeIcon)}>{m.icon}</span>
                      <span style={stats.clicker.totalDots >= m.dots ? styles.nodeLabelCompleted : styles.nodeLabel}>{m.label} Dots</span>
                    </div>
                    {i < arr.length - 1 && <div style={styles.milestoneLine}></div>}
                  </div>
                ))}
              </div>
              <div style={styles.prestigeTrack}>
                <h3 style={styles.prestigeTrackH3}>Prestige Journey</h3>
                <div style={styles.prestigeBadges}>
                  {[1, 5, 10, 25, 50, 100].map(p => (
                    <div key={p} style={stats.clicker.totalPrestiges >= p ? styles.prestigeBadgeUnlocked : styles.prestigeBadge}>
                      ⭐ {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clicker Stat Bars */}
            <div style={styles.milestoneSection}>
              <h2 style={styles.milestoneSectionH2Clicker}>📊 Clicker Stats</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {[
                  { label: 'Total Dots Earned', value: stats.clicker.totalDots, max: Math.max(stats.clicker.totalDots, 1000000), color: '#00d9ff' },
                  { label: 'Peak DPS', value: stats.clicker.highestDps, max: Math.max(stats.clicker.highestDps, 10000), color: '#2ecc71' },
                  { label: 'Total Prestiges', value: stats.clicker.totalPrestiges, max: Math.max(stats.clicker.totalPrestiges, 50), color: '#f39c12' },
                  { label: 'Buildings Purchased', value: stats.clicker.buildingsPurchased, max: Math.max(stats.clicker.buildingsPurchased, 200), color: '#9b59b6' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#aab' }}>{stat.label}</span>
                      <span style={{ fontSize: '0.8rem', color: stat.color, fontWeight: 700 }}>{formatNumber(stat.value)}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (stat.value / stat.max) * 100)}%`, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              {stats.clicker.totalPlaytime > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                  <span style={{ color: '#889', fontSize: '0.85rem' }}>Playtime</span>
                  <span style={{ color: '#00d9ff', fontWeight: 700, fontSize: '0.95rem' }}>{formatTime(stats.clicker.totalPlaytime)}</span>
                </div>
              )}
            </div>

            {/* Synergy Overview */}
            <div style={styles.milestoneSection}>
              <h2 style={styles.milestoneSectionH2Synergy}>🔗 Cross-Game Synergy</h2>
              <div style={styles.synergyMeter}>
                <div style={styles.synergyLevelDisplay}>
                  <span style={styles.levelNumber}>{stats.synergyLevel}</span>
                  <span style={styles.levelLabel}>Synergy Level</span>
                </div>
                <div style={styles.synergyBonuses}>
                  <div style={styles.bonusItem}>
                    <span style={styles.bonusIcon}>⚔️</span>
                    <span style={styles.bonusText}>+{stats.slayer.highestFloor}% Clicker Bonus</span>
                  </div>
                  <div style={styles.bonusItem}>
                    <span style={styles.bonusIcon}>●</span>
                    <span style={styles.bonusText}>+{stats.clicker.totalPrestiges * 5}% Slayer Bonus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Challenge Mode Records */}
            <div style={styles.milestoneSection}>
              <h2 style={{ ...styles.milestoneSectionH2Clicker, color: '#e74c3c' }}>🏅 Challenge Records</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  { id: 'boss_rush', name: 'Boss Rush', icon: '👹', color: '#e74c3c' },
                  { id: 'survival', name: 'Survival', icon: '💀', color: '#9b59b6' },
                  { id: 'speed_run', name: 'Speed Run', icon: '⏱️', color: '#f39c12' },
                  { id: 'hardcore', name: 'Hardcore', icon: '☠️', color: '#2c3e50' },
                ].map(mode => {
                  const record = (() => { try { const d = JSON.parse(localStorage.getItem('dotslayer_challenge_modes') || '{}'); return d.records?.[mode.id] } catch { return null } })()
                  return (
                    <div key={mode.id} style={{ background: `${mode.color}10`, border: `1px solid ${mode.color}30`, borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
                      <span style={{ fontSize: '1.3rem' }}>{mode.icon}</span>
                      <span style={{ display: 'block', color: mode.color, fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>{mode.name}</span>
                      <span style={{ display: 'block', color: record ? '#ccc' : '#555', fontSize: '0.75rem', marginTop: '4px' }}>
                        {record ? record.details : 'Not attempted'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* INFINITE HORIZONS: Item Collection Tab */}
        {activeTab === 'collection' && (
          <div style={{ padding: '20px 0' }}>
            <h2 style={{ textAlign: 'center', color: '#1abc9c', marginBottom: '20px', fontSize: '1.3rem' }}>📦 Item Sets</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '20px', fontSize: '0.85rem' }}>
              Collect items from the same set to unlock powerful bonuses!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
              {[
                { name: 'Void Set', icon: '🌀', color: '#2d0050', items: ['Void Shard', 'Shadow Cloak', 'Quantum Core'], bonus2: '+20% Void Damage', bonus3: 'Void enemies drop 2x loot' },
                { name: 'Berserker Set', icon: '🔥', color: '#e74c3c', items: ["Berserker's Rage", 'Amplifier', 'Critical Matrix'], bonus2: '+15% Damage', bonus3: '+1% damage per missing HP%' },
                { name: 'Guardian Set', icon: '🛡️', color: '#27ae60', items: ['Bio Enhancement', 'Phoenix Feather', 'Healing Totem'], bonus2: '+25% Max HP', bonus3: 'Auto-revive with 30% HP' },
                { name: 'Fortune Set', icon: '💰', color: '#ffd700', items: ['Gold Magnet', 'XP Catalyst', 'Med Kit'], bonus2: '+30% Gold Drops', bonus3: 'Rare items drop 2x' },
                { name: 'Elemental Set', icon: '⚡', color: '#00ccff', items: ['Plasma Battery', 'Time Crystal', 'Rapid Fire Core'], bonus2: '+20% Status Duration', bonus3: 'Random status on hit' },
                { name: 'Mechanical Set', icon: '⚙️', color: '#44aaff', items: ['Mechanical Core', 'Overclocked Barrel', 'Expanded Magazine'], bonus2: '+25% Fire Rate', bonus3: 'Auto-turret companion' },
              ].map(set => (
                <div key={set.name} style={{
                  background: `linear-gradient(135deg, ${set.color}15, ${set.color}08)`,
                  border: `1px solid ${set.color}40`, borderRadius: '12px', padding: '15px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{set.icon}</span>
                    <span style={{ color: set.color, fontWeight: 700, fontSize: '1rem' }}>{set.name}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    {set.items.map(item => (
                      <span key={item} style={{ display: 'block', color: '#999', fontSize: '0.8rem', padding: '2px 0' }}>
                        ○ {item}
                      </span>
                    ))}
                  </div>
                  <div style={{ borderTop: `1px solid ${set.color}20`, paddingTop: '8px', fontSize: '0.8rem' }}>
                    <div style={{ color: '#aaa' }}>2pc: <span style={{ color: set.color }}>{set.bonus2}</span></div>
                    <div style={{ color: '#aaa' }}>3pc: <span style={{ color: set.color, fontWeight: 600 }}>{set.bonus3}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShare && stats && (
        <SocialShare
          data={{
            title: `${displayName}'s Dot Universe Profile`,
            text: `Check out my stats!`,
            score: stats.slayer.highestFloor,
            floor: stats.slayer.highestFloor,
            game: 'slayer'
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
