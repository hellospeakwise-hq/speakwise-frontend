"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ArrowUpRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"

interface StreamItem {
  id: string
  slug: string
  topic: string
  event: string
  date: string
  initials: string
  badgeBg: string
  logoUrl?: string
  avgRating: number
  ratingDisplay: string
  isHigh: boolean
  reviewCount: number
  lastActivityTimestamp: number
}

function StreamLogoAvatar({ item }: { item: StreamItem }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`h-9 w-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden bg-white dark:bg-card shadow-2xs ${item.badgeBg}`}
    >
      {!failed && item.logoUrl ? (
        <img
          src={item.logoUrl}
          alt={item.event}
          className="h-5 w-5 object-contain rounded-full"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <span>{item.initials}</span>
      )}
    </div>
  )
}

export function AcruActivityStream() {
  const [streamFilter, setStreamFilter] = useState<"7d" | "30d" | "all">("all")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activities, setActivities] = useState<StreamItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      feedbackAPI.getCurrentSpeakerFeedback(),
      experiencesApi.getMyExperiences(),
    ]).then(([feedResult, expResult]) => {
      const feedbacks = feedResult.status === "fulfilled" ? feedResult.value : []
      const experiences = expResult.status === "fulfilled" ? expResult.value : []

      const map = new Map<string, StreamItem>()

      // 1. Group by speaker's actual registered presentations
      experiences.forEach((exp) => {
        const slug = exp.feedback_slug || exp.id || `exp-${exp.event_name}`
        const eventName = exp.event_name || "Speaking Engagement"
        const topic = exp.topic || "Presentation"
        const isGoogle = eventName.toLowerCase().includes("devfest")
        const isPython = eventName.toLowerCase().includes("pycon")
        const initial =
          eventName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "EV"

        let formattedDate = ""
        try {
          formattedDate = exp.event_date
            ? new Date(exp.event_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""
        } catch {
          formattedDate = exp.event_date || ""
        }

        map.set(slug, {
          id: slug,
          slug,
          topic,
          event: eventName,
          date: formattedDate,
          initials: initial,
          badgeBg: isGoogle
            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
            : isPython
            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
            : "bg-primary/10 text-primary border-primary/20",
          logoUrl: isGoogle
            ? "https://www.google.com/s2/favicons?domain=developers.google.com&sz=128"
            : isPython
            ? "https://www.google.com/s2/favicons?domain=python.org&sz=128"
            : undefined,
          avgRating: 0,
          ratingDisplay: "—",
          isHigh: false,
          reviewCount: 0,
          lastActivityTimestamp: 0,
        })
      })

      // 2. Also register any talks found in feedbacks not yet in map
      feedbacks.forEach((f) => {
        let slug = f.experience?.feedback_slug
        if (!slug) {
          const match = experiences.find(
            (e) =>
              e.event_name &&
              f.experience?.event_name &&
              e.event_name.toLowerCase().trim() === f.experience.event_name.toLowerCase().trim()
          )
          slug = match?.feedback_slug || match?.id || f.experience?.event_name || "talk"
        }

        if (!map.has(slug)) {
          const eventName = f.experience?.event_name || "Speaking Engagement"
          const topic = f.experience?.topic || "Presentation"
          const isGoogle = eventName.toLowerCase().includes("devfest")
          const isPython = eventName.toLowerCase().includes("pycon")
          const initial =
            eventName
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "EV"

          map.set(slug, {
            id: slug,
            slug,
            topic,
            event: eventName,
            date: "Recent",
            initials: initial,
            badgeBg: isGoogle
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
              : isPython
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-primary/10 text-primary border-primary/20",
            logoUrl: isGoogle
              ? "https://www.google.com/s2/favicons?domain=developers.google.com&sz=128"
              : isPython
              ? "https://www.google.com/s2/favicons?domain=python.org&sz=128"
              : undefined,
            avgRating: 0,
            ratingDisplay: "—",
            isHigh: false,
            reviewCount: 0,
            lastActivityTimestamp: 0,
          })
        }
      })

      // 3. Compute aggregate scores and review counts per talk
      map.forEach((item, slug) => {
        const talkFeedbacks = feedbacks.filter((f) => {
          if (f.experience?.feedback_slug && f.experience.feedback_slug === item.slug) return true
          if (
            f.experience?.event_name &&
            item.event &&
            f.experience.event_name.toLowerCase().trim() === item.event.toLowerCase().trim()
          ) {
            return true
          }
          return false
        })

        if (talkFeedbacks.length > 0) {
          const sum = talkFeedbacks.reduce((s, f) => s + f.overall_rating, 0)
          const avg = sum / talkFeedbacks.length
          item.reviewCount = talkFeedbacks.length
          item.avgRating = avg
          item.ratingDisplay = `${avg.toFixed(1)}/10`
          item.isHigh = avg >= 8.5

          // Find newest feedback timestamp
          let maxTs = 0
          talkFeedbacks.forEach((tf) => {
            if (tf.created_at) {
              try {
                const ts = new Date(tf.created_at).getTime()
                if (ts > maxTs) maxTs = ts
              } catch {}
            }
          })
          item.lastActivityTimestamp = maxTs
        }
      })

      // Sort talks: talks with reviews first, then by rating
      const sorted = Array.from(map.values()).sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount
        return b.avgRating - a.avgRating
      })

      setActivities(sorted)
      setLoading(false)
    })
  }, [])

  const now = Date.now()
  const displayedActivities = activities.filter((act) => {
    if (streamFilter === "all" || !act.lastActivityTimestamp) return true
    const ageMs = now - act.lastActivityTimestamp
    if (streamFilter === "7d") return ageMs <= 7 * 86400 * 1000
    if (streamFilter === "30d") return ageMs <= 30 * 86400 * 1000
    return true
  }).slice(0, 5) // Cap at 5 presentations so the card never stretches excessively

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-tight">Recent Feedback Stream</h4>
          <p className="text-[11px] text-muted-foreground">Attendee reviews &amp; ratings</p>
        </div>

        {/* Interactive Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-muted/40 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <span>{streamFilter === "all" ? "All Time" : streamFilter}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 z-40 w-32 rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                {[
                  { id: "7d", label: "Past 7 days" },
                  { id: "30d", label: "Past 30 days" },
                  { id: "all", label: "All Time" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setStreamFilter(opt.id as any)
                      setIsDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors text-left",
                      streamFilter === opt.id
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span>{opt.label}</span>
                    {streamFilter === opt.id && <Check className="h-3 w-3 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table header row */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium px-1 border-b border-border/50 pb-2">
        <span>Session &amp; Event</span>
        <span>Rating</span>
      </div>

      {/* Stream list */}
      <div className="divide-y divide-border/50">
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No attendee reviews found for this timeframe.
          </div>
        ) : (
          displayedActivities.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/speaker/feedback-by-talks?slug=${encodeURIComponent(item.slug)}`}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group hover:bg-muted/30 px-1 -mx-1 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Soft rounded logo avatar with image or initial fallback */}
                <StreamLogoAvatar item={item} />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.topic}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.event}{item.date ? ` · ${item.date}` : ""}
                  </p>
                </div>
              </div>

              {/* Score rating badge */}
              <div className="shrink-0 text-right">
                {item.reviewCount > 0 ? (
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold ${
                        item.isHigh ? "text-[#72A847]" : "text-amber-500"
                      }`}
                    >
                      ★ {item.ratingDisplay}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.reviewCount} {item.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    No reviews
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="pt-1 text-center">
        <Link
          href="/dashboard/speaker/feedback"
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <span>View all attendee reviews</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
