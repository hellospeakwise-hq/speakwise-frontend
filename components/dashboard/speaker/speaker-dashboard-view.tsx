"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Mic,
  FileText,
  Award,
  QrCode,
  LayoutDashboard,
  Search,
  Bell,
  Settings,
  Plus,
  MessageSquare,
} from "lucide-react"

// ACRU Components
import { AcruHeroChart } from "@/components/dashboard/speaker/acru/AcruHeroChart"
import { AcruMiddleRow } from "@/components/dashboard/speaker/acru/AcruMiddleRow"
import { AcruBottomRow } from "@/components/dashboard/speaker/acru/AcruBottomRow"
import { AcruSpeakerPass } from "@/components/dashboard/speaker/acru/AcruSpeakerPass"
import { AcruActivityStream } from "@/components/dashboard/speaker/acru/AcruActivityStream"

// Existing Features
import { UpcomingEvents } from "@/components/dashboard/speaker/upcoming-events"
import { RecentFeedback } from "@/components/dashboard/speaker/recent-feedback"
import { FeedbackTrends } from "@/components/dashboard/speaker/feedback-trends"
import { Notifications } from "@/components/dashboard/speaker/notifications"
import { BadgesGallery } from "@/components/badges/badges-gallery"
import { feedbackAPI } from "@/lib/api/feedbackApi"
import { useAuth } from "@/contexts/auth-context"
import { MobileSpeakerDashboard } from "@/components/dashboard/speaker/mobile/MobileSpeakerDashboard"

const MyTalksSection = dynamic(
  () => import("@/components/dashboard/speaker/my-talks-section").then((m) => m.MyTalksSection),
  { loading: () => <div className="h-48 animate-pulse rounded-2xl bg-muted" /> },
)
const QrQuickAccess = dynamic(
  () => import("@/components/dashboard/speaker/qr-quick-access").then((m) => m.QrQuickAccess),
  { loading: () => <div className="h-36 animate-pulse rounded-2xl bg-muted" /> },
)

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground transition-colors px-3 pb-3 pt-1 text-sm font-medium"

export function SpeakerDashboardView() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [avgRating, setAvgRating] = useState<number | null>(8.3)
  const [totalFeedback, setTotalFeedback] = useState<number>(20)
  const prefersReduced = useReducedMotion()

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
      .catch((err) => console.error("Error loading feedback in ACRU dashboard:", err))
  }, [])

  const fadeUp = (delay = 0) => ({
    initial: prefersReduced ? {} : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
  })

  const speakerDisplayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email?.split("@")[0] || "Speaker"
    : "Nana Acheampong"

  return (
    <>
      {/* ── MOBILE-ONLY VIEW (Exact Dribbble Reference: visible on mobile, hidden on lg+) ── */}
      <div className="block lg:hidden">
        <MobileSpeakerDashboard />
      </div>

      {/* ── DESKTOP VIEW (hidden on mobile, visible on lg+) ── */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-6">
        {/* ── ACRU TOP BAR / HEADER ────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Active Season 2026
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time speaking engagements, attendee telemetry, and impact benchmarks
          </p>
        </div>

        {/* Action button pills matching ACRU top bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* View All Feedback Button */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-full border-border/80 hover:border-foreground/30 bg-card hover:bg-muted text-foreground shrink-0 shadow-2xs transition-all"
          >
            <Link href="/dashboard/speaker/feedback">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span>All Feedback</span>
              <span className="ml-0.5 px-2 py-0.5 rounded-full bg-muted text-foreground font-mono text-[10px] font-bold border border-border/60">
                {totalFeedback}
              </span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-full border-border/80 shrink-0 shadow-2xs"
          >
            <Link href="/dashboard/speaker/experiences">
              <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Get QR Code</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-full bg-[#72A847] hover:bg-[#62923C] text-white shrink-0 shadow-xs"
          >
            <Link href="/dashboard/speaker/experiences">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Presentation</span>
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Notifications bar */}
      <Notifications />

      {/* ── NAVIGATION TABS ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-border/70 pb-0">
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-none bg-transparent rounded-none p-0 h-auto gap-1 flex-nowrap">
            <TabsTrigger value="overview" className={TAB_CLASS}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="upcoming" className={TAB_CLASS}>
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="feedback" className={TAB_CLASS}>
              Feedback History
            </TabsTrigger>
            <TabsTrigger value="talks" className={`${TAB_CLASS} inline-flex items-center gap-1.5`}>
              <Mic className="h-3.5 w-3.5" />
              My Talks
            </TabsTrigger>
            <TabsTrigger value="badges" className={`${TAB_CLASS} inline-flex items-center gap-1.5`}>
              <Award className="h-3.5 w-3.5 text-amber-500" />
              Web3 Badges
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── OVERVIEW: THE ACRU 2-COLUMN MODULAR CANVAS ─────────────────────── */}
        <TabsContent value="overview" className="mt-6 space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT ZONE: 8 Columns (Charts & Analytical Micro-Widgets) ───── */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Hero Segmented Pill Bar Chart & Metric Stack */}
              <motion.div {...fadeUp(0.04)}>
                <AcruHeroChart
                  avgRating={avgRating}
                  totalFeedback={totalFeedback}
                  upcomingCount={0}
                />
              </motion.div>

              {/* 2. Middle Row: Chiclet Progress & Delivery Insights */}
              <motion.div {...fadeUp(0.08)}>
                <AcruMiddleRow completionPercentage={85} />
              </motion.div>

              {/* 3. Bottom Row: Dimension Chiclets, 180° Arch Semicircle Gauge & Goals */}
              <motion.div {...fadeUp(0.12)}>
                <AcruBottomRow />
              </motion.div>

              {/* 4. Slide QR Quick Access Card */}
              <motion.div {...fadeUp(0.16)}>
                <QrQuickAccess />
              </motion.div>
            </div>

            {/* ── RIGHT ZONE: 4 Columns (Tactile Speaker Pass & Activity Stream) ── */}
            <div className="lg:col-span-4 space-y-6">
              {/* 1. Tactile Physical Speaker Card & Quick Partners */}
              <motion.div {...fadeUp(0.06)}>
                <AcruSpeakerPass
                  speakerName={speakerDisplayName}
                  headline="Verified Conference Speaker"
                />
              </motion.div>

              {/* 2. Feedback Activity Stream (ACRU Transaction History Style) */}
              <motion.div {...fadeUp(0.1)}>
                <AcruActivityStream />
              </motion.div>

              {/* 3. Upcoming Events widget */}
              <motion.div {...fadeUp(0.14)}>
                <UpcomingEvents limit={2} />
              </motion.div>
            </div>
          </div>
        </TabsContent>

        {/* ── OTHER TABS ─────────────────────────────────────────────────────── */}
        <TabsContent value="upcoming" className="mt-6">
          <UpcomingEvents />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6 space-y-6">
          <FeedbackTrends />
          <RecentFeedback />
        </TabsContent>

        <TabsContent value="talks" className="mt-6">
          <MyTalksSection />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgesGallery isOwner={true} />
        </TabsContent>
      </Tabs>
      </div>
    </>
  )
}
