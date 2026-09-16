"use client"

import { useEffect, useState } from "react"
import { Star, MessageSquare, TrendingUp, Filter, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"
import { FeedbackNavigation } from "@/components/dashboard/speaker/feedback-navigation"

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'Unknown date'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return 'Unknown date'
  }
}

function ratingBadges(f: Feedback): string[] {
  const out: string[] = []
  if (f.engagement >= 8) out.push("Engagement")
  if (f.clarity >= 8) out.push("Clarity")
  if (f.content_depth >= 8) out.push("Content")
  if (f.speaker_knowledge >= 8) out.push("Knowledge")
  if (f.practical_relevance >= 8) out.push("Practical")
  return out.length > 0 ? out : ["General"]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpeakerFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")   // all | recent | high | low
  const [sortBy, setSortBy] = useState("date")  // date | rating

  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then(setFeedback)
      .catch((err) => console.error('Error fetching feedback:', err))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((s, f) => s + f.overall_rating, 0) / feedback.length).toFixed(1)
      : "—"

  const recentCount = feedback.filter((f) => {
    const ms = new Date().getTime() - new Date(f.created_at).getTime()
    return ms < 1000 * 60 * 60 * 24 * 30 // last 30 days
  }).length

  // ── Filtering & sorting ────────────────────────────────────────────────────

  const filtered = feedback
    .filter((f) => {
      if (filter === "recent") {
        const ms = new Date().getTime() - new Date(f.created_at).getTime()
        return ms < 1000 * 60 * 60 * 24 * 30
      }
      if (filter === "high") return f.overall_rating >= 8
      if (filter === "low") return f.overall_rating < 6
      return true
    })
    .sort((a, b) =>
      sortBy === "rating"
        ? b.overall_rating - a.overall_rating
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading feedback…</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <FeedbackNavigation />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/speaker">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">All Feedback</h1>
          <p className="text-muted-foreground">Review all feedback from your speaking engagements</p>
        </div>
        <Link href="/dashboard/speaker/feedback-by-talks">
          <Button variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20">
            View by Presentation
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Overall</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}{feedback.length > 0 && '/10'}</div>
            <p className="text-xs text-muted-foreground">Across all presentations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Feedback</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCount}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Ratings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter((f) => f.overall_rating >= 8).length}
            </div>
            <p className="text-xs text-muted-foreground">8+ overall rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feedback History</CardTitle>
              <CardDescription>Filter and sort your feedback</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feedback</SelectItem>
                  <SelectItem value="recent">Recent (30 days)</SelectItem>
                  <SelectItem value="high">High Ratings (8+)</SelectItem>
                  <SelectItem value="low">Needs Improvement (&lt;6)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      {/* Presentation context */}
                      {item.experience && (
                        <p className="text-sm font-semibold truncate">{item.experience.topic}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {item.experience && (
                          <span className="text-xs text-muted-foreground">
                            {item.experience.event_name} · {item.experience.event_date}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Submitted {formatDate(item.created_at)}
                        </span>
                        {item.is_anonymous ? (
                          <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                        ) : item.name ? (
                          <Badge variant="outline" className="text-xs">{item.name}</Badge>
                        ) : null}
                      </div>
                    </div>

                    {/* Overall rating */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{item.overall_rating}/10</span>
                    </div>
                  </div>

                  {/* Per-criterion grid */}
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                      { label: 'Engagement', value: item.engagement },
                      { label: 'Clarity', value: item.clarity },
                      { label: 'Content', value: item.content_depth },
                      { label: 'Knowledge', value: item.speaker_knowledge },
                      { label: 'Practical', value: item.practical_relevance },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="text-sm font-semibold">{value}/10</p>
                      </div>
                    ))}
                  </div>

                  {/* Comment */}
                  {item.comments && (
                    <p className="text-sm text-muted-foreground mb-3 italic">"{item.comments}"</p>
                  )}

                  {/* High-score badges */}
                  <div className="flex flex-wrap gap-2">
                    {ratingBadges(item).map((badge) => (
                      <Badge
                        key={badge}
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filter === "all"
                    ? "You haven't received any feedback yet."
                    : "No feedback matches your current filter."}
                </p>
                {filter !== "all" && (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
