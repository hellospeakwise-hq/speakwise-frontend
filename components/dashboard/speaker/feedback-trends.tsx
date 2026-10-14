"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  { value: "response", label: "Each response" },
]
const METRIC_FIELD: Record<Metric, (item: Feedback) => number> = {
  overall: (item) => item.overall_rating,
  content: (item) => item.content_depth,
  clarity: (item) => item.clarity,
  engagement: (item) => item.engagement,
}
const Y_TICKS = [10, 8, 6, 4, 2, 0]

const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

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

// Coarsest granularity that still gives a line (2+ points)
function pickDefaultGranularity(feedback: Feedback[]): Granularity {
  for (const granularity of ["month", "day"] as const) {
    if (buildPoints(feedback, "overall", granularity).length >= 2) return granularity
  }
  return "response"
}

const xPercent = (index: number, total: number) => (total === 1 ? 50 : (index / (total - 1)) * 100)
const yPercent = (value: number) => 100 - (Math.max(0, Math.min(MAX_SCORE, value)) / MAX_SCORE) * 100

function SnapshotView({ value, title }: { value: number; title: string }) {
  return (
    <div className="rounded-lg border border-orange-900/20 bg-gradient-to-b from-orange-500/5 to-transparent p-6">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{value.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">/ {MAX_SCORE}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <div className="h-full rounded-full bg-orange-500" style={{ width: `${(value / MAX_SCORE) * 100}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        A trend needs at least two feedback responses. Your {title.toLowerCase()} trend will appear after the next one.
      </p>
    </div>
  )
}

function TrendChart({ points, title }: { points: TrendPoint[]; title: string }) {
  const gradientId = `trend-gradient-${title}`
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xPercent(i, points.length)} ${yPercent(p.value)}`).join(" ")
  const areaPath = `${linePath} L 100 100 L 0 100 Z`
  const labelStep = Math.ceil(points.length / 6)
  const values = points.map((p) => p.value)
  const change = values[values.length - 1] - values[0]

  return (
    <>
      <div className="relative h-[220px]">
        <div className="absolute bottom-7 left-0 top-3 w-8 text-xs text-muted-foreground">
          {Y_TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute right-1 -translate-y-1/2 tabular-nums"
              style={{ top: `${yPercent(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="absolute bottom-7 left-10 right-4 top-3">
          {Y_TICKS.map((tick) => (
            <div key={tick} className="absolute left-0 right-0 h-px bg-border/60" style={{ top: `${yPercent(tick)}%` }} />
          ))}

          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke="rgb(249, 115, 22)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {points.map((point, index) => (
            <div
              key={`${point.label}-${index}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xPercent(index, points.length)}%`, top: `${yPercent(point.value)}%` }}
            >
              <div className="h-2.5 w-2.5 rounded-full border-2 border-orange-500 bg-background" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                <div className="font-semibold">{point.value.toFixed(1)} / {MAX_SCORE}</div>
                <div className="text-muted-foreground">
                  {point.detail}
                  {point.count > 1 ? ` · ${point.count} responses` : ""}
                </div>
              </div>
            </div>
          ))}

          {points.map((point, index) =>
            index % labelStep === 0 || index === points.length - 1 ? (
              <div
                key={`label-${point.label}-${index}`}
                className="absolute top-full mt-2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground"
                style={{ left: `${xPercent(index, points.length)}%` }}
              >
                {point.label}
              </div>
            ) : null
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Stat label="Current" value={values[values.length - 1].toFixed(1)} className="text-orange-600 dark:text-orange-400" />
        <Stat
          label="Improvement"
          value={`${change >= 0 ? "+" : ""}${change.toFixed(1)}`}
          className={change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
        />
        <Stat label="Average" value={average(values).toFixed(1)} />
        <Stat label="Lowest" value={Math.min(...values).toFixed(1)} />
        <Stat label="Highest" value={Math.max(...values).toFixed(1)} />
      </div>
    </>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="text-center">
      <div className={cn("text-2xl font-bold", className)}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export function FeedbackTrends() {
  const [period, setPeriod] = useState<Period>("6months")
  const [granularity, setGranularity] = useState<Granularity>("month")
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then((data) => {
        setFeedback(data)
        setGranularity(pickDefaultGranularity(inPeriod(data, "6months")))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const periodFeedback = useMemo(() => inPeriod(feedback, period), [feedback, period])

  const renderChart = (metric: Metric, title: string) => {
    const points = buildPoints(periodFeedback, metric, granularity)
    if (points.length === 0) {
      return (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-muted-foreground">No feedback in this period</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>{loading ? "Loading..." : "Track your performance over time"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            {loading ? (
              <div className="animate-pulse text-muted-foreground">Loading trend data...</div>
            ) : (
              <p className="text-muted-foreground">
                {error
                  ? "Couldn't load your feedback trends. Please try again later."
                  : "No feedback data available yet. Start speaking at events to see your trends!"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="inline-flex rounded-lg border bg-muted/30 p-0.5" role="group" aria-label="Trend granularity">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={granularity === option.value}
              onClick={() => setGranularity(option.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                granularity === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Tabs defaultValue="overall">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="pt-4">
            {renderChart("overall", "Overall")}
          </TabsContent>
          <TabsContent value="content" className="pt-4">
            {renderChart("content", "Content")}
          </TabsContent>
          <TabsContent value="delivery" className="pt-4">
            {renderChart("clarity", "Clarity")}
          </TabsContent>
          <TabsContent value="engagement" className="pt-4">
            {renderChart("engagement", "Engagement")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
