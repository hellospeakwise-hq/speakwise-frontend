"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BarDataPoint {
  label: string
  fullName: string
  date: string
  clarity: number // 0 - 10
  engagement: number // 0 - 10
  content: number // 0 - 10
  overall: number
}

// ── Realistic Data By Conference / Talk ─────────────────────────────────────────
const TALK_BARS: BarDataPoint[] = [
  {
    label: "DevFest",
    fullName: "DevFest Accra 2026",
    date: "Oct 27, 2026",
    clarity: 9.2,
    engagement: 8.8,
    content: 9.0,
    overall: 9.0,
  },
  {
    label: "PyCon",
    fullName: "PyCon Togo 2026",
    date: "Aug 27, 2026",
    clarity: 8.8,
    engagement: 8.2,
    content: 8.6,
    overall: 8.5,
  },
  {
    label: "TechGH",
    fullName: "Tech In Ghana Summit",
    date: "Jul 14, 2026",
    clarity: 8.5,
    engagement: 8.0,
    content: 8.4,
    overall: 8.3,
  },
  {
    label: "AccraJS",
    fullName: "AccraJS Web Meetup",
    date: "Jun 02, 2026",
    clarity: 9.4,
    engagement: 8.9,
    content: 9.1,
    overall: 9.1,
  },
  {
    label: "AWS Meet",
    fullName: "AWS Community Day",
    date: "Apr 18, 2026",
    clarity: 8.0,
    engagement: 7.6,
    content: 8.2,
    overall: 7.9,
  },
  {
    label: "ETH Acc",
    fullName: "ETH Accra Workshop",
    date: "Feb 10, 2026",
    clarity: 8.6,
    engagement: 8.4,
    content: 8.8,
    overall: 8.6,
  },
]

// ── Realistic Data By Month ───────────────────────────────────────────────────
const MONTHLY_BARS: BarDataPoint[] = [
  { label: "May", fullName: "May 2026 Reviews", date: "May 2026", clarity: 7.8, engagement: 7.4, content: 8.0, overall: 7.7 },
  { label: "Jun", fullName: "June 2026 Reviews", date: "Jun 2026", clarity: 8.4, engagement: 8.0, content: 8.5, overall: 8.3 },
  { label: "Jul", fullName: "July 2026 Reviews", date: "Jul 2026", clarity: 8.2, engagement: 7.8, content: 8.3, overall: 8.1 },
  { label: "Aug", fullName: "August 2026 Reviews", date: "Aug 2026", clarity: 8.9, engagement: 8.5, content: 8.8, overall: 8.7 },
  { label: "Sep", fullName: "September 2026 Reviews", date: "Sep 2026", clarity: 8.5, engagement: 8.2, content: 8.6, overall: 8.4 },
  { label: "Oct", fullName: "October 2026 Reviews", date: "Oct 2026", clarity: 9.2, engagement: 8.8, content: 9.0, overall: 9.0 },
]

interface AcruHeroChartProps {
  avgRating?: number | null
  totalFeedback?: number
  upcomingCount?: number
}

