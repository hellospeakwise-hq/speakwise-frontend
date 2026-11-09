"use client"

import { Suspense, useEffect, useState, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Filter, MessageSquare, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"
import { FeedbackNavigation } from "@/components/dashboard/speaker/feedback-navigation"
import { FeedbackTrends } from "@/components/dashboard/speaker/feedback-trends"
import { SpeakBotDrawer } from "@/components/dashboard/speaker/speakbot-drawer"
import { SpeakBotQuickCard } from "@/components/dashboard/speaker/speakbot-quick-card"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return "Unknown date"
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return "Unknown date"
  }
}

function scoreColor(v: number): string {
  if (v >= 8) return "text-emerald-400"
  if (v >= 6) return "text-amber-400"
  return "text-red-400"
}

function scoreBg(v: number): string {
  if (v >= 8) return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
  if (v >= 6) return "bg-amber-500/10 border-amber-500/25 text-amber-400"
  return "bg-red-500/10 border-red-500/25 text-red-400"
}

// ─── Feedback Row ─────────────────────────────────────────────────────────────

function FeedbackRow({ item }: { item: Feedback }) {
  const score = item.overall_rating
  const dims = [
    { label: "Engagement", value: item.engagement },
    { label: "Clarity", value: item.clarity },
    { label: "Content", value: item.content_depth },
    { label: "Knowledge", value: item.speaker_knowledge },
    { label: "Practical", value: item.practical_relevance },
  ]

  return (
    <div className="py-4 first:pt-1 last:pb-1 space-y-2.5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          {item.experience && (
            <h3 className="text-sm font-semibold text-foreground truncate leading-snug">
              {item.experience.topic}
            </h3>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {item.experience && (
              <span className="text-xs text-muted-foreground">
                {item.experience.event_name}
                {item.experience.event_date ? ` · ${item.experience.event_date}` : ""}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              · {formatDate(item.created_at)}
            </span>
            {item.is_anonymous ? (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                Anonymous
              </span>
            ) : item.name ? (
              <span className="text-[11px] font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                {item.name}
              </span>
            ) : null}
          </div>
        </div>

        {/* Score pill */}
        <div className={cn(
          "shrink-0 flex items-baseline gap-1 px-2.5 py-1 rounded-md border text-sm font-bold font-mono",
          scoreBg(score)
        )}>
          {score}
          <span className="text-[10px] font-normal opacity-70">/10</span>
        </div>
      </div>

      {/* Review text */}
      {item.comments && (
        <div className="px-3.5 py-2.5 rounded-lg bg-muted/25 border-l-2 border-primary/60 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          &ldquo;{item.comments}&rdquo;
        </div>
      )}

      {/* Dimension pills — compact chips avoiding mobile card bloat */}
      <div className="flex flex-wrap gap-1.5">
        {dims.map(({ label, value }) => (
          <div
            key={label}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 bg-muted/40 border border-border/50 text-[11px]"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("font-mono font-semibold", scoreColor(value))}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SpeakerFeedbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const talkFilter = searchParams.get("talk") || searchParams.get("event")

  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isCoachOpen, setIsCoachOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const submissionsRef = useRef<HTMLDivElement>(null)

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then(setFeedback)
      .catch((err) => console.error("Error fetching feedback:", err))
      .finally(() => setLoading(false))
  }, [])

  // Reset to page 1 whenever filter or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, sortBy, talkFilter])

  // ── Derived stats ────────────────────────────────────────────────────────────

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((s, f) => s + f.overall_rating, 0) / feedback.length).toFixed(1)
      : "—"

  const recentCount = feedback.filter((f) => {
    const ms = new Date().getTime() - new Date(f.created_at).getTime()
    return ms < 1000 * 60 * 60 * 24 * 30
  }).length

  const highRatingCount = feedback.filter((f) => f.overall_rating >= 8).length
  const highRatingRate =
    feedback.length > 0 ? Math.round((highRatingCount / feedback.length) * 100) : 0

  // ── Filtering & sorting ──────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return feedback
      .filter((f) => {
        if (talkFilter) {
          const q = talkFilter.toLowerCase().trim()
          const topic = (f.experience?.topic || "").toLowerCase()
          const eventName = (f.experience?.event_name || "").toLowerCase()
          const matchesTalk = topic.includes(q) || eventName.includes(q) || q.includes(eventName) || q.includes(topic)
          if (!matchesTalk) return false
        }
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
  }, [feedback, filter, sortBy, talkFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  const paginatedFeedback = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (submissionsRef.current) {
      const top = submissionsRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0 overflow-x-hidden">
        <FeedbackNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading attendee feedback…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 sm:pb-16 space-y-5 sm:space-y-6 min-w-0 overflow-x-hidden">
      <FeedbackNavigation />

      {/* ── Page Header (Clean, authoritative, CalSans typography) ─────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            All Feedback
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Attendee reviews and dimension ratings across all your speaking engagements
          </p>
        </div>

        {feedback.length > 0 && (
          <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-md border border-border/70 bg-card text-xs font-mono text-muted-foreground self-start sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{feedback.length} {feedback.length === 1 ? "review" : "reviews"} recorded</span>
          </div>
        )}
      </div>

      {/* ── Compact Metrics Strip (Single unified container, zero icon box bloat) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-border/70 bg-card divide-y sm:divide-y-0 sm:divide-x divide-border/60 overflow-hidden">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground">Average Score</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {avgRating}
            </span>
            {feedback.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">/ 10</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Across all dimensions</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground">Total Reviews</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {feedback.length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">All speaking events</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground">High Score Rate</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {highRatingRate}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{highRatingCount} ratings 8 or above</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground">Recent Submissions</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {recentCount}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Past 30 days</p>
        </div>
      </div>

      {/* ── SpeakBot Assistant Strip ────────────────────────────────────────── */}
      <SpeakBotQuickCard
        onOpenCoach={() => setIsCoachOpen(true)}
        totalCount={feedback.length}
        avgRating={avgRating}
      />

      {/* ── Attendee Submissions (PRIMARY content, above trends) ─────────────── */}
      <div ref={submissionsRef} className="rounded-xl border border-border/70 bg-card overflow-hidden">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border/60">
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Attendee Submissions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audience evaluations collected via your talk presentation links
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Reviews</SelectItem>
                <SelectItem value="recent" className="text-xs">Past 30 Days</SelectItem>
                <SelectItem value="high" className="text-xs">High (8+)</SelectItem>
                <SelectItem value="low" className="text-xs">Under 6</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date" className="text-xs">Most Recent</SelectItem>
                <SelectItem value="rating" className="text-xs">Highest Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Talk Filter Banner */}
        {talkFilter && (
          <div className="flex items-center justify-between gap-2 px-5 py-2.5 bg-muted/40 border-b border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Filtered to:</span>
              <span className="font-semibold text-foreground px-2 py-0.5 rounded-md bg-card border border-border/70 font-mono">
                {talkFilter}
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/speaker/feedback")}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filter</span>
            </button>
          </div>
        )}

        {/* Feedback list */}
        <div className="px-5 divide-y divide-border/40">
          {paginatedFeedback.length > 0 ? (
            paginatedFeedback.map((item) => <FeedbackRow key={item.id} item={item} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No feedback found</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
                {filter === "all"
                  ? "You have not received any feedback submissions yet."
                  : "No feedback matches the selected filter."}
              </p>
              {filter !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                  Reset filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Pagination Bar ─────────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-border/60 bg-muted/20">
            <p className="text-xs text-muted-foreground font-mono">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>
              –
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "review" : "reviews"}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 self-center sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground"
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
                          "h-8 w-8 p-0 text-xs font-mono",
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
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Feedback Trends & Flow (SECONDARY content, below submissions) ────── */}
      <FeedbackTrends initialFeedback={feedback} />

      {/* ── Floating SpeakBot ───────────────────────────────────────────────── */}
      <SpeakBotDrawer
        isOpen={isCoachOpen}
        onOpenChange={setIsCoachOpen}
        triggerButton={true}
      />
    </div>
  )
}

export default function SpeakerFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0 overflow-x-hidden">
          <FeedbackNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading attendee feedback…</p>
            </div>
          </div>
        </div>
      }
    >
      <SpeakerFeedbackPageContent />
    </Suspense>
  )
}
