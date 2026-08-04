"use client"

import { useEffect, useState } from "react"
import { feedbackAPI } from "@/lib/api/feedbackApi"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { eventsApi } from "@/lib/api/events"

interface SpeakerStatsData {
  averageRating: number | null
  totalFeedback: number
  upcomingEvents: number
  speakerRank: number | null
}

export function SpeakerStats() {
  const [stats, setStats] = useState<SpeakerStatsData>({
    averageRating: null,
    totalFeedback: 0,
    upcomingEvents: 0,
    speakerRank: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const feedbackData = await feedbackAPI.getCurrentSpeakerFeedback()

        let upcomingEventsCount = 0
        try {
          const requests = await speakerRequestApi.getSpeakerIncomingRequests()
          const acceptedRequests = requests.filter((req: any) => req.status === 'accepted')
          if (acceptedRequests.length > 0) {
            const eventsResponse = await eventsApi.getEvents()
            const allEvents = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.results || []
            const acceptedEventIds = acceptedRequests.map((req: any) => req.event)
            upcomingEventsCount = allEvents.filter((event: any) => acceptedEventIds.includes(event.id)).length
          }
        } catch {}

        if (feedbackData.length > 0) {
          const avgRating = feedbackData.reduce((sum: number, item: any) => sum + item.overall_rating, 0) / feedbackData.length
          setStats({ averageRating: avgRating, totalFeedback: feedbackData.length, upcomingEvents: upcomingEventsCount, speakerRank: null })
        } else {
          setStats({ averageRating: null, totalFeedback: 0, upcomingEvents: upcomingEventsCount, speakerRank: null })
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
      <div className="border border-border rounded-lg bg-card grid grid-cols-2 md:grid-cols-4 divide-x divide-border animate-pulse">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="px-5 py-4 space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-7 w-12 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  const items = [
    { label: "Avg Rating",      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}/10` : "—", sub: stats.averageRating ? "Across all events" : "No ratings yet" },
    { label: "Feedback",        value: stats.totalFeedback.toString(),                                       sub: stats.totalFeedback > 0 ? "From attendees" : "No feedback yet" },
    { label: "Upcoming Events", value: stats.upcomingEvents.toString(),                                      sub: stats.upcomingEvents > 0 ? "Next 6 months" : "No upcoming events" },
    { label: "Speaker Rank",    value: stats.speakerRank ? `#${stats.speakerRank}` : "—",                  sub: stats.speakerRank ? "In your category" : "Not ranked yet" },
  ]

  return (
    <div className="border border-border rounded-lg bg-card grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
      {items.map((item) => (
        <div key={item.label} className="px-5 py-4 flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{item.value}</span>
          <span className="text-xs text-muted-foreground/70">{item.sub}</span>
        </div>
      ))}
    </div>
  )
}
