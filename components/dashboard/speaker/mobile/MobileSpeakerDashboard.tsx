"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Settings,
  Plus,
  Star,
  MessageSquare,
  QrCode,
  Calendar,
  Mic,
  Award,
  ChevronDown,
} from "lucide-react"

// Desktop feature components adapted for mobile
import { AcruSpeakerPass } from "@/components/dashboard/speaker/acru/AcruSpeakerPass"
import { AcruHeroChart } from "@/components/dashboard/speaker/acru/AcruHeroChart"
import { AcruMiddleRow } from "@/components/dashboard/speaker/acru/AcruMiddleRow"
import { AcruBottomRow } from "@/components/dashboard/speaker/acru/AcruBottomRow"
import { AcruActivityStream } from "@/components/dashboard/speaker/acru/AcruActivityStream"
import { UpcomingEvents } from "@/components/dashboard/speaker/upcoming-events"
import { RecentFeedback } from "@/components/dashboard/speaker/recent-feedback"
import { FeedbackTrends } from "@/components/dashboard/speaker/feedback-trends"
import { BadgesGallery } from "@/components/badges/badges-gallery"

import { feedbackAPI } from "@/lib/api/feedbackApi"
import { useAuth } from "@/contexts/auth-context"

const MyTalksSection = dynamic(
  () => import("@/components/dashboard/speaker/my-talks-section").then((m) => m.MyTalksSection),
  { loading: () => <div className="h-48 animate-pulse rounded-3xl bg-muted" /> },
)
const QrQuickAccess = dynamic(
  () => import("@/components/dashboard/speaker/qr-quick-access").then((m) => m.QrQuickAccess),
  { loading: () => <div className="h-36 animate-pulse rounded-3xl bg-muted" /> },
)

type MobileTab = "overview" | "upcoming" | "feedback" | "talks" | "badges"

