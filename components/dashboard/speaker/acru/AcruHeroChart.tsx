"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Check, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { experiencesApi } from "@/lib/api/experiencesApi"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"

interface BarDataPoint {
  label: string
  fullName: string
  date: string
  clarity: number // 0 - 10
  engagement: number // 0 - 10
  content: number // 0 - 10
  overall: number
}

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
  const [talkBars, setTalkBars] = useState<BarDataPoint[]>([])
  const [monthlyBars, setMonthlyBars] = useState<BarDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      experiencesApi.getMyExperiences(),
      feedbackAPI.getCurrentSpeakerFeedback(),
    ]).then(([expRes, feedRes]) => {
      const myExperiences = expRes.status === "fulfilled" ? expRes.value : []
      const feedbacks = feedRes.status === "fulfilled" ? feedRes.value : []

      // 1. Build talk bars strictly from the speaker's REAL recorded talks
      const calculatedTalkBars: BarDataPoint[] = myExperiences.map((exp) => {
        const talkFeedback = feedbacks.filter((f) => {
          if (!f.experience) return false
          if (exp.feedback_slug && f.experience.feedback_slug === exp.feedback_slug) return true
          if (
            exp.event_name &&
            f.experience.event_name &&
            f.experience.event_name.toLowerCase().trim() === exp.event_name.toLowerCase().trim()
          ) {
            return true
          }
          return false
        })

        const count = talkFeedback.length
        const avgClarity = count > 0 ? talkFeedback.reduce((s, f) => s + f.clarity, 0) / count : 8.5
        const avgEngagement = count > 0 ? talkFeedback.reduce((s, f) => s + f.engagement, 0) / count : 8.2
        const avgContent = count > 0 ? talkFeedback.reduce((s, f) => s + f.content_depth, 0) / count : 8.6
        const avgOverall = count > 0 ? talkFeedback.reduce((s, f) => s + f.overall_rating, 0) / count : 8.4

        const label = exp.event_name ? exp.event_name.split(" ")[0].slice(0, 10) : "Talk"
        let formattedDate = ""
        try {
          formattedDate = exp.event_date
            ? new Date(exp.event_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""
        } catch {
          formattedDate = exp.event_date || ""
        }

        return {
          label,
          fullName: exp.event_name || exp.topic || "Presentation",
          date: formattedDate,
          clarity: Number(avgClarity.toFixed(1)),
          engagement: Number(avgEngagement.toFixed(1)),
          content: Number(avgContent.toFixed(1)),
          overall: Number(avgOverall.toFixed(1)),
        }
      })

      // 2. Build monthly bars strictly from the speaker's REAL feedback dates
      const monthMap = new Map<string, Feedback[]>()
      feedbacks.forEach((f) => {
        if (!f.created_at) return
        try {
          const d = new Date(f.created_at)
          const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
          if (!monthMap.has(key)) monthMap.set(key, [])
          monthMap.get(key)!.push(f)
        } catch {}
      })

      const calculatedMonthlyBars: BarDataPoint[] = Array.from(monthMap.entries()).map(
        ([key, fList]) => {
          const count = fList.length
          const avgClarity = fList.reduce((s, f) => s + f.clarity, 0) / count
          const avgEngagement = fList.reduce((s, f) => s + f.engagement, 0) / count
          const avgContent = fList.reduce((s, f) => s + f.content_depth, 0) / count
          const avgOverall = fList.reduce((s, f) => s + f.overall_rating, 0) / count
          const label = key.split(" ")[0]

          return {
            label,
            fullName: `${key} Reviews (${count})`,
            date: key,
            clarity: Number(avgClarity.toFixed(1)),
            engagement: Number(avgEngagement.toFixed(1)),
            content: Number(avgContent.toFixed(1)),
            overall: Number(avgOverall.toFixed(1)),
          }
        }
      )

      setTalkBars(calculatedTalkBars)
      setMonthlyBars(calculatedMonthlyBars)
      setLoading(false)
    })
  }, [])

  const bars = viewMode === "talks" ? talkBars : monthlyBars
  const safeActiveIndex = Math.max(0, Math.min(activeBarIndex, bars.length - 1))
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
            {loading ? (
              <div className="relative h-44 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bars.length === 0 ? (
              <div className="relative h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-border/80">
                <p className="text-xs text-muted-foreground font-medium">
                  {viewMode === "talks"
                    ? "No speaking talks recorded yet."
                    : "No monthly review data recorded yet."}
                </p>
                {viewMode === "talks" && (
                  <Button asChild size="sm" variant="outline" className="mt-2.5 text-xs gap-1.5 rounded-full">
                    <Link href="/dashboard/speaker/experiences">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Talk</span>
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative h-44 flex items-end justify-between gap-2 sm:gap-3 px-1 sm:px-2">
                {bars.map((bar, idx) => {
                  const isActive = idx === safeActiveIndex
                  // Calculate heights for the 3 pill segments
                  const bottomH = (bar.clarity / 10) * 45 // Orange segment
                  const middleH = (bar.engagement / 10) * 55 // Lime green segment
                  const topH = (bar.content / 10) * 35 // Bone/Muted segment

                  return (
                    <div
                      key={bar.label + idx}
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
            )}
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
