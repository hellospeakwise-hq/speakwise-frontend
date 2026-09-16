"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Star, MessageSquare, Calendar, TrendingUp, ArrowLeft, ChevronDown, ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"
import { FeedbackNavigation } from "@/components/dashboard/speaker/feedback-navigation"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExperienceGroup {
  feedbackSlug: string
  topic: string
  eventName: string
  eventDate: string
  feedbackCount: number
  averageRating: number
  items: Feedback[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function avg(items: Feedback[]): number {
  if (!items.length) return 0
  return items.reduce((s, f) => s + f.overall_rating, 0) / items.length
}

function ratingColor(r: number): string {
  if (r >= 8.5) return "text-green-600 dark:text-green-400"
  if (r >= 7) return "text-lime-600 dark:text-lime-400"
  if (r >= 5) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-500"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CriteriaBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function FeedbackRow({ item }: { item: Feedback }) {
  return (
    <div className="py-4 border-b last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          {item.is_anonymous ? (
            <span className="text-sm text-muted-foreground italic">Anonymous</span>
          ) : item.name ? (
            <span className="text-sm font-medium">{item.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground italic">Anonymous</span>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(item.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
          <span className={`text-sm font-bold ${ratingColor(item.overall_rating)}`}>
            {item.overall_rating}/10
          </span>
        </div>
      </div>

      {item.comments && (
        <p className="text-sm text-muted-foreground italic mb-3">"{item.comments}"</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <CriteriaBar label="Engagement" value={item.engagement} />
        <CriteriaBar label="Clarity" value={item.clarity} />
        <CriteriaBar label="Content" value={item.content_depth} />
        <CriteriaBar label="Knowledge" value={item.speaker_knowledge} />
        <CriteriaBar label="Practical" value={item.practical_relevance} />
      </div>
    </div>
  )
}

function ExperienceCard({
  group,
  isSelected,
  onSelect,
}: {
  group: ExperienceGroup
  isSelected: boolean
  onSelect: () => void
}) {
  const avgScore = group.averageRating
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected ? "border-orange-500 ring-1 ring-orange-500/30" : "hover:border-orange-300 dark:hover:border-orange-700"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm leading-snug">{group.topic}</CardTitle>
            <CardDescription className="text-xs mt-1 truncate">
              {group.eventName} · {group.eventDate}
            </CardDescription>
          </div>
          <div className={`text-xl font-bold flex-shrink-0 ${ratingColor(avgScore)}`}>
            {avgScore.toFixed(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {group.feedbackCount} {group.feedbackCount === 1 ? "response" : "responses"}
          </span>
          {isSelected ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpeakerFeedbackByPresentationsPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then(setFeedback)
      .catch((err) => console.error('Error fetching feedback:', err))
      .finally(() => setLoading(false))
  }, [])

  // Group feedback by experience slug
  const groups = useMemo<ExperienceGroup[]>(() => {
    const map = new Map<string, ExperienceGroup>()

    feedback.forEach((f) => {
      const slug = f.experience?.feedback_slug ?? '__unknown__'
      if (!map.has(slug)) {
        map.set(slug, {
          feedbackSlug: slug,
          topic: f.experience?.topic ?? 'Unknown presentation',
          eventName: f.experience?.event_name ?? 'Unknown event',
          eventDate: f.experience?.event_date ?? '',
          feedbackCount: 0,
          averageRating: 0,
          items: [],
        })
      }
      const g = map.get(slug)!
      g.items.push(f)
      g.feedbackCount = g.items.length
      g.averageRating = avg(g.items)
    })

    return Array.from(map.values()).sort((a, b) => b.averageRating - a.averageRating)
  }, [feedback])

  const selectedGroup = groups.find((g) => g.feedbackSlug === selectedSlug) ?? null

  // Overall aggregate stats across all presentations
  const totalFeedback = feedback.length
  const overallAvg = totalFeedback > 0
    ? (feedback.reduce((s, f) => s + f.overall_rating, 0) / totalFeedback).toFixed(1)
    : "—"

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
          <h1 className="text-3xl font-bold">Feedback by Presentation</h1>
          <p className="text-muted-foreground">
            Grouped by each talk you've delivered
          </p>
        </div>
        <Link href="/dashboard/speaker/feedback">
          <Button variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20">
            View All Feedback
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">With feedback received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAvg}{totalFeedback > 0 && '/10'}</div>
            <p className="text-xs text-muted-foreground">Across all presentations</p>
          </CardContent>
        </Card>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Share your presentation QR code with your audience to start collecting feedback.
          </p>
          <Link href="/dashboard/speaker/experiences" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              Go to My Presentations
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Presentation list */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Presentations
            </p>
            {groups.map((group) => (
              <ExperienceCard
                key={group.feedbackSlug}
                group={group}
                isSelected={selectedSlug === group.feedbackSlug}
                onSelect={() =>
                  setSelectedSlug(
                    selectedSlug === group.feedbackSlug ? null : group.feedbackSlug
                  )
                }
              />
            ))}
          </div>

          {/* Detail panel */}
          <div>
            {selectedGroup ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedGroup.topic}</CardTitle>
                  <CardDescription>
                    {selectedGroup.eventName} · {selectedGroup.eventDate}
                  </CardDescription>

                  {/* Aggregate criteria averages */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                    {[
                      {
                        label: 'Engagement',
                        value: (selectedGroup.items.reduce((s, f) => s + f.engagement, 0) / selectedGroup.items.length).toFixed(1),
                      },
                      {
                        label: 'Clarity',
                        value: (selectedGroup.items.reduce((s, f) => s + f.clarity, 0) / selectedGroup.items.length).toFixed(1),
                      },
                      {
                        label: 'Content',
                        value: (selectedGroup.items.reduce((s, f) => s + f.content_depth, 0) / selectedGroup.items.length).toFixed(1),
                      },
                      {
                        label: 'Knowledge',
                        value: (selectedGroup.items.reduce((s, f) => s + f.speaker_knowledge, 0) / selectedGroup.items.length).toFixed(1),
                      },
                      {
                        label: 'Practical',
                        value: (selectedGroup.items.reduce((s, f) => s + f.practical_relevance, 0) / selectedGroup.items.length).toFixed(1),
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-3 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="text-lg font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">/10</p>
                      </div>
                    ))}
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {selectedGroup.feedbackCount} {selectedGroup.feedbackCount === 1 ? 'Response' : 'Responses'}
                  </p>
                  <div>
                    {selectedGroup.items.map((item) => (
                      <FeedbackRow key={item.id} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
                <div>
                  <Star className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Select a presentation to view its feedback</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}