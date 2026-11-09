"use client"

import { Suspense, useEffect, useState, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { MessageSquare, ChevronLeft, ChevronRight, Search, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"
import { FeedbackNavigation } from "@/components/dashboard/speaker/feedback-navigation"
import { SpeakBotDrawer } from "@/components/dashboard/speaker/speakbot-drawer"
import { cn } from "@/lib/utils"

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages]
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
}

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
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return iso
  }
}

function avg(items: Feedback[]): number {
  if (!items.length) return 0
  return items.reduce((s, f) => s + f.overall_rating, 0) / items.length
}

// ─── Calibrated Semantic Rating Helpers (Accents, not floodlights) ─────────────

function scoreDot(v: number): string {
  if (v >= 8) return "bg-emerald-400"
  if (v >= 6) return "bg-amber-400"
  return "bg-rose-400"
}

function scorePill(v: number): string {
  if (v >= 8) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
  if (v >= 6) return "bg-amber-500/10 border-amber-500/20 text-amber-400"
  return "bg-rose-500/10 border-rose-500/20 text-rose-400"
}

function scoreBar(v: number): string {
  if (v >= 8) return "bg-emerald-500/70"
  if (v >= 6) return "bg-amber-500/70"
  return "bg-rose-500/70"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CriteriaBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100
  return (
    <div className="space-y-1 min-w-0">
      <div className="flex justify-between items-baseline text-[11px] gap-1">
        <span className="text-muted-foreground truncate">{label}</span>
        <div className="flex items-center gap-1 font-mono shrink-0">
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", scoreDot(value))} />
          <span className="font-semibold text-foreground">{value}</span>
          <span className="text-muted-foreground text-[10px]">/10</span>
        </div>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", scoreBar(value))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function FeedbackRow({ item }: { item: Feedback }) {
  return (
    <div className="py-3.5 border-b border-border/50 last:border-0 w-full min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-2.5 mb-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.is_anonymous ? (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                Anonymous
              </span>
            ) : item.name ? (
              <span className="text-[11px] font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                {item.name}
              </span>
            ) : (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                Anonymous
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>

        {/* Refined Score Pill */}
        <div className={cn(
          "flex items-baseline gap-1 shrink-0 px-2 py-0.5 rounded-md border text-xs font-mono font-medium",
          scorePill(item.overall_rating)
        )}>
          <span className="text-[10px] opacity-75">Score</span>
          <span className="font-bold">{item.overall_rating}/10</span>
        </div>
      </div>

      {item.comments && (
        <div className="my-2 pl-3 border-l-2 border-primary/50 text-xs sm:text-sm text-foreground/90 leading-relaxed break-words">
          &ldquo;{item.comments}&rdquo;
        </div>
      )}

      {/* Criteria Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-2.5 pt-2.5 border-t border-border/40 w-full min-w-0">
        <CriteriaBar label="Engagement" value={item.engagement} />
        <CriteriaBar label="Clarity" value={item.clarity} />
        <CriteriaBar label="Content" value={item.content_depth} />
        <CriteriaBar label="Knowledge" value={item.speaker_knowledge} />
        <div className="col-span-2 sm:col-span-1 min-w-0">
          <CriteriaBar label="Practical" value={item.practical_relevance} />
        </div>
      </div>
    </div>
  )
}

function ExperienceListItem({
  group,
  isSelected,
  onSelect,
}: {
  group: ExperienceGroup
  isSelected: boolean
  onSelect: () => void
}) {
  const avgScore = group.averageRating.toFixed(1)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3.5 rounded-xl border transition-all",
        isSelected
          ? "border-foreground/30 bg-muted/80 shadow-xs"
          : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2">
            {group.topic}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {group.eventName}{group.eventDate ? ` · ${group.eventDate}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", scoreDot(group.averageRating))} />
            <span className="text-sm font-bold font-mono text-foreground">
              {avgScore}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {group.feedbackCount} {group.feedbackCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Inner Page Content ───────────────────────────────────────────────────────

function FeedbackByTalksContent() {
  const searchParams = useSearchParams()
  const talkParam = searchParams.get("talk") || searchParams.get("event") || searchParams.get("search") || searchParams.get("slug")

  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [experiences, setExperiences] = useState<SpeakerExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const detailPanelRef = useRef<HTMLDivElement>(null)
  const lastParamRef = useRef<string | null>(null)

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    Promise.all([
      feedbackAPI.getCurrentSpeakerFeedback().catch((err) => {
        console.error("Error fetching feedback:", err)
        return [] as Feedback[]
      }),
      experiencesApi.getMyExperiences().catch((err) => {
        console.error("Error fetching experiences:", err)
        return [] as SpeakerExperience[]
      }),
    ])
      .then(([feedbackData, experiencesData]) => {
        setFeedback(feedbackData)
        setExperiences(experiencesData)
      })
      .finally(() => setLoading(false))
  }, [])

  // Group feedback by presentation slug, including all user experiences
  const groups = useMemo<ExperienceGroup[]>(() => {
    const map = new Map<string, ExperienceGroup>()

    // 1. Populate from registered speaker experiences so talks without feedback yet are still selectable
    experiences.forEach((exp) => {
      const slug = exp.feedback_slug || exp.id || `exp-${exp.event_name}`
      map.set(slug, {
        feedbackSlug: slug,
        topic: exp.topic || "Untitled Presentation",
        eventName: exp.event_name || "Speaking Event",
        eventDate: exp.event_date || "",
        feedbackCount: 0,
        averageRating: 0,
        items: [],
      })
    })

    // 2. Populate and merge actual feedback submissions
    feedback.forEach((f) => {
      let slug = f.experience?.feedback_slug
      // If no direct slug match, merge into matching experience by event name or topic
      if (!slug || !map.has(slug)) {
        const found = Array.from(map.values()).find(
          (g) =>
            (f.experience?.event_name &&
              g.eventName.toLowerCase().trim() === f.experience.event_name.toLowerCase().trim()) ||
            (f.experience?.topic &&
              g.topic.toLowerCase().trim() === f.experience.topic.toLowerCase().trim())
        )
        if (found) {
          slug = found.feedbackSlug
        } else {
          slug = slug || f.experience?.event_name || "talk"
        }
      }

      if (!map.has(slug)) {
        map.set(slug, {
          feedbackSlug: slug,
          topic: f.experience?.topic ?? "Unknown presentation",
          eventName: f.experience?.event_name ?? "Unknown event",
          eventDate: f.experience?.event_date ?? "",
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
  }, [feedback, experiences])

  // Automatically select presentation: on URL param change or initial load only
  useEffect(() => {
    if (groups.length === 0) return

    // Only process URL parameter if it's different from the last processed param
    if (talkParam && talkParam !== lastParamRef.current) {
      lastParamRef.current = talkParam
      const q = talkParam.toLowerCase().trim()
      const match = groups.find((g) => {
        const topicLower = g.topic.toLowerCase()
        const eventLower = g.eventName.toLowerCase()
        const slugLower = g.feedbackSlug.toLowerCase()
        return (
          slugLower === q ||
          slugLower.includes(q) ||
          q.includes(slugLower) ||
          topicLower.includes(q) ||
          eventLower.includes(q) ||
          q.includes(topicLower) ||
          q.includes(eventLower)
        )
      })

      if (match) {
        setSelectedSlug(match.feedbackSlug)
        if (detailPanelRef.current && window.innerWidth < 1024) {
          setTimeout(() => {
            detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 150)
        }
        return
      }
    }

    // Default to the first presentation on initial load if none selected yet
    if (!selectedSlug) {
      setSelectedSlug(groups[0].feedbackSlug)
    } else if (!groups.some((g) => g.feedbackSlug === selectedSlug)) {
      // Fallback only if the currently selected slug no longer exists in groups
      setSelectedSlug(groups[0].feedbackSlug)
    }
  }, [groups, talkParam, selectedSlug])

  const handleSelectTalk = (slug: string) => {
    setSelectedSlug(slug)
    lastParamRef.current = slug
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("slug", slug)
      window.history.replaceState({}, "", url.toString())
    } catch {}
    if (detailPanelRef.current && window.innerWidth < 1024) {
      const top = detailPanelRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups
    const q = searchQuery.toLowerCase().trim()
    return groups.filter(
      (g) =>
        g.topic.toLowerCase().includes(q) ||
        g.eventName.toLowerCase().includes(q) ||
        g.eventDate.toLowerCase().includes(q) ||
        g.feedbackSlug.toLowerCase().includes(q)
    )
  }, [groups, searchQuery])

  // When searching, automatically select the first matching presentation if the current one is filtered out
  useEffect(() => {
    if (searchQuery.trim() && filteredGroups.length > 0) {
      const isCurrentInFiltered = filteredGroups.some((g) => g.feedbackSlug === selectedSlug)
      if (!isCurrentInFiltered) {
        setSelectedSlug(filteredGroups[0].feedbackSlug)
      }
    }
  }, [searchQuery, filteredGroups, selectedSlug])

  // Reset page when selected presentation changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSlug])

  // Always compute effective selected slug so dropdown and panel never show blank
  const currentSlug =
    selectedSlug && groups.some((g) => g.feedbackSlug === selectedSlug)
      ? selectedSlug
      : groups[0]?.feedbackSlug ?? null

  const selectedGroup = groups.find((g) => g.feedbackSlug === currentSlug) ?? null

  const totalFeedback = feedback.length
  const overallAvg =
    totalFeedback > 0
      ? (feedback.reduce((s, f) => s + f.overall_rating, 0) / totalFeedback).toFixed(1)
      : "—"

  const totalGroupItems = selectedGroup?.items.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalGroupItems / ITEMS_PER_PAGE))

  const paginatedItems = useMemo(() => {
    if (!selectedGroup) return []
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return selectedGroup.items.slice(start, start + ITEMS_PER_PAGE)
  }, [selectedGroup, currentPage])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (detailPanelRef.current) {
      const top = detailPanelRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Loading presentation feedback…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 sm:pb-16 space-y-5 sm:space-y-6 min-w-0 overflow-x-hidden">
      <FeedbackNavigation />

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Feedback by Presentation
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Breakdown of attendee sentiment and scores grouped by each talk delivered
        </p>
      </div>

      {/* Metric Cards (Clean, calm 3-col strip) */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 w-full min-w-0">
        <div className="rounded-xl border border-border/70 bg-card p-4 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Tracked Presentations
          </p>
          <div className="mt-1.5 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            {groups.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">With attendee reviews</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Total Responses
          </p>
          <div className="mt-1.5 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            {totalFeedback}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Submitted all time</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Overall Average
          </p>
          <div className="mt-1.5 flex items-baseline gap-1 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            <span>{overallAvg}</span>
            {totalFeedback > 0 && <span className="text-xs font-normal text-muted-foreground font-mono">/ 10</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
            {totalFeedback > 0 && (
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", scoreDot(Number(overallAvg)))} />
            )}
            <span>Across all speaking engagements</span>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <MessageSquare className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">No feedback yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Share your presentation QR code with attendees to collect audience reviews.
          </p>
          <Link href="/dashboard/speaker/experiences">
            <Button variant="outline" size="sm">
              Go to My Presentations
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:gap-6 lg:grid-cols-[320px_1fr] w-full max-w-full min-w-0">
          {/* Mobile Presentation Selector with Search */}
          <div className="lg:hidden space-y-2 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-semibold text-foreground block">
                Select Presentation
              </label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {filteredGroups.length} of {groups.length}
              </span>
            </div>

            {/* Mobile Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search talks or events (e.g. PyCon, DevFest)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchQuery("")
                }}
                className="h-9 pl-9 pr-8 text-xs bg-card border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <Select
              value={currentSlug ?? undefined}
              onValueChange={handleSelectTalk}
            >
              <SelectTrigger className="w-full max-w-full h-auto py-2.5 px-3 bg-card border-border/70 text-left overflow-hidden">
                {selectedGroup ? (
                  <div className="flex items-center justify-between min-w-0 flex-1 pr-2 gap-2 text-left overflow-hidden">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-xs sm:text-sm font-semibold truncate text-foreground leading-tight">
                        {selectedGroup.topic}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {selectedGroup.eventName}
                        {selectedGroup.eventDate ? ` · ${selectedGroup.eventDate}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", scoreDot(selectedGroup.averageRating))} />
                      <span className="text-xs font-mono font-bold text-foreground">
                        {selectedGroup.averageRating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({selectedGroup.feedbackCount})
                      </span>
                    </div>
                  </div>
                ) : (
                  <SelectValue placeholder="Choose a presentation..." />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[320px] max-w-[calc(100vw-2rem)]">
                {filteredGroups.map((group) => (
                  <SelectItem
                    key={group.feedbackSlug}
                    value={group.feedbackSlug}
                    className="py-2.5 cursor-pointer max-w-full overflow-hidden"
                  >
                    <div className="flex flex-col gap-0.5 pr-2 max-w-full overflow-hidden">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[200px]">
                          {group.topic}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-mono font-bold shrink-0">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", scoreDot(group.averageRating))} />
                          {group.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[180px]">{group.eventName}</span>
                        <span className="font-mono shrink-0">
                          {group.feedbackCount} {group.feedbackCount === 1 ? "review" : "reviews"}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Presentations Sidebar (Scrollable & Searchable) */}
          <div className="hidden lg:block space-y-2.5 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-foreground">
                Select Presentation
              </p>
              <span className="text-[11px] font-mono text-muted-foreground">
                {filteredGroups.length} of {groups.length}
              </span>
            </div>

            {/* Desktop Search Filter — Always visible */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search talks or events (e.g. PyCon, DevFest)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchQuery("")
                }}
                className="h-9 pl-9 pr-8 text-xs bg-card border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg w-full placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredGroups.map((group) => (
                <ExperienceListItem
                  key={group.feedbackSlug}
                  group={group}
                  isSelected={currentSlug === group.feedbackSlug}
                  onSelect={() => handleSelectTalk(group.feedbackSlug)}
                />
              ))}
              {filteredGroups.length === 0 && (
                <div className="text-center py-8 px-3 border border-dashed border-border/70 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-foreground">No talks matching &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-muted-foreground">Try searching for a different keyword or event</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="h-7 text-xs text-primary"
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Presentation Detail Panel */}
          <div className="w-full max-w-full min-w-0">
            {selectedGroup ? (
              <Card ref={detailPanelRef} className="border-border/70 bg-card overflow-hidden w-full max-w-full min-w-0">
                <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="font-heading text-base sm:text-lg font-semibold text-foreground break-words leading-snug">
                        {selectedGroup.topic}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 break-words">
                        {selectedGroup.eventName}
                        {selectedGroup.eventDate ? ` · ${selectedGroup.eventDate}` : ""}
                      </CardDescription>
                    </div>

                    {/* Semantic Score Pill for Talk Avg */}
                    <div className={cn(
                      "flex items-baseline gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-md border text-xs font-mono font-medium shrink-0",
                      scorePill(selectedGroup.averageRating)
                    )}>
                      <span className="text-[11px] opacity-75">Talk Avg</span>
                      <span className="font-bold">{selectedGroup.averageRating.toFixed(1)}/10</span>
                    </div>
                  </div>

                  {/* Criteria Average Grid — Clean neutral containers with targeted status dots */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 w-full min-w-0">
                    {[
                      {
                        label: "Engagement",
                        value: selectedGroup.items.length > 0
                          ? Number((selectedGroup.items.reduce((s, f) => s + f.engagement, 0) / selectedGroup.items.length).toFixed(1))
                          : Number((selectedGroup.averageRating * 0.96).toFixed(1)),
                      },
                      {
                        label: "Clarity",
                        value: selectedGroup.items.length > 0
                          ? Number((selectedGroup.items.reduce((s, f) => s + f.clarity, 0) / selectedGroup.items.length).toFixed(1))
                          : Number((selectedGroup.averageRating * 1.02).toFixed(1)),
                      },
                      {
                        label: "Content",
                        value: selectedGroup.items.length > 0
                          ? Number((selectedGroup.items.reduce((s, f) => s + f.content_depth, 0) / selectedGroup.items.length).toFixed(1))
                          : Number((selectedGroup.averageRating * 0.98).toFixed(1)),
                      },
                      {
                        label: "Knowledge",
                        value: selectedGroup.items.length > 0
                          ? Number((selectedGroup.items.reduce((s, f) => s + f.speaker_knowledge, 0) / selectedGroup.items.length).toFixed(1))
                          : Number((selectedGroup.averageRating * 1.01).toFixed(1)),
                      },
                      {
                        label: "Practical",
                        value: selectedGroup.items.length > 0
                          ? Number((selectedGroup.items.reduce((s, f) => s + f.practical_relevance, 0) / selectedGroup.items.length).toFixed(1))
                          : Number((selectedGroup.averageRating * 0.95).toFixed(1)),
                      },
                    ].map(({ label, value }, idx) => (
                      <div
                        key={label}
                        className={cn(
                          "rounded-lg border border-border/60 bg-muted/20 p-2 sm:p-2.5 text-center min-w-0",
                          idx === 4 ? "col-span-2 sm:col-span-1" : ""
                        )}
                      >
                        <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground truncate">
                          {label}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 mt-1 font-mono">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", scoreDot(value))} />
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {value.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-4 w-full max-w-full min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {selectedGroup.feedbackCount} {selectedGroup.feedbackCount === 1 ? "Review" : "Reviews"} Received
                    </p>
                  </div>

                  {selectedGroup.feedbackCount === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm font-medium text-foreground">No attendee reviews recorded for this presentation yet</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Share your slide QR code or presentation URL at your session to capture real-time audience ratings.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <Link href="/dashboard/speaker/experiences">
                          <Button variant="outline" size="sm" className="text-xs">
                            View QR Code & Links
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {paginatedItems.map((item) => (
                        <FeedbackRow key={item.id} item={item} />
                      ))}
                    </div>
                  )}

                  {/* ── Pagination Bar ───────────────────────────────────────── */}
                  {totalGroupItems > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-3 border-t border-border/50 w-full min-w-0">
                      <p className="text-xs text-muted-foreground font-mono text-center sm:text-left">
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>
                        –
                        <span className="font-semibold text-foreground">
                          {Math.min(currentPage * ITEMS_PER_PAGE, totalGroupItems)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-foreground">{totalGroupItems}</span>{" "}
                        {totalGroupItems === 1 ? "review" : "reviews"}
                      </p>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1 self-center sm:self-auto flex-wrap justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <ChevronLeft className="h-3 w-3 mr-1" />
                            Previous
                          </Button>

                          <div className="flex items-center gap-1 px-1">
                            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                              item === "ellipsis" ? (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="h-7 w-7 flex items-center justify-center text-xs text-muted-foreground"
                                >
                                  …
                                </span>
                              ) : (
                                <Button
                                  key={item}
                                  variant={item === currentPage ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => handlePageChange(item)}
                                  className={cn(
                                    "h-7 w-7 p-0 text-xs font-mono",
                                    item === currentPage
                                      ? "font-bold shadow-xs pointer-events-none"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  {item}
                                </Button>
                              )
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            Next
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center text-center border border-dashed border-border rounded-xl text-muted-foreground">
                <p className="text-xs">Select a presentation on the left to view feedback details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating SpeakBot Coach */}
      <SpeakBotDrawer
        experienceId={selectedGroup?.feedbackSlug}
        experienceTopic={selectedGroup?.topic}
        triggerButton={true}
      />
    </div>
  )
}

export default function SpeakerFeedbackByPresentationsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading presentation feedback…</p>
          </div>
        </div>
      }
    >
      <FeedbackByTalksContent />
    </Suspense>
  )
}
