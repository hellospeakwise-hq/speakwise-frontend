"use client"

import { useEffect, useState } from "react"
import { feedbackAPI } from "@/lib/api/feedbackApi"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { eventsApi } from "@/lib/api/events"
import { cn } from "@/lib/utils"
import { TrendingUp, MessageSquare, CalendarCheck, Star } from "lucide-react"

interface SpeakerStatsData {
  averageRating: number | null
  totalFeedback: number
  upcomingEvents: number
}

/** Animated counting number for a satisfying load-in */
function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: string
  suffix?: string
  className?: string
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {value}
      {suffix}
    </span>
  )
}

/** Circular arc progress — speaker-grade, no generic pie charts */
function ArcMeter({
  value,
  max,
  size = 72,
  stroke = 6,
  color,
  label,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  color: string
  label: string
}) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const dash = pct * circumference
  const gap = circumference - dash

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={label} role="img">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-muted"
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        stroke={color}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

/** Pill-capsule bar — inspired by the Dribbble segmented bar style */
function SegmentBar({
  value,
  max,
  colorClass,
}: {
  value: number
  max: number
  colorClass: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function SpeakerStats() {
  const [stats, setStats] = useState<SpeakerStatsData>({
    averageRating: null,
    totalFeedback: 0,
    upcomingEvents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const feedbackData = await feedbackAPI.getCurrentSpeakerFeedback()

        let upcomingEventsCount = 0
        try {
          const requests = await speakerRequestApi.getSpeakerIncomingRequests()
          const acceptedRequests = requests.filter((req: any) => req.status === "accepted")
          if (acceptedRequests.length > 0) {
            const eventsResponse = await eventsApi.getEvents()
            const allEvents = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.results || []
            const acceptedEventIds = acceptedRequests.map((req: any) => req.event)
            upcomingEventsCount = allEvents.filter((event: any) => acceptedEventIds.includes(event.id)).length
          }
        } catch {}

        if (feedbackData.length > 0) {
          const avgRating = feedbackData.reduce((sum: number, item: any) => sum + item.overall_rating, 0) / feedbackData.length
          setStats({ averageRating: avgRating, totalFeedback: feedbackData.length, upcomingEvents: upcomingEventsCount })
        } else {
          setStats({ averageRating: null, totalFeedback: 0, upcomingEvents: upcomingEventsCount })
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse space-y-3">
            <div className="h-3 w-20 bg-muted rounded-full" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
            <div className="h-2 w-full bg-muted rounded-full" />
            <div className="h-3 w-24 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  const rating = stats.averageRating ?? 0
  const ratingColor =
    rating >= 8 ? "#10b981" : rating >= 6 ? "#f59e0b" : rating > 0 ? "#f43f5e" : "#6b7280"

  const cards = [
    {
      icon: Star,
      label: "Avg Rating",
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}` : "—",
      unit: stats.averageRating ? "/10" : "",
      sub: stats.averageRating ? "Across all events" : "No ratings yet",
      arc: { value: rating, max: 10, color: ratingColor },
      barColorClass: rating >= 8 ? "bg-emerald-500" : rating >= 6 ? "bg-amber-400" : "bg-rose-400",
      barValue: rating,
      barMax: 10,
      accent: rating >= 8 ? "text-emerald-400" : rating >= 6 ? "text-amber-400" : "text-rose-400",
    },
    {
      icon: MessageSquare,
      label: "Feedback",
      value: stats.totalFeedback.toString(),
      unit: "",
      sub: stats.totalFeedback > 0 ? "From attendees" : "No feedback yet",
      arc: { value: Math.min(stats.totalFeedback, 100), max: 100, color: "#6366f1" },
      barColorClass: "bg-indigo-500",
      barValue: Math.min(stats.totalFeedback, 100),
      barMax: 100,
      accent: "text-indigo-400",
    },
    {
      icon: CalendarCheck,
      label: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      unit: "",
      sub: stats.upcomingEvents > 0 ? "Next 6 months" : "No upcoming events",
      arc: { value: Math.min(stats.upcomingEvents, 10), max: 10, color: "#8b5cf6" },
      barColorClass: "bg-violet-500",
      barValue: Math.min(stats.upcomingEvents, 10),
      barMax: 10,
      accent: "text-violet-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 group hover:border-border/80 transition-colors"
          >
            {/* Arc meter + main number side-by-side on mobile, stacked on sm+ */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium truncate">{card.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-3xl font-bold tracking-tight", card.accent)}>
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-sm text-muted-foreground font-mono">{card.unit}</span>
                  )}
                </div>
              </div>
              {/* Circular arc */}
              <div className="shrink-0">
                <ArcMeter
                  value={card.arc.value}
                  max={card.arc.max}
                  color={card.arc.color}
                  label={card.label}
                  size={64}
                  stroke={5}
                />
              </div>
            </div>

            {/* Progress bar */}
            <SegmentBar
              value={card.barValue}
              max={card.barMax}
              colorClass={card.barColorClass}
            />

            {/* Sub label */}
            <p className="text-xs text-muted-foreground leading-snug">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
