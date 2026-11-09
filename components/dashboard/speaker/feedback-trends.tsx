"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"
import { cn } from "@/lib/utils"

type Period = "3months" | "6months" | "1year"
type Granularity = "month" | "day" | "response"
type Metric = "overall" | "content" | "clarity" | "engagement"

interface TrendPoint {
  label: string
  detail: string
  value: number
  count: number
}

const MAX_SCORE = 10
const PERIOD_MONTHS: Record<Period, number> = { "3months": 3, "6months": 6, "1year": 12 }
const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "month", label: "Monthly" },
  { value: "day", label: "Daily" },
  { value: "response", label: "Per talk" },
]
const METRIC_FIELD: Record<Metric, (item: Feedback) => number> = {
  overall: (item) => item.overall_rating,
  content: (item) => item.content_depth,
  clarity: (item) => item.clarity,
  engagement: (item) => item.engagement,
}
const Y_TICKS = [10, 8, 6, 4, 2, 0]

const average = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0)

const feedbackDate = (item: Feedback) => {
  const date = item.created_at ? new Date(item.created_at) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function inPeriod(feedback: Feedback[], period: Period): Feedback[] {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - PERIOD_MONTHS[period])
  return feedback.filter((item) => feedbackDate(item) >= cutoff)
}

function buildPoints(feedback: Feedback[], metric: Metric, granularity: Granularity): TrendPoint[] {
  const pick = METRIC_FIELD[metric]
  const sorted = [...feedback].sort((a, b) => feedbackDate(a).getTime() - feedbackDate(b).getTime())

  if (granularity === "response") {
    return sorted.map((item, index) => ({
      label: `#${index + 1}`,
      detail: feedbackDate(item).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      value: pick(item),
      count: 1,
    }))
  }

  const groups = new Map<string, { date: Date; items: Feedback[] }>()
  sorted.forEach((item) => {
    const date = feedbackDate(item)
    const key =
      granularity === "month"
        ? `${date.getFullYear()}-${date.getMonth()}`
        : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    const group = groups.get(key) ?? { date, items: [] }
    group.items.push(item)
    groups.set(key, group)
  })

  const spansYears = new Set([...groups.values()].map((g) => g.date.getFullYear())).size > 1
  return [...groups.values()].map(({ date, items }) => ({
    label:
      granularity === "month"
        ? date.toLocaleDateString("en-US", spansYears ? { month: "short", year: "2-digit" } : { month: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    detail: date.toLocaleDateString(
      "en-US",
      granularity === "month" ? { month: "long", year: "numeric" } : { month: "short", day: "numeric", year: "numeric" }
    ),
    value: average(items.map(pick)),
    count: items.length,
  }))
}

function pickDefaultGranularity(feedback: Feedback[]): Granularity {
  for (const granularity of ["month", "day"] as const) {
    if (buildPoints(feedback, "overall", granularity).length >= 2) return granularity
  }
  return "response"
}

const xPercent = (index: number, total: number) => (total === 1 ? 50 : (index / (total - 1)) * 100)
const yPercent = (value: number) => 100 - (Math.max(0, Math.min(MAX_SCORE, value)) / MAX_SCORE) * 100

function SnapshotView({ value, title }: { value: number; title: string }) {
  const isHigh = value >= 8
  const isMed = value >= 6 && value < 8
  const scoreCol = isHigh ? "text-emerald-400" : isMed ? "text-amber-400" : "text-rose-400"
  const barCol = isHigh ? "bg-emerald-500" : isMed ? "bg-amber-500" : "bg-rose-500"

  return (
    <div className="py-6 space-y-3">
      <div className="flex items-baseline gap-2">
        <span className={cn("text-2xl font-bold font-mono", scoreCol)}>{value.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground font-mono">/ {MAX_SCORE}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-300", barCol)} style={{ width: `${(value / MAX_SCORE) * 100}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        Current recorded score for {title}. Longitudinal curves automatically populate as you receive more attendee reviews.
      </p>
    </div>
  )
}

function TrendChart({ points, title }: { points: TrendPoint[]; title: string }) {
  const gradientId = `trend-gradient-${title.toLowerCase().replace(/\s+/g, '-')}`
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xPercent(i, points.length)} ${yPercent(p.value)}`).join(" ")
  const areaPath = `${linePath} L 100 100 L 0 100 Z`
  const labelStep = Math.ceil(points.length / 6)
  const values = points.map((p) => p.value)
  const change = values[values.length - 1] - values[0]
  const avgVal = average(values)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const currentVal = values[values.length - 1]

  return (
    <div className="pt-2">
      <div className="relative h-[205px]">
        {/* Y Axis labels */}
        <div className="absolute bottom-7 left-0 top-3 w-7 text-xs text-muted-foreground">
          {Y_TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute right-1 -translate-y-1/2 tabular-nums font-mono text-[10px]"
              style={{ top: `${yPercent(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        {/* Chart plot */}
        <div className="absolute bottom-7 left-9 right-2 top-3">
          {Y_TICKS.map((tick) => (
            <div key={tick} className="absolute left-0 right-0 h-px bg-border/40" style={{ top: `${yPercent(tick)}%` }} />
          ))}

          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Dynamic Rating Area Gradient: Emerald top (8-10) -> Amber mid (6-7) -> Rose dip (<6) -> Transparent base */}
              <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="35%" stopColor="#34d399" stopOpacity="0.18" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.09" />
                <stop offset="85%" stopColor="#f43f5e" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>

              {/* Dynamic Rating Line Gradient: Changes color as score ascends / descends */}
              <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="30%" stopColor="#10b981" />
                <stop offset="55%" stopColor="#fbbf24" />
                <stop offset="85%" stopColor="#fb7185" />
              </linearGradient>

              {/* Soft line glow filter */}
              <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Shaded Area */}
            <path d={areaPath} fill={`url(#${gradientId}-area)`} />

            {/* Glowing Accent Underlay */}
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${gradientId}-line)`}
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.25"
              filter={`url(#${gradientId}-glow)`}
            />

            {/* Crisp Foreground Trend Stroke */}
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${gradientId}-line)`}
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Colorized Data Points */}
          {points.map((point, index) => {
            const isHigh = point.value >= 8
            const isMed = point.value >= 6 && point.value < 8
            const dotClass = isHigh
              ? "border-emerald-400 bg-background shadow-emerald-500/30"
              : isMed
              ? "border-amber-400 bg-background shadow-amber-500/30"
              : "border-rose-400 bg-background shadow-rose-500/30"

            const textClass = isHigh
              ? "text-emerald-400"
              : isMed
              ? "text-amber-400"
              : "text-rose-400"

            return (
              <div
                key={`${point.label}-${index}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${xPercent(index, points.length)}%`, top: `${yPercent(point.value)}%` }}
              >
                <div className={cn("h-2.5 w-2.5 rounded-full border-2 transition-transform duration-150 group-hover:scale-150 shadow-sm", dotClass)} />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/80 bg-popover px-2.5 py-1.5 text-xs shadow-xl group-hover:block font-mono">
                  <div className={cn("font-bold text-xs flex items-center gap-1", textClass)}>
                    <span>{point.value.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">/ {MAX_SCORE}</span>
                  </div>
                  <div className="text-muted-foreground text-[10px] mt-0.5">
                    {point.detail}
                    {point.count > 1 ? ` · ${point.count} reviews` : ""}
                  </div>
                </div>
              </div>
            )
          })}

          {points.map((point, index) =>
            index % labelStep === 0 || index === points.length - 1 ? (
              <div
                key={`label-${point.label}-${index}`}
                className="absolute top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-muted-foreground"
                style={{ left: `${xPercent(index, points.length)}%` }}
              >
                {point.label}
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Summary stats with semantic rating coloring */}
      <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 divide-x divide-border/40 border-t border-border/50 pt-3 text-center">
        <div className="px-2">
          <div className={cn("text-base font-bold font-mono", currentVal >= 8 ? "text-emerald-400" : currentVal >= 6 ? "text-amber-400" : "text-rose-400")}>
            {currentVal.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Current</div>
        </div>
        <div className="px-2">
          <div className={cn("text-base font-bold font-mono", change >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Change</div>
        </div>
        <div className="px-2">
          <div className={cn("text-base font-bold font-mono", avgVal >= 8 ? "text-emerald-400" : avgVal >= 6 ? "text-amber-400" : "text-rose-400")}>
            {avgVal.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Average</div>
        </div>
        <div className="px-2 hidden sm:block">
          <div className={cn("text-base font-bold font-mono", minVal >= 8 ? "text-emerald-400" : minVal >= 6 ? "text-amber-400" : "text-rose-400")}>
            {minVal.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Lowest</div>
        </div>
        <div className="px-2 hidden sm:block">
          <div className={cn("text-base font-bold font-mono", maxVal >= 8 ? "text-emerald-400" : maxVal >= 6 ? "text-amber-400" : "text-rose-400")}>
            {maxVal.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Highest</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Dimensional Distribution & Flow Breakdown
 * Single unified surface with clean hairline dividers (de-cardified, zero boxes inside boxes)
 */
function DimensionalFlowBreakdown({ feedback }: { feedback: Feedback[] }) {
  if (!feedback.length) return null

  const overallAvg = average(feedback.map((f) => f.overall_rating))

  const dimensions = [
    {
      key: "engagement",
      label: "Engagement",
      score: average(feedback.map((f) => f.engagement)),
      description: "Audience connection and active participation",
    },
    {
      key: "clarity",
      label: "Clarity & Delivery",
      score: average(feedback.map((f) => f.clarity)),
      description: "Speech pacing, articulation, and structural clarity",
    },
    {
      key: "content_depth",
      label: "Content Depth",
      score: average(feedback.map((f) => f.content_depth)),
      description: "Technical substance and practical takeaways",
    },
    {
      key: "speaker_knowledge",
      label: "Speaker Knowledge",
      score: average(feedback.map((f) => f.speaker_knowledge)),
      description: "Subject matter authority and Q&A mastery",
    },
    {
      key: "practical_relevance",
      label: "Practical Relevance",
      score: average(feedback.map((f) => f.practical_relevance)),
      description: "Applicable learnings and actionable value",
    },
  ]

  return (
    <div className="divide-y divide-border/40 pt-1">
      {dimensions.map((dim) => {
        const deltaNum = dim.score - overallAvg
        const deltaStr = deltaNum >= 0 ? `+${deltaNum.toFixed(1)}` : deltaNum.toFixed(1)
        const pct = (dim.score / MAX_SCORE) * 100

        return (
          <div key={dim.key} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-foreground text-xs sm:text-sm truncate">{dim.label}</span>
                <span className="text-[11px] text-muted-foreground hidden md:inline truncate">
                  · {dim.description}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded border font-medium",
                  deltaNum > 0.05
                    ? "text-emerald-400 border-emerald-500/25 bg-emerald-500/10"
                    : deltaNum < -0.05
                    ? "text-amber-400 border-amber-500/25 bg-amber-500/10"
                    : "text-muted-foreground border-border/60 bg-muted/40"
                )}>
                  {deltaNum === 0 ? "on par" : `${deltaStr} vs avg`}
                </span>
                <span className="font-bold text-foreground text-xs sm:text-sm">
                  {dim.score.toFixed(1)}
                  <span className="text-muted-foreground font-normal text-[10px]">/10</span>
                </span>
              </div>
            </div>

            {/* Clean Progress Track */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function FeedbackTrends({ initialFeedback }: { initialFeedback?: Feedback[] }) {
  const [period, setPeriod] = useState<Period>("6months")
  const [granularity, setGranularity] = useState<Granularity>("month")
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback || [])
  const [loading, setLoading] = useState(!initialFeedback)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (initialFeedback) {
      setFeedback(initialFeedback)
      setGranularity(pickDefaultGranularity(inPeriod(initialFeedback, "6months")))
      setLoading(false)
      return
    }

    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then((data) => {
        setFeedback(data)
        setGranularity(pickDefaultGranularity(inPeriod(data, "6months")))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [initialFeedback])

  const periodFeedback = useMemo(() => inPeriod(feedback, period), [feedback, period])

  const renderChart = (metric: Metric, title: string) => {
    const points = buildPoints(periodFeedback, metric, granularity)
    if (points.length === 0) {
      return (
        <div className="flex h-[180px] items-center justify-center">
          <p className="text-xs text-muted-foreground">No feedback recorded in this period</p>
        </div>
      )
    }
    if (points.length < 2) {
      return <SnapshotView value={points[0].value} title={title} />
    }
    return <TrendChart points={points} title={title} />
  }

  if (loading || error || feedback.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <h2 className="font-heading text-sm font-semibold text-foreground">Feedback Trends &amp; Flow</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Loading trend analysis…" : "Track your speaking performance over time"}
          </p>
        </div>
        <div className="flex h-[160px] items-center justify-center text-xs text-muted-foreground">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
              <span>Loading trend data…</span>
            </div>
          ) : (
            <p className="text-center max-w-[240px]">
              {error
                ? "Could not load feedback trends."
                : "No feedback data yet. Collect feedback to see your trends!"}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border/60">
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">Feedback Trends &amp; Flow</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Performance progression and dimension ratings over time
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <SelectTrigger className="w-[140px] h-8 text-xs font-mono shrink-0">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months" className="text-xs font-mono">Last 3 months</SelectItem>
            <SelectItem value="6months" className="text-xs font-mono">Last 6 months</SelectItem>
            <SelectItem value="1year" className="text-xs font-mono">Last 1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="px-5 py-4 space-y-4">
        <Tabs defaultValue="flow">
          {/* Subheader: Tabs & Granularity controls — designed for zero cramming on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-2">
            {/* Horizontally scrollable tabs on small screens */}
            <div className="overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
              <TabsList className="flex items-center gap-1 bg-transparent p-0 h-auto justify-start border-none">
                <TabsTrigger
                  value="flow"
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border border-transparent data-[state=active]:border-border/70 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
                >
                  Dimensions
                </TabsTrigger>
                <TabsTrigger
                  value="overall"
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border border-transparent data-[state=active]:border-border/70 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
                >
                  Overall Trend
                </TabsTrigger>
                <TabsTrigger
                  value="engagement"
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border border-transparent data-[state=active]:border-border/70 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
                >
                  Engagement
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border border-transparent data-[state=active]:border-border/70 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
                >
                  Content
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Granularity switch */}
            <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5 shrink-0 self-start sm:self-auto" role="group">
              {GRANULARITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={granularity === option.value}
                  onClick={() => setGranularity(option.value)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[11px] font-mono transition-colors",
                    granularity === option.value
                      ? "bg-background text-foreground shadow-xs font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <TabsContent value="flow" className="pt-2 focus-visible:outline-none">
            <DimensionalFlowBreakdown feedback={periodFeedback} />
          </TabsContent>

          <TabsContent value="overall" className="pt-2 focus-visible:outline-none">
            {renderChart("overall", "Overall Performance")}
          </TabsContent>

          <TabsContent value="engagement" className="pt-2 focus-visible:outline-none">
            {renderChart("engagement", "Engagement Flow")}
          </TabsContent>

          <TabsContent value="content" className="pt-2 focus-visible:outline-none">
            {renderChart("content", "Content Depth")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
