'use client'

import { useMemo } from 'react'
import { Mic, Code, Palette, Shield, Zap, Globe, Brain, Rocket, Heart, Users } from 'lucide-react'

interface TalkCoverImageProps {
  title: string
  category?: string
  className?: string
}

// Generate a deterministic hash from a string
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Color palettes for different "moods" — all look premium
const PALETTES = [
  { from: '#f97316', via: '#ef4444', to: '#ec4899' },    // orange → red → pink
  { from: '#8b5cf6', via: '#6366f1', to: '#3b82f6' },    // purple → indigo → blue
  { from: '#06b6d4', via: '#0ea5e9', to: '#6366f1' },    // cyan → sky → indigo
  { from: '#10b981', via: '#14b8a6', to: '#06b6d4' },    // emerald → teal → cyan
  { from: '#f59e0b', via: '#f97316', to: '#ef4444' },    // amber → orange → red
  { from: '#ec4899', via: '#8b5cf6', to: '#6366f1' },    // pink → purple → indigo
  { from: '#84cc16', via: '#22c55e', to: '#10b981' },    // lime → green → emerald
  { from: '#f43f5e', via: '#e11d48', to: '#be185d' },    // rose → red → pink
  { from: '#0ea5e9', via: '#2563eb', to: '#7c3aed' },    // sky → blue → violet
  { from: '#14b8a6', via: '#0d9488', to: '#0891b2' },    // teal → darker → cyan
]

// Icons mapped to common topics
const TOPIC_ICONS = [Mic, Code, Palette, Shield, Zap, Globe, Brain, Rocket, Heart, Users]

// SVG pattern generators (geometric shapes)
function generatePattern(hash: number): string {
  const patternType = hash % 5

  switch (patternType) {
    case 0: // Circles
      return `
        <circle cx="20" cy="20" r="8" fill="white" opacity="0.06"/>
        <circle cx="60" cy="60" r="12" fill="white" opacity="0.04"/>
        <circle cx="80" cy="20" r="6" fill="white" opacity="0.08"/>
      `
    case 1: // Diagonal lines
      return `
        <line x1="0" y1="0" x2="100" y2="100" stroke="white" stroke-width="1" opacity="0.06"/>
        <line x1="20" y1="0" x2="120" y2="100" stroke="white" stroke-width="1" opacity="0.04"/>
        <line x1="-20" y1="0" x2="80" y2="100" stroke="white" stroke-width="1" opacity="0.04"/>
        <line x1="40" y1="0" x2="140" y2="100" stroke="white" stroke-width="0.5" opacity="0.06"/>
      `
    case 2: // Dots grid
      return `
        <circle cx="10" cy="10" r="2" fill="white" opacity="0.08"/>
        <circle cx="30" cy="10" r="2" fill="white" opacity="0.06"/>
        <circle cx="50" cy="10" r="2" fill="white" opacity="0.08"/>
        <circle cx="70" cy="10" r="2" fill="white" opacity="0.06"/>
        <circle cx="90" cy="10" r="2" fill="white" opacity="0.08"/>
        <circle cx="20" cy="30" r="2" fill="white" opacity="0.06"/>
        <circle cx="40" cy="30" r="2" fill="white" opacity="0.08"/>
        <circle cx="60" cy="30" r="2" fill="white" opacity="0.06"/>
        <circle cx="80" cy="30" r="2" fill="white" opacity="0.08"/>
      `
    case 3: // Hexagon-ish
      return `
        <polygon points="50,5 95,27 95,72 50,95 5,72 5,27" fill="none" stroke="white" stroke-width="1" opacity="0.06"/>
        <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="white" stroke-width="0.5" opacity="0.04"/>
      `
    case 4: // Waves
      return `
        <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" stroke-width="1.5" opacity="0.06"/>
        <path d="M0,70 Q25,50 50,70 T100,70" fill="none" stroke="white" stroke-width="1" opacity="0.04"/>
        <path d="M0,30 Q25,10 50,30 T100,30" fill="none" stroke="white" stroke-width="1" opacity="0.04"/>
      `
    default:
      return ''
  }
}

export function TalkCoverImage({ title, category, className = '' }: TalkCoverImageProps) {
  const { palette, Icon, pattern, rotation } = useMemo(() => {
    const hash = hashString(title || 'talk')
    const paletteIndex = hash % PALETTES.length
    const iconIndex = (hash >> 4) % TOPIC_ICONS.length
    const rotationAngle = (hash % 360)

    return {
      palette: PALETTES[paletteIndex],
      Icon: TOPIC_ICONS[iconIndex],
      pattern: generatePattern(hash),
      rotation: rotationAngle,
    }
  }, [title])

  const patternSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">${pattern}</svg>`
  )}`

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${rotation}deg, ${palette.from}, ${palette.via}, ${palette.to})`,
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${patternSvg}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Glowing orb effect */}
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: '60%',
          height: '60%',
          top: '20%',
          left: '20%',
          backgroundColor: palette.from,
        }}
      />

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <Icon className="w-10 h-10 text-white/60" strokeWidth={1.5} />
        </div>
      </div>

      {/* Category badge (if provided) */}
      {category && (
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 bg-black/20 backdrop-blur-sm rounded-full">
            {category}
          </span>
        </div>
      )}
    </div>
  )
}
