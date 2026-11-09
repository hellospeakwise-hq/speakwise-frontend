"use client"

import { ArrowRight } from "lucide-react"
import { SpeakBotMark } from "@/components/speakbot/speakbot-logo"

interface SpeakBotQuickCardProps {
  onOpenCoach: () => void
  totalCount: number
  avgRating: string
}

export function SpeakBotQuickCard({
  onOpenCoach,
  totalCount,
  avgRating,
}: SpeakBotQuickCardProps) {
  if (totalCount === 0) return null

  return (
    <button
      onClick={onOpenCoach}
      type="button"
      className="w-full rounded-2xl border border-border/80 bg-card hover:bg-muted/30 p-4 sm:p-5 transition-all text-left group shadow-xs active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Side: Avatar + Stacked Content */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Bot Avatar Icon in a rounded container */}
          <div className="h-10 w-10 rounded-xl bg-muted/80 border border-border/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <SpeakBotMark size={24} />
          </div>

          {/* Text block: Clean vertical hierarchy, zero collisions */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                SpeakBot Performance Coach
              </h3>
              {/* Subtle score badge on its own pill */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border/60 text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
                <span className="text-emerald-500 font-bold">★ {avgRating}</span>
                <span>·</span>
                <span>
                  {totalCount} {totalCount === 1 ? "review" : "reviews"}
                </span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Get instant audience delivery tips and talk comparisons
            </p>
          </div>
        </div>

        {/* Right Side: Clean Action Trigger */}
        <div className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-full border border-border/70 bg-muted/40 group-hover:bg-foreground group-hover:text-background flex items-center justify-center text-muted-foreground transition-all shrink-0 mt-0.5">
          <span className="hidden sm:inline text-xs font-semibold mr-1.5">Open Coach</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  )
}
