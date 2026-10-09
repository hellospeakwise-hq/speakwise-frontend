'use client'

import { useMemo } from 'react'

interface TalkCoverImageProps {
  title: string
  eventName: string
  className?: string
}

const EVENT_PALETTES = [
  { background: '#54223d', foreground: '#fff5f9', accent: '#f2a4c8' },
  { background: '#1d4652', foreground: '#f2fbfc', accent: '#8ed2dc' },
  { background: '#55401f', foreground: '#fff8e9', accent: '#f1c36f' },
  { background: '#34385d', foreground: '#f5f5ff', accent: '#b5b9f2' },
  { background: '#29483c', foreground: '#f3fbf5', accent: '#a4d3b2' },
]

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

export function TalkCoverImage({
  title,
  eventName,
  className = '',
}: TalkCoverImageProps) {
  const palette = useMemo(() => {
    const key = eventName.trim().toLowerCase()
    return EVENT_PALETTES[hashString(key) % EVENT_PALETTES.length]
  }, [eventName])

  return (
    <div
      className={`relative flex min-h-48 flex-col justify-between overflow-hidden p-5 ${className}`}
      style={{
        background: `linear-gradient(145deg, ${palette.background}, #111827)`,
        color: palette.foreground,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full border"
        style={{ borderColor: `${palette.accent}35` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-7 h-32 w-32 rounded-full border"
        style={{ borderColor: `${palette.accent}25` }}
      />

      <p className="relative z-10 line-clamp-3 max-w-[90%] text-lg font-semibold leading-tight tracking-tight">
        {eventName.trim() || 'Your event name'}
      </p>

      <div className="relative z-10">
        <div
          aria-hidden="true"
          className="h-1 w-10 rounded-full"
          style={{ backgroundColor: palette.accent }}
        />
        <p className="mt-4 line-clamp-3 text-xl font-semibold leading-snug">
          {title.trim() || 'Your talk title'}
        </p>
      </div>
    </div>
  )
}
