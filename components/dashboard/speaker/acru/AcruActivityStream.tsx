"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronDown, Star, ArrowUpRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreamItem {
  id: string
  topic: string
  event: string
  date: string
  initials: string
  badgeBg: string
  logoUrl?: string
  rating: string
  isHigh: boolean
  comments: string
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
  const [streamFilter, setStreamFilter] = useState<"7d" | "30d" | "all">("7d")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const activities: StreamItem[] = [
    {
      id: "1",
      topic: "Architecting Scalable Microservices",
      event: "DevFest Accra 2026",
      date: "Oct 27, 2026",
      initials: "DF",
      badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      logoUrl: "https://www.google.com/s2/favicons?domain=developers.google.com&sz=128",
      rating: "10/10",
      isHigh: true,
      comments: "Phenomenal speaker. Answered Q&A with extreme authority.",
    },
    {
      id: "2",
      topic: "Building a URL Shortener with Django & AWS",
      event: "PyCon Togo 2026",
      date: "Aug 27, 2026",
      initials: "PY",
      badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      logoUrl: "https://www.google.com/s2/favicons?domain=python.org&sz=128",
      rating: "9.2/10",
      isHigh: true,
      comments: "Super practical live coding demos. Very clear pacing.",
    },
    {
      id: "3",
      topic: "Event-Driven Systems with Apache Kafka",
      event: "Tech In Ghana Summit",
      date: "Jul 14, 2026",
      initials: "TG",
      badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      logoUrl: "https://www.google.com/s2/favicons?domain=techinghana.com&sz=128",
      rating: "8.8/10",
      isHigh: true,
      comments: "Clear breakdown of decoupling patterns for high load.",
    },
    {
      id: "4",
      topic: "Web3 Smart Contract Verification",
      event: "ETH Accra Workshop",
      date: "Jun 02, 2026",
      initials: "EA",
      badgeBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      logoUrl: "https://www.google.com/s2/favicons?domain=ethereum.org&sz=128",
      rating: "8.5/10",
      isHigh: false,
      comments: "Great intro to soulbound tokens and attendee reputation.",
    },
  ]

  const displayedActivities =
    streamFilter === "7d"
      ? activities.slice(0, 2)
      : streamFilter === "30d"
      ? activities.slice(0, 3)
      : activities

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
        {displayedActivities.map((item) => (
          <div key={item.id} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Soft rounded logo avatar with image or initial fallback */}
              <StreamLogoAvatar item={item} />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {item.topic}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {item.event} · {item.date}
                </p>
              </div>
            </div>

            {/* Score rating badge */}
            <div className="shrink-0 text-right">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold ${
                  item.isHigh ? "text-[#72A847]" : "text-amber-500"
                }`}
              >
                ★ {item.rating}
              </span>
            </div>
          </div>
        ))}
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
