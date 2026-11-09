"use client"

import React, { useState } from "react"
import {
  ChevronDown,
  Plus,
  Mic,
  Users,
  Award,
  Star,
  Check,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ─── Data definitions for Dimension Analysis ──────────────────────────────────
interface DimensionData {
  label: string
  score: string
  breakdown: { label: string; pct: string; color: string }[]
}

const DIMENSION_PERIODS: Record<string, DimensionData> = {
  october: {
    label: "October 2026",
    score: "8.5",
    breakdown: [
      { label: "Audience Engagement", pct: "32%", color: "bg-[#72A847]" },
      { label: "Speech Clarity", pct: "26%", color: "bg-[#A3D977]" },
      { label: "Technical Depth", pct: "22%", color: "bg-[#F5C244]" },
      { label: "Practical Relevance", pct: "20%", color: "bg-[#E5984A]" },
    ],
  },
  september: {
    label: "September 2026",
    score: "8.4",
    breakdown: [
      { label: "Audience Engagement", pct: "30%", color: "bg-[#72A847]" },
      { label: "Speech Clarity", pct: "28%", color: "bg-[#A3D977]" },
      { label: "Technical Depth", pct: "24%", color: "bg-[#F5C244]" },
      { label: "Practical Relevance", pct: "18%", color: "bg-[#E5984A]" },
    ],
  },
  august: {
    label: "August 2026",
    score: "8.7",
    breakdown: [
      { label: "Audience Engagement", pct: "35%", color: "bg-[#72A847]" },
      { label: "Speech Clarity", pct: "25%", color: "bg-[#A3D977]" },
      { label: "Technical Depth", pct: "20%", color: "bg-[#F5C244]" },
      { label: "Practical Relevance", pct: "20%", color: "bg-[#E5984A]" },
    ],
  },
  season: {
    label: "All Season 2026",
    score: "8.3",
    breakdown: [
      { label: "Audience Engagement", pct: "31%", color: "bg-[#72A847]" },
      { label: "Speech Clarity", pct: "27%", color: "bg-[#A3D977]" },
      { label: "Technical Depth", pct: "23%", color: "bg-[#F5C244]" },
      { label: "Practical Relevance", pct: "19%", color: "bg-[#E5984A]" },
    ],
  },
}

// ─── Data definitions for Speaker Impact ──────────────────────────────────────
interface ImpactData {
  label: string
  pct: number
  trend: string
  rank: string
  summary: string
}

const IMPACT_TIMEFRAMES: Record<string, ImpactData> = {
  "7d": {
    label: "7d",
    pct: 94,
    trend: "↗ 19.2% from last week",
    rank: "Top 5% Speaker",
    summary: "Based on verified attendee ratings across 1 event in the past 7 days",
  },
  "30d": {
    label: "30d",
    pct: 88,
    trend: "↗ 17.5% from last month",
    rank: "Top 10% Speaker",
    summary: "Based on verified attendee ratings across 3 events in the past 30 days",
  },
  "90d": {
    label: "90d",
    pct: 84,
    trend: "↗ 12.0% from last quarter",
    rank: "Top 15% Speaker",
    summary: "Based on verified attendee ratings across 5 events in the past 90 days",
  },
  season: {
    label: "Season",
    pct: 86,
    trend: "↗ 14.8% season average",
    rank: "Top 10% Speaker",
    summary: "Based on verified attendee ratings across 8 events this season",
  },
}

interface GoalItem {
  id: string
  icon: typeof Mic
  title: string
  current: number
  target: number
  unit: string
  pct: number
  color: string
}

const INITIAL_GOALS: GoalItem[] = [
  {
    id: "goal-1",
    icon: Mic,
    title: "Keynote Delivery",
    current: 4,
    target: 5,
    unit: "talks",
    pct: 80,
    color: "bg-[#72A847]",
  },
  {
    id: "goal-2",
    icon: Users,
    title: "Attendee Reach",
    current: 780,
    target: 1000,
    unit: "attendees",
    pct: 78,
    color: "bg-[#F59E0B]",
  },
  {
    id: "goal-3",
    icon: Award,
    title: "Web3 Soulbound Badge",
    current: 1,
    target: 1,
    unit: "minted",
    pct: 100,
    color: "bg-[#72A847]",
  },
  {
    id: "goal-4",
    icon: Star,
    title: "9.0+ Rating Streak",
    current: 3,
    target: 4,
    unit: "events",
    pct: 75,
    color: "bg-[#E5984A]",
  },
]

export function AcruBottomRow() {
  // Dimension Analysis State
  const [dimensionPeriod, setDimensionPeriod] = useState<string>("october")
  const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false)
  const currentDimension = DIMENSION_PERIODS[dimensionPeriod] || DIMENSION_PERIODS.october

  // Speaker Impact State
  const [impactTimeframe, setImpactTimeframe] = useState<string>("30d")
  const [isImpactDropdownOpen, setIsImpactDropdownOpen] = useState(false)
  const currentImpact = IMPACT_TIMEFRAMES[impactTimeframe] || IMPACT_TIMEFRAMES["30d"]

  // Speaking Goals State
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCurrent, setNewCurrent] = useState("1")
  const [newTarget, setNewTarget] = useState("5")
  const [newUnit, setNewUnit] = useState("talks")
  const [newCategory, setNewCategory] = useState<"mic" | "users" | "star" | "award">("mic")

  // Semi-circle SVG arch calculation
  const calculateArchPath = (pct: number) => {
    const clamped = Math.max(1, Math.min(100, pct))
    const angle = Math.PI - (clamped / 100) * Math.PI
    const endX = 100 + 80 * Math.cos(angle)
    const endY = 100 - 80 * Math.sin(angle)
    return `M 20 100 A 80 80 0 0 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`
  }

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const curr = Math.max(0, parseInt(newCurrent, 10) || 0)
    const targ = Math.max(1, parseInt(newTarget, 10) || 1)
    const pct = Math.min(100, Math.round((curr / targ) * 100))

    const iconMap = {
      mic: Mic,
      users: Users,
      star: Star,
      award: Award,
    }

    const colorMap = {
      mic: "bg-[#72A847]",
      users: "bg-[#F59E0B]",
      star: "bg-[#E5984A]",
      award: "bg-[#6D8AE8]",
    }

    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      icon: iconMap[newCategory],
      title: newTitle.trim(),
      current: curr,
      target: targ,
      unit: newUnit.trim() || "talks",
      pct,
      color: colorMap[newCategory],
    }

    setGoals((prev) => [newGoal, ...prev])
    setNewTitle("")
    setNewCurrent("1")
    setNewTarget("5")
    setNewUnit("talks")
    setIsAddGoalOpen(false)
  }

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ── CARD 1: Dimension Analysis (Interactive Month Dropdown) ─────────── */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                Dimension Analysis
              </h4>
              <p className="text-[11px] text-muted-foreground">Category breakdown</p>
            </div>

            {/* Interactive Month Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDimensionDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-muted/40 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                aria-label="Select dimension period"
              >
                <span>{dimensionPeriod.charAt(0).toUpperCase() + dimensionPeriod.slice(1)}</span>
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
                  <div className="absolute right-0 mt-1.5 z-40 w-44 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    {Object.entries(DIMENSION_PERIODS).map(([key, data]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setDimensionPeriod(key)
                          setIsDimensionDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                          dimensionPeriod === key
                            ? "bg-muted text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span>{data.label}</span>
                        {dimensionPeriod === key && (
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
              {currentDimension.score}
            </span>
            <span className="text-xs text-muted-foreground ml-1 font-mono">/ 10</span>
          </div>

          {/* Multi-tone Chiclet Horizontal Bar */}
          <div className="flex items-center gap-1 w-full">
            <div className="h-2.5 flex-1 rounded-sm bg-[#E5984A]" />
            <div className="h-2.5 flex-1 rounded-sm bg-[#F5C244]" />
            <div className="h-2.5 flex-1 rounded-sm bg-[#A3D977]" />
            <div className="h-2.5 flex-1 rounded-sm bg-[#72A847]" />
            <div className="h-2.5 flex-1 rounded-sm bg-[#589333]" />
          </div>

          {/* Breakdown table */}
          <div className="space-y-2 pt-1 text-xs">
            {currentDimension.breakdown.map((item) => (
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

        {/* ── CARD 2: Speaker Impact Index (Interactive Timeframe Dropdown) ──── */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                Speaker Impact
              </h4>
              <p className="text-[11px] text-muted-foreground">Confidence &amp; benchmark</p>
            </div>

            {/* Interactive Timeframe Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsImpactDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-muted/40 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                aria-label="Select timeframe"
              >
                <span>{currentImpact.label}</span>
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
                    {Object.entries(IMPACT_TIMEFRAMES).map(([key, data]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setImpactTimeframe(key)
                          setIsImpactDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                          impactTimeframe === key
                            ? "bg-muted text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span className="font-mono">{data.label}</span>
                        {impactTimeframe === key && (
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Big number + trend */}
          <div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {currentImpact.pct}%
            </span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {currentImpact.trend}
            </p>
          </div>

          {/* The Exact 180° Semicircular Half-Donut Arch Meter */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            <svg width="190" height="105" viewBox="0 0 200 110" className="overflow-visible">
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
                d={calculateArchPath(currentImpact.pct)}
                fill="none"
                stroke="#72A847"
                strokeWidth="16"
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Centered Arch Value & Label */}
            <div className="absolute bottom-2 text-center">
              <span className="text-lg font-bold font-mono text-foreground">
                {currentImpact.pct}%
              </span>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                {currentImpact.rank}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            {currentImpact.summary}
          </p>
        </div>

        {/* ── CARD 3: Speaker Goal Tracker (Interactive Add Goal Modal) ──────── */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground tracking-tight">Speaking Goals</h4>
            <button
              type="button"
              onClick={() => setIsAddGoalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="h-3 w-3" />
              <span>Add goal</span>
            </button>
          </div>

          <div className="space-y-3 pt-1 max-h-[280px] overflow-y-auto pr-0.5">
            {goals.map((goal) => {
              const Icon = goal.icon
              return (
                <div key={goal.id} className="space-y-1.5 group/goal">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="font-medium text-foreground text-[11px] truncate">
                        {goal.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="opacity-0 group-hover/goal:opacity-100 hover:text-rose-500 text-muted-foreground transition-opacity"
                        aria-label={`Delete ${goal.title}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Mini Segmented Chiclet Track */}
                  <div className="flex items-center gap-1 w-full">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-xs transition-colors ${
                          i < Math.round((goal.pct / 100) * 8)
                            ? goal.color
                            : "bg-muted dark:bg-muted/70"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Add Goal Dialog Modal ───────────────────────────────────────────── */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Speaking Goal</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Track keynotes, attendee milestones, or evaluation ratings across your active season.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGoal} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-title" className="text-xs">
                Goal Title
              </Label>
              <Input
                id="goal-title"
                placeholder="e.g. Deliver Keynote at PyCon"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="goal-current" className="text-xs">
                  Current
                </Label>
                <Input
                  id="goal-current"
                  type="number"
                  min="0"
                  value={newCurrent}
                  onChange={(e) => setNewCurrent(e.target.value)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal-target" className="text-xs">
                  Target
                </Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal-unit" className="text-xs">
                  Unit
                </Label>
                <Input
                  id="goal-unit"
                  placeholder="talks"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "mic", label: "Keynote", icon: Mic },
                  { id: "users", label: "Audience", icon: Users },
                  { id: "star", label: "Rating", icon: Star },
                  { id: "award", label: "Badge", icon: Award },
                ].map(({ id, label, icon: CatIcon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setNewCategory(id as any)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition-all",
                      newCategory === id
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/70 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <CatIcon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddGoalOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs h-8 bg-[#72A847] hover:bg-[#62923C] text-white">
                Save Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

