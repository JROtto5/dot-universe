'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import Link from 'next/link'
import { useAuth } from '../../lib/context/AuthContext'
import { useRouter } from 'next/navigation'

// Dynamically import Phaser to avoid SSR issues
const GameWrapper = dynamic(() => import('../../lib/game/GameWrapper'), {
  ssr: false,
  loading: () => (
    <div id="loading">
      <div className="loading-title">DOT SLAYER</div>
      <div className="loading-subtitle">100 Floors Challenge</div>
      <div className="loading-bar">
        <div className="loading-bar-fill"></div>
      </div>
    </div>
  ),
})

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // All hooks must be at the top before any conditional returns
  const [gameStats, setGameStats] = useState({
    health: 100,
    maxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    money: 0,
    xp: 0,
    level: 1,
    weapon: 'Pistol',
    skillPoints: 0,
    combo: 0,
    bestCombo: 0,
  })

  const [currentMission, setCurrentMission] = useState({
    title: 'Welcome to Crime City',
    objective: 'Explore the city and eliminate enemies',
    progress: '0 / 10 enemies',
  })

  const [messages, setMessages] = useState<Array<{ text: string; type: string; id: number }>>([])

  // INFINITE HORIZONS: New HUD state
  const [floorModifiers, setFloorModifiers] = useState<Array<{ name: string; icon: string; category: string; description: string }>>([])
  const [weaponMasteryInfo, setWeaponMasteryInfo] = useState<{ weapon: string; rank: string; rankIcon: string; rankColor: number; kills: number; nextRank: string; killsToNext: number } | null>(null)
  const [setProgress, setSetProgress] = useState<Array<{ name: string; icon: string; pieces: number; total: number; bonuses: string[] }>>([])
  const [activeWeaponSlot, setActiveWeaponSlot] = useState(0)
  const [classWeapons, setClassWeapons] = useState<number[]>([])

  // Weapon names for display
  const WEAPON_NAMES = ['Pistol', 'SMG', 'Shotgun', 'Sniper', 'Laser', 'Rocket', 'Minigun', 'Plasma']

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Listen for game events
    const handleGameEvent = (event: CustomEvent) => {
      const { type, data } = event.detail

      switch (type) {
        case 'statsUpdate':
          setGameStats(data)
          break
        case 'missionUpdate':
          setCurrentMission(data)
          break
        case 'message':
          const newMessage = { ...data, id: Date.now() }
          setMessages(prev => [...prev.slice(-1), newMessage]) // Keep only last 2 messages
          setTimeout(() => {
            setMessages(prev => prev.filter(m => m.id !== newMessage.id))
          }, 2500)
          break
        case 'floorModifiers':
          setFloorModifiers(data)
          break
        case 'weaponMastery':
          setWeaponMasteryInfo(data)
          break
        case 'setProgress':
          setSetProgress(data)
          break
        case 'weaponSwitch':
          setActiveWeaponSlot(data.slot)
          setClassWeapons(data.weapons)
          break
      }
    }

    window.addEventListener('gameEvent' as any, handleGameEvent)
    return () => window.removeEventListener('gameEvent' as any, handleGameEvent)
  }, [])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a1929',
        color: '#05878a',
        fontSize: '24px',
        fontFamily: 'system-ui'
      }}>
        Loading DotSlayer...
      </div>
    )
  }

  // Don't render game if not authenticated
  if (!user) {
    return null
  }

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'DotSlayer',
    description: '100 floors of procedurally generated roguelike action. Compete globally, unlock skills, collect items. Free browser-based dungeon crawler.',
    genre: ['Roguelike', 'Action', 'Dungeon Crawler'],
    gamePlatform: 'Web browser',
    applicationCategory: 'Game',
    url: 'https://dotslayer.vercel.app',
    operatingSystem: 'Any (Web browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'DotSlayer Team',
    },
    keywords: 'dotslayer, free browser game, roguelike, dungeon crawler, procedural generation, skill tree, global leaderboard, competitive game, no download',
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div id="game-container">
        <GameWrapper />

      <div id="hud">
        {/* Hub Button */}
        <Link href="/hub" id="hub-btn">← Hub</Link>

        {/* Stats */}
        <div id="stats">
          <div className="stat-bar">
            <div className="stat-label">Health</div>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill health-bar"
                style={{ width: `${(gameStats.health / gameStats.maxHealth) * 100}%` }}
              ></div>
            </div>
            <div className="stat-value">{gameStats.health} / {gameStats.maxHealth}</div>
          </div>

          <div className="stat-bar">
            <div className="stat-label">Ammo</div>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill ammo-bar"
                style={{ width: `${(gameStats.ammo / gameStats.maxAmmo) * 100}%` }}
              ></div>
            </div>
            <div className="stat-value">{gameStats.ammo} / {gameStats.maxAmmo}</div>
          </div>

          <div className="stat-bar">
            <div className="stat-label">Level {gameStats.level}</div>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill xp-bar"
                style={{ width: `${(gameStats.xp % 100)}%` }}
              ></div>
            </div>
            <div className="stat-value">XP: {gameStats.xp}</div>
          </div>

          {gameStats.skillPoints > 0 && (
            <div className="stat-bar" style={{ marginTop: '10px' }}>
              <div className="stat-label" style={{ color: '#f39c12' }}>⚡ Skill Points: {gameStats.skillPoints}</div>
              <div className="stat-value" style={{ color: '#f39c12' }}>Press T to upgrade!</div>
            </div>
          )}

          {gameStats.combo > 0 && (
            <div className="stat-bar" style={{ marginTop: '10px' }}>
              <div className="stat-label" style={{ color: '#e74c3c' }}>🔥 COMBO: {gameStats.combo}x</div>
              <div className="stat-value">Best: {gameStats.bestCombo}</div>
            </div>
          )}
        </div>

        {/* Money */}
        <div id="money">
          ${gameStats.money.toLocaleString()}
        </div>

        {/* Mission */}
        <div id="mission">
          <div className="mission-title">{currentMission.title}</div>
          <div className="mission-objective">{currentMission.objective}</div>
          <div className="mission-progress">{currentMission.progress}</div>
        </div>

        {/* Weapon + Mastery */}
        <div id="weapon">
          <div className="weapon-name">
            {gameStats.weapon}
            {weaponMasteryInfo && (
              <span style={{
                marginLeft: '6px',
                fontSize: '12px',
                color: `#${(weaponMasteryInfo.rankColor || 0x95a5a6).toString(16).padStart(6, '0')}`
              }}>
                {weaponMasteryInfo.rankIcon} {weaponMasteryInfo.rank}
              </span>
            )}
          </div>
          <div className="weapon-ammo">{gameStats.ammo} rounds</div>
          {weaponMasteryInfo && weaponMasteryInfo.killsToNext > 0 && (
            <div style={{ fontSize: '10px', color: '#88c0d0', marginTop: '2px' }}>
              {weaponMasteryInfo.kills} kills → {weaponMasteryInfo.nextRank}
            </div>
          )}
        </div>

        {/* Weapon Switcher */}
        {classWeapons.length > 1 && (
          <div id="weapon-switcher" style={{
            position: 'absolute', bottom: '90px', right: '20px',
            display: 'flex', gap: '4px', zIndex: 100
          }}>
            {classWeapons.map((wpnIdx, i) => (
              <div key={i} style={{
                padding: '4px 8px',
                background: i === activeWeaponSlot ? 'rgba(0,217,255,0.3)' : 'rgba(0,0,0,0.6)',
                border: `1px solid ${i === activeWeaponSlot ? '#00d9ff' : '#333'}`,
                borderRadius: '4px',
                fontSize: '11px',
                color: i === activeWeaponSlot ? '#00d9ff' : '#888',
                cursor: 'pointer',
              }}>
                <span style={{ color: '#666', marginRight: '3px' }}>{i + 1}</span>
                {WEAPON_NAMES[wpnIdx] || '?'}
              </div>
            ))}
          </div>
        )}

        {/* Active Floor Modifiers */}
        {floorModifiers.length > 0 && (
          <div id="floor-modifiers" style={{
            position: 'absolute', top: '85px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '6px', zIndex: 100
          }}>
            {floorModifiers.map((mod, i) => {
              const catColor = mod.category === 'enemy' ? '#e74c3c'
                : mod.category === 'player' ? '#3498db'
                : mod.category === 'environment' ? '#9b59b6'
                : '#ffd700'
              return (
                <div key={i} title={mod.description} style={{
                  padding: '2px 8px',
                  background: 'rgba(0,0,0,0.7)',
                  border: `1px solid ${catColor}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: catColor,
                }}>
                  {mod.icon} {mod.name}
                </div>
              )
            })}
          </div>
        )}

        {/* Item Set Progress */}
        {setProgress.length > 0 && (
          <div id="set-progress" style={{
            position: 'absolute', top: '120px', right: '20px',
            display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 100
          }}>
            {setProgress.map((s, i) => (
              <div key={i} style={{
                padding: '3px 8px',
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#e0f4ff',
              }}>
                {s.icon} {s.name} {s.pieces}/{s.total}
                {s.bonuses.map((b, j) => (
                  <span key={j} style={{ color: '#2ecc71', marginLeft: '6px', fontSize: '10px' }}>✓ {b}</span>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div id="controls">
          <div className="control-line">WASD - Move</div>
          <div className="control-line">Mouse - Aim</div>
          <div className="control-line">Left Click - Shoot</div>
          <div className="control-line">R - Reload</div>
          <div className="control-line" style={{ color: '#00d9ff' }}>1-3 - Switch Weapon</div>
          <div className="control-line">E - Casino</div>
          <div className="control-line" style={{ color: '#f39c12' }}>T - Skill Tree</div>
          <div className="control-line" style={{ color: '#2ecc71', fontWeight: 'bold' }}>B - Shop</div>
          <div className="control-line" style={{ color: '#00d9ff' }}>I - Inventory/Gear</div>
          <div className="control-line" style={{ color: '#e74c3c' }}>ESC - Pause Menu</div>
          <div className="control-line" style={{ fontSize: '11px', color: '#888' }}>Space/Q/F - Abilities</div>
        </div>

        {/* Messages */}
        <div id="messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  )
}