export function MobileSpeakerDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<MobileTab>("overview")
  const [avgRating, setAvgRating] = useState<number>(8.3)
  const [totalFeedback, setTotalFeedback] = useState<number>(20)

  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then((data) => {
        if (data && data.length > 0) {
          const avg = data.reduce((sum, f) => sum + f.overall_rating, 0) / data.length
          setAvgRating(avg)
          setTotalFeedback(data.length)
        }
      })
      .catch((err) => console.error("Mobile feedback load error:", err))
  }, [])

  const speakerName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email?.split("@")[0] || "Speaker"
    : "Nana Acheampong"

  // 10 vertical chiclet capsules for Card 1 (Rating)
  const ratingCapsulesFilled = Math.min(10, Math.max(1, Math.round((avgRating / 10) * 10)))
  // 10 vertical chiclet capsules for Card 2 (Feedback)
  const feedbackCapsulesFilled = Math.min(10, Math.max(1, Math.round((totalFeedback / 50) * 10)))

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 px-4 pt-3 space-y-6 max-w-md mx-auto select-none">
      {/* ── 1. TOP HEADER ACTION ROW (Smooth Horizontal Touch Scroll, Clean Matte Finishes) ── */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-none pb-1 pt-1 overscroll-x-contain">
        <div className="flex items-center gap-2 min-w-max pr-4">
          {/* Clean Status Pill (Matte finish, no glowing neon animation) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border/80 bg-muted/40 text-muted-foreground text-xs font-medium shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Active 2026</span>
          </div>

          {/* Feedback Button (Clean human-crafted pill with tactile counter) */}
          <Link
            href="/dashboard/speaker/feedback"
            className="h-10 px-4 rounded-full border border-border/80 bg-card hover:bg-muted/60 text-foreground flex items-center gap-2 text-xs font-semibold active:scale-95 transition-all shadow-2xs shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Feedback</span>
            <span className="px-2 py-0.5 rounded-full bg-muted text-foreground font-mono text-[11px] font-bold border border-border/60">
              {totalFeedback}
            </span>
          </Link>

          {/* "+ Add Talk" pill button */}
          <Link
            href="/dashboard/speaker/experiences"
            className="h-10 px-4 rounded-full border border-border/80 bg-card hover:bg-muted/60 text-foreground flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-2xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Add Talk</span>
          </Link>

          {/* Profile / Settings button */}
          <Link
            href="/profile"
            aria-label="Profile Settings"
            className="h-10 px-4 rounded-full border border-border/80 bg-card hover:bg-muted/60 text-foreground flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-2xs shrink-0"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO TITLE (Dribbble Typographic Hierarchy) ───────────────────── */}
      <div className="space-y-0.5 pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
          My Speaking
        </h1>
        <p className="text-xs text-muted-foreground">{speakerName} · Performance &amp; Telemetry</p>
      </div>

      {/* ── 3. PILL TAB SWITCHER (Dribbble Solid Black Active Pill) ─────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            activeTab === "overview"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            activeTab === "upcoming"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Upcoming
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            activeTab === "feedback"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Feedback
        </button>

        <button
          onClick={() => setActiveTab("talks")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            activeTab === "talks"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          My Talks
        </button>

        <button
          onClick={() => setActiveTab("badges")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            activeTab === "badges"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Badges
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW (ALL DESKTOP STUFF IN MOBILE BRANDING) ───────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ── 1. The 2 Metric Cards with Vertical Chiclet Capsules (Dribbble Signature) ── */}
          <div className="space-y-4">
            {/* Metric Card 1: Overall Rating */}
            <div className="rounded-[32px] bg-[#EEF2FC] dark:bg-[#151D2A] p-6 space-y-5 shadow-xs border border-transparent dark:border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white dark:bg-card flex items-center justify-center text-foreground shadow-2xs">
                    <Star className="h-3.5 w-3.5 text-[#6D8AE8] fill-[#6D8AE8]" />
                  </div>
                  <span className="text-sm font-bold text-foreground tracking-tight">
                    Overall Rating
                  </span>
                </div>
                <span className="rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-bold font-mono">
                  {Math.round((avgRating / 10) * 100)}% Index
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground font-mono">
                  / 10
                </span>
              </div>

              {/* 10 Vertical Chiclet Capsule Pills */}
              <div className="flex items-center gap-1.5 w-full pt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-11 flex-1 rounded-full transition-all duration-300 ${
                      i < ratingCapsulesFilled
                        ? "bg-[#9BB2F8] dark:bg-[#6D8AE8]"
                        : "border-2 border-dashed border-[#9BB2F8]/40 dark:border-[#6D8AE8]/30 bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Explanatory Context Text */}
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                Average score across verified attendee evaluations (clarity, delivery, and audience engagement).
              </p>
            </div>

            {/* Metric Card 2: Attendee Feedback */}
            <div className="rounded-[32px] bg-[#F1F4F8] dark:bg-[#1A222C] p-6 space-y-4 shadow-xs border border-transparent dark:border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white dark:bg-card flex items-center justify-center text-foreground shadow-2xs">
                    <MessageSquare className="h-3.5 w-3.5 text-[#889FA5]" />
                  </div>
                  <span className="text-sm font-bold text-foreground tracking-tight">
                    Attendee Feedback
                  </span>
                </div>
                <span className="rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-bold font-mono">
                  {totalFeedback} Reviews
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  {totalFeedback}
                </span>
                <span className="text-sm font-semibold text-muted-foreground font-mono">
                  / 50 Goal
                </span>
              </div>

              {/* 10 Vertical Chiclet Capsule Pills */}
              <div className="flex items-center gap-1.5 w-full pt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-11 flex-1 rounded-full transition-all duration-300 ${
                      i < feedbackCapsulesFilled
                        ? "bg-[#AEC3CE] dark:bg-[#7E96A2]"
                        : "border-2 border-dashed border-[#AEC3CE]/40 dark:border-[#7E96A2]/30 bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Explanatory Context Text */}
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                Total reviews submitted live by audience members scanning your presentation slides&apos; QR codes.
              </p>
            </div>
          </div>

          {/* ── 2. Tactile Physical Speaker Card & Quick Actions ──────────────── */}
          <AcruSpeakerPass speakerName={speakerName} />

          {/* ── 3. Chunky Segmented Pill Bar Chart & Metric Stack ────────────── */}
          <AcruHeroChart avgRating={avgRating} totalFeedback={totalFeedback} />

          {/* ── 4. Speaking Readiness & Quick Tips (Chiclet Bricks) ────────────── */}
          <AcruMiddleRow completionPercentage={85} />

          {/* ── 5. Dimension Analysis + 180° Arch Semicircle Gauge + Goals ─────── */}
          <AcruBottomRow />

          {/* ── 6. Slide QR Quick Access Card ─────────────────────────────────── */}
          <QrQuickAccess />

          {/* ── 7. Recent Session Feedback Stream ──────────────────────────────── */}
          <AcruActivityStream />

          {/* ── 8. Upcoming Engagements List ───────────────────────────────────── */}
          <UpcomingEvents limit={2} />
        </div>
      )}

      {/* ── TAB 2: UPCOMING EVENTS ───────────────────────────────────────────── */}
      {activeTab === "upcoming" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <UpcomingEvents />
        </div>
      )}

      {/* ── TAB 3: FEEDBACK HISTORY ──────────────────────────────────────────── */}
      {activeTab === "feedback" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <FeedbackTrends />
          <RecentFeedback />
        </div>
      )}

      {/* ── TAB 4: MY TALKS ──────────────────────────────────────────────────── */}
      {activeTab === "talks" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <MyTalksSection />
        </div>
      )}

      {/* ── TAB 5: WEB3 BADGES ───────────────────────────────────────────────── */}
      {activeTab === "badges" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <BadgesGallery isOwner={true} />
        </div>
      )}
    </div>
  )
}
