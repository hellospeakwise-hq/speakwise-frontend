"use client"

import React from "react"

interface SpeakBotLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
  subtitle?: string
  animated?: boolean
}

const SIZE_PX: Record<string, number> = {
  xs: 26,
  sm: 34,
  md: 44,
  lg: 56,
  xl: 68,
}

/**
 * SpeakBot Mascot Logo
 * Uses the tightly cropped SpeakBot mascot (`/speakbot.png` / `/speakbot.jpg`),
 * with a clean container, subtle contrast rim, and an animated idle wiggle.
 */
export function SpeakBotMark({
  size = 36,
  className = "",
  animated = true,
}: {
  size?: number
  className?: string
  animated?: boolean
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-slate-800/90 border border-slate-700/80 p-1 overflow-hidden shadow-sm select-none ${
        animated ? "animate-speakbot-wiggle hover:scale-105 transition-transform" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      aria-label="SpeakBot AI Mascot"
    >
      <img
        src="/speakbot.png"
        alt="SpeakBot AI"
        width={size}
        height={size}
        className="h-full w-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/speakbot.jpg"
        }}
      />
    </div>
  )
}

export function SpeakBotLogo({
  size = "md",
  className = "",
  showText = false,
  subtitle = "Executive Speaker Coach",
  animated = true,
}: SpeakBotLogoProps) {
  const px = SIZE_PX[size] || 44

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <SpeakBotMark size={px} animated={animated} />

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-none">
            <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-100">SpeakBot</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
              Coach
            </span>
          </div>
          {subtitle && (
            <span className="text-xs text-slate-400 leading-tight mt-0.5">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  )
}