export function AcruHeroChart({
  avgRating = 8.3,
  totalFeedback = 20,
  upcomingCount = 0,
}: AcruHeroChartProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"talks" | "monthly">("talks")
  const [activeBarIndex, setActiveBarIndex] = useState<number>(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const bars = viewMode === "talks" ? TALK_BARS : MONTHLY_BARS
  const safeActiveIndex = Math.min(activeBarIndex, bars.length - 1)
  const activeBar = bars[safeActiveIndex]

  const handleBarClick = (bar: BarDataPoint, idx: number) => {
    setActiveBarIndex(idx)
    if (viewMode === "talks") {
      const query = bar.fullName || bar.label
      router.push(`/dashboard/speaker/feedback-by-talks?talk=${encodeURIComponent(query)}&event=${encodeURIComponent(bar.label)}`)
    } else {
      router.push(`/dashboard/speaker/feedback?month=${encodeURIComponent(bar.label)}`)
    }
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column (8 cols): Large Number + Stacked Segmented Pill Bars */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-5">
          {/* Top header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground tabular-nums">
                  {avgRating ? `${avgRating.toFixed(1)}` : "8.3"}
                </span>
                <span className="text-sm font-medium text-muted-foreground font-mono">/ 10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewMode === "talks"
                  ? "Speaking Performance by Conference Talk"
                  : "Speaking Performance by Month"}
              </p>
            </div>

            {/* Controls & Legend */}
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              {/* Legend matching ACRU colors */}
              <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E5984A]" /> Clarity
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#72A847]" /> Engagement
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#D6D9E0] dark:bg-muted-foreground/30" /> Content
                </span>
              </div>

              {/* Interactive View Mode Dropdown Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40 text-xs font-mono font-medium text-foreground hover:bg-muted cursor-pointer transition-all shadow-2xs active:scale-95"
                >
                  <span>{viewMode === "talks" ? "By Talk" : "Monthly"}</span>
                  <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 z-30 w-36 rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("talks")
                          setActiveBarIndex(0)
                          setIsDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                          viewMode === "talks"
                            ? "bg-muted text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span>By Talk</span>
                        {viewMode === "talks" && <Check className="h-3 w-3 text-emerald-500" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("monthly")
                          setActiveBarIndex(bars.length - 1)
                          setIsDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                          viewMode === "monthly"
                            ? "bg-muted text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span>Monthly</span>
                        {viewMode === "monthly" && <Check className="h-3 w-3 text-emerald-500" />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chunky Stacked Segmented Pill Bar Chart */}
          <div className="relative pt-6 pb-1">
            {/* Horizontal baseline guides */}
            <div className="absolute inset-x-0 top-6 bottom-7 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-border border-dashed w-full" />
              <div className="border-b border-border border-dashed w-full" />
              <div className="border-b border-border border-dashed w-full" />
            </div>

            {/* Bars container */}
            <div className="relative h-44 flex items-end justify-between gap-2 sm:gap-3 px-1 sm:px-2">
              {bars.map((bar, idx) => {
                const isActive = idx === safeActiveIndex
                // Calculate heights for the 3 pill segments
                const bottomH = (bar.clarity / 10) * 45 // Orange segment
                const middleH = (bar.engagement / 10) * 55 // Lime green segment
                const topH = (bar.content / 10) * 35 // Bone/Muted segment

                return (
                  <div
                    key={bar.label}
                    role="button"
                    tabIndex={0}
                    aria-label={`View feedback for ${bar.fullName}`}
                    onClick={() => handleBarClick(bar, idx)}
                    onMouseEnter={() => setActiveBarIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleBarClick(bar, idx)
                      }
                    }}
                    className="relative flex-1 flex flex-col items-center cursor-pointer group h-full justify-end min-w-0 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                  >
                    {/* Floating Tooltip Card over active bar */}
                    {isActive && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBarClick(bar, idx)
                        }}
                        className="absolute -top-16 sm:-top-20 z-20 whitespace-nowrap rounded-xl bg-popover border border-border/80 px-3 py-2 shadow-xl text-[10px] sm:text-[11px] font-sans animate-in fade-in zoom-in-95 duration-150 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-foreground text-[11px] line-clamp-1 max-w-[180px]">
                            {bar.fullName}
                          </p>
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-mono mt-0.5">
                          <span className="text-[#E5984A] font-bold">C: {bar.clarity}</span>
                          <span className="text-[#72A847] font-bold">E: {bar.engagement}</span>
                          <span className="text-foreground font-bold">★ {bar.overall}</span>
                        </div>
                        <div className="text-[10px] text-primary font-semibold mt-1 pt-1 border-t border-border/50 flex items-center justify-between gap-1">
                          <span>View Presentation Feedback</span>
                          <span className="text-[9px] font-mono text-muted-foreground">Click pill →</span>
                        </div>
                      </div>
                    )}

                    {/* Segmented Chunky Pill Stack */}
                    <div
                      className={cn(
                        "w-full max-w-[42px] flex flex-col items-center justify-end rounded-2xl p-1 transition-all duration-200 group-hover:scale-[1.04]",
                        isActive
                          ? "bg-muted/80 ring-2 ring-primary/20 scale-[1.02]"
                          : "hover:bg-muted/40"
                      )}
                    >
                      {/* Top Pill Segment (Content - Bone/Slate) */}
                      <div
                        style={{ height: `${topH}px` }}
                        className={cn(
                          "w-full rounded-t-xl transition-all",
                          isActive
                            ? "bg-[#D6D9E0] dark:bg-muted-foreground/40"
                            : "bg-[#E5E7EB] dark:bg-muted/60 group-hover:bg-[#D6D9E0]"
                        )}
                      />

                      {/* Middle Pill Segment (Engagement - Lime Green) */}
                      <div
                        style={{ height: `${middleH}px` }}
                        className={cn(
                          "w-full my-0.5 transition-all",
                          isActive
                            ? "bg-[#6EA740] shadow-xs"
                            : "bg-[#76C844] group-hover:bg-[#6EA740]"
                        )}
                      />

                      {/* Bottom Pill Segment (Clarity - Warm Ochre) */}
                      <div
                        style={{ height: `${bottomH}px` }}
                        className={cn(
                          "w-full rounded-b-xl transition-all",
                          isActive
                            ? "bg-[#E08A38]"
                            : "bg-[#F59E0B] group-hover:bg-[#E08A38]"
                        )}
                      />
                    </div>

                    {/* Conference / Month label */}
                    <span
                      className={cn(
                        "mt-2 text-[10px] sm:text-[11px] font-medium tracking-tight transition-colors text-center truncate w-full px-0.5 group-hover:text-primary",
                        isActive ? "text-foreground font-bold" : "text-muted-foreground"
                      )}
                    >
                      {bar.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Stacked Metric Counters */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full divide-y divide-border/60 border-t lg:border-t-0 lg:border-l lg:pl-6 border-border/70 pt-5 lg:pt-0 space-y-4">
          {/* Metric 1: Total Feedback */}
          <div className="pt-2 first:pt-0 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Reviews
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {totalFeedback}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+5.1% from last month</span>
            </div>
          </div>

          {/* Metric 2: Talk Rating */}
          <div className="pt-4 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Average Talk Rating
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {avgRating ? `${avgRating.toFixed(1)}` : "8.3"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">/ 10</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+15.5% quality index</span>
            </div>
          </div>

          {/* Metric 3: Audience Reached */}
          <div className="pt-4 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Audience Impact
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                88%
              </span>
              <span className="text-xs text-muted-foreground font-mono">benchmark</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+20.7% retention</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
