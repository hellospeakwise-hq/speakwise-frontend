"use client"

import React, { useState, useEffect, useMemo } from "react"
import { ChevronDown, Check, Award, Users, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"

export function AcruBottomRow() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [dimensionPeriod, setDimensionPeriod] = useState<"all" | "30d" | "7d">("all")
  const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false)

  const [impactTimeframe, setImpactTimeframe] = useState<"all" | "30d" | "7d">("all")
  const [isImpactDropdownOpen, setIsImpactDropdownOpen] = useState(false)

  // Load from DB
  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then((data) => {
        if (Array.isArray(data)) setFeedbacks(data)
      })
      .catch((err) => console.error("Error loading feedback for bottom row:", err))
      .finally(() => setLoading(false))
  }, [])

  // ─── 1. REAL DIMENSION ANALYSIS (Computed from Database feedbacks) ──────────
  const dimensionFilteredFeedbacks = useMemo(() => {
    const now = Date.now()
    if (dimensionPeriod === "7d") {
      return feedbacks.filter(
        (f) => f.created_at && now - new Date(f.created_at).getTime() <= 7 * 86400 * 1000
      )
    }
    if (dimensionPeriod === "30d") {
      return feedbacks.filter(
        (f) => f.created_at && now - new Date(f.created_at).getTime() <= 30 * 86400 * 1000
      )
    }
    return feedbacks
  }, [feedbacks, dimensionPeriod])

  const dimensionData = useMemo(() => {
    const list = dimensionFilteredFeedbacks.length > 0 ? dimensionFilteredFeedbacks : feedbacks
    const count = list.length
    if (count === 0) {
      return {
        score: "—",
        breakdown: [
          { label: "Audience Engagement", pct: "—", color: "bg-[#72A847]" },
          { label: "Speech Clarity", pct: "—", color: "bg-[#A3D977]" },
          { label: "Technical Depth", pct: "—", color: "bg-[#F5C244]" },
          { label: "Practical Relevance", pct: "—", color: "bg-[#E5984A]" },
        ],
      }
    }

    const avgEngagement = list.reduce((s, f) => s + f.engagement, 0) / count
    const avgClarity = list.reduce((s, f) => s + f.clarity, 0) / count
    const avgDepth = list.reduce((s, f) => s + f.content_depth, 0) / count
    const avgRelevance = list.reduce((s, f) => s + f.practical_relevance, 0) / count
    const avgScore = (list.reduce((s, f) => s + f.overall_rating, 0) / count).toFixed(1)

    const total = avgEngagement + avgClarity + avgDepth + avgRelevance || 1
    const pEng = Math.round((avgEngagement / total) * 100)
    const pClar = Math.round((avgClarity / total) * 100)
    const pDepth = Math.round((avgDepth / total) * 100)
    const pRel = Math.max(0, 100 - (pEng + pClar + pDepth))

    return {
      score: avgScore,
      breakdown: [
        { label: "Audience Engagement", pct: `${pEng}% (${avgEngagement.toFixed(1)})`, color: "bg-[#72A847]" },
        { label: "Speech Clarity", pct: `${pClar}% (${avgClarity.toFixed(1)})`, color: "bg-[#A3D977]" },
        { label: "Technical Depth", pct: `${pDepth}% (${avgDepth.toFixed(1)})`, color: "bg-[#F5C244]" },
        { label: "Practical Relevance", pct: `${pRel}% (${avgRelevance.toFixed(1)})`, color: "bg-[#E5984A]" },
      ],
    }
  }, [dimensionFilteredFeedbacks, feedbacks])

  // ─── 2. REAL SPEAKER IMPACT (Expanded & Computed from Database feedbacks) ──
  const impactFilteredFeedbacks = useMemo(() => {
    const now = Date.now()
    if (impactTimeframe === "7d") {
      return feedbacks.filter(
        (f) => f.created_at && now - new Date(f.created_at).getTime() <= 7 * 86400 * 1000
      )
    }
    if (impactTimeframe === "30d") {
      return feedbacks.filter(
        (f) => f.created_at && now - new Date(f.created_at).getTime() <= 30 * 86400 * 1000
      )
    }
    return feedbacks
  }, [feedbacks, impactTimeframe])

  const impactData = useMemo(() => {
    const list = impactFilteredFeedbacks.length > 0 ? impactFilteredFeedbacks : feedbacks
    const count = list.length
    if (count === 0) {
      return {
        pct: 0,
        avgScore: "—",
        count: 0,
        highRatingCount: 0,
        trend: "Awaiting attendee reviews",
        rank: "New Speaker",
        summary: "Collect reviews to benchmark your speaking impact score.",
      }
    }

    const avgScoreNum = list.reduce((s, f) => s + f.overall_rating, 0) / count
    const avgScore = avgScoreNum.toFixed(1)
    const pct = Math.min(100, Math.round((avgScoreNum / 10) * 100))
    const highRatingCount = list.filter((f) => f.overall_rating >= 8.5).length

    const rank =
      avgScoreNum >= 9.0
        ? "Top 5% Speaker"
        : avgScoreNum >= 8.0
        ? "Top 10% Speaker"
        : avgScoreNum >= 7.0
        ? "Top 20% Speaker"
        : "Active Speaker"

    return {
      pct,
      avgScore,
      count,
      highRatingCount,
      trend: `↗ ${(avgScoreNum * 10).toFixed(0)}% quality index`,
      rank,
      summary: `Based on verified attendee ratings across your speaking engagements (${count} reviews)`,
    }
  }, [impactFilteredFeedbacks, feedbacks])

  // Semi-circle SVG arch calculation
  const calculateArchPath = (pct: number) => {
    const clamped = Math.max(1, Math.min(100, pct))
    const angle = Math.PI - (clamped / 100) * Math.PI
    const endX = 100 + 80 * Math.cos(angle)
    const endY = 100 - 80 * Math.sin(angle)
    return `M 20 100 A 80 80 0 0 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── CARD 1: Dimension Analysis ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 relative">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground tracking-tight">
              Dimension Analysis
            </h4>
            <p className="text-[11px] text-muted-foreground">Feedback metrics breakdown</p>
          </div>

          {/* Interactive Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDimensionDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-muted/40 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Select dimension period"
            >
              <span>{dimensionPeriod === "all" ? "All Time" : dimensionPeriod === "30d" ? "Past 30d" : "Past 7d"}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isDimensionDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {isDimensionDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsDimensionDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 z-40 w-36 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { key: "all", label: "All Time" },
                    { key: "30d", label: "Past 30 days" },
                    { key: "7d", label: "Past 7 days" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setDimensionPeriod(opt.key as any)
                        setIsDimensionDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                        dimensionPeriod === opt.key
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span>{opt.label}</span>
                      {dimensionPeriod === opt.key && (
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Big number */}
        <div>
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {dimensionData.score}
          </span>
          <span className="text-xs text-muted-foreground ml-1 font-mono">/ 10</span>
        </div>

        {/* Multi-tone Chiclet Horizontal Bar */}
        <div className="flex items-center gap-1 w-full">
          <div className="h-2.5 flex-1 rounded-sm bg-[#72A847]" />
          <div className="h-2.5 flex-1 rounded-sm bg-[#A3D977]" />
          <div className="h-2.5 flex-1 rounded-sm bg-[#F5C244]" />
          <div className="h-2.5 flex-1 rounded-sm bg-[#E5984A]" />
        </div>

        {/* Breakdown table */}
        <div className="space-y-2.5 pt-1 text-xs">
          {dimensionData.breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-xs ${item.color}`} />
                <span className="text-muted-foreground text-[11px]">{item.label}</span>
              </div>
              <span className="font-mono text-[11px] font-medium text-foreground">
                {item.pct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 2: Expanded Speaker Impact Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 relative">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground tracking-tight">
              Speaker Impact
            </h4>
            <p className="text-[11px] text-muted-foreground">Confidence &amp; benchmark index</p>
          </div>

          {/* Interactive Timeframe Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsImpactDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-muted/40 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Select timeframe"
            >
              <span>{impactTimeframe === "all" ? "All Time" : impactTimeframe === "30d" ? "30d" : "7d"}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isImpactDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {isImpactDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsImpactDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 z-40 w-36 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { key: "all", label: "All Time" },
                    { key: "30d", label: "Past 30 days" },
                    { key: "7d", label: "Past 7 days" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setImpactTimeframe(opt.key as any)
                        setIsImpactDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                        impactTimeframe === opt.key
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span className="font-mono">{opt.label}</span>
                      {impactTimeframe === opt.key && (
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Impact Visual & Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
          {/* Semicircular Half-Donut Arch Meter */}
          <div className="relative flex flex-col items-center justify-center">
            <svg width="200" height="110" viewBox="0 0 200 110" className="overflow-visible">
              {/* Background Arch Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="currentColor"
                className="text-muted/60 dark:text-muted/40"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Dynamic Filled Arch Progress */}
              <path
                d={calculateArchPath(impactData.pct)}
                fill="none"
                stroke="#72A847"
                strokeWidth="16"
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Centered Arch Value & Label */}
            <div className="absolute bottom-2 text-center">
              <span className="text-xl font-bold font-mono text-foreground">
                {impactData.pct}%
              </span>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {impactData.rank}
              </p>
            </div>
          </div>

          {/* Quick Metrics Breakdown Strip */}
          <div className="space-y-2.5">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Avg Rating</span>
              </div>
              <span className="font-mono text-xs font-bold text-foreground">
                {impactData.avgScore} <span className="text-muted-foreground text-[10px]">/ 10</span>
              </span>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Verified Reviews</span>
              </div>
              <span className="font-mono text-xs font-bold text-foreground">
                {impactData.count}
              </span>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Top Reviews (≥8.5★)</span>
              </div>
              <span className="font-mono text-xs font-bold text-foreground">
                {impactData.highRatingCount}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center leading-tight pt-1">
          {impactData.summary}
        </p>
      </div>
    </div>
  )
}
