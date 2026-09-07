"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { SpeakerStats } from "@/components/dashboard/speaker/speaker-stats"
import { UpcomingEvents } from "@/components/dashboard/speaker/upcoming-events"
import { RecentFeedback } from "@/components/dashboard/speaker/recent-feedback"
import { SpeakingRequests } from "@/components/dashboard/speaker/speaking-requests"
import { FeedbackTrends } from "@/components/dashboard/speaker/feedback-trends"
import { ProfileCompletionBanner } from "@/components/dashboard/speaker/profile-completion-banner"
import { MyTalksSection } from "@/components/dashboard/speaker/my-talks-section"
import { SpeakerDecks } from "@/components/dashboard/speaker/speaker-decks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Mic, FileText, Presentation, Award } from "lucide-react"
import { useSpeakerAcceptedEvents } from "@/hooks/use-speaker-events"
import { Notifications } from "@/components/dashboard/speaker/notifications"

const TAB_CLASS = "rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground transition-colors px-3 pb-3 pt-1 text-sm font-medium"

export function SpeakerDashboardView() {
  const [activeTab, setActiveTab] = useState("overview")
  const { events: acceptedEvents } = useSpeakerAcceptedEvents()
  const hasDeckUploads = false
  const prefersReduced = useReducedMotion()

  const fadeUp = (delay = 0) => ({
    initial: prefersReduced ? {} : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-6">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Speaker Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your engagements and performance</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/speaker/cfp">
              <FileText className="h-3.5 w-3.5" />
              My CFPs
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Link href="/dashboard/speaker/experiences">
              <Award className="h-3.5 w-3.5" />
              Experiences
            </Link>
          </Button>
        </div>
      </motion.div>

      <ProfileCompletionBanner />
      <Notifications />

      {/* Stats strip */}
      <motion.div {...fadeUp(0.06)}>
        <SpeakerStats />
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.1)}>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-border rounded-none p-0 h-auto gap-0 flex-nowrap">
            <TabsTrigger value="overview"      className={TAB_CLASS}>Overview</TabsTrigger>
            <TabsTrigger value="upcoming"      className={TAB_CLASS}>Upcoming Events</TabsTrigger>
            <TabsTrigger value="requests"      className={TAB_CLASS}>Speaking Requests</TabsTrigger>
            <TabsTrigger value="feedback"      className={TAB_CLASS}>Feedback</TabsTrigger>
            <TabsTrigger value="talks"         className={`${TAB_CLASS} inline-flex items-center gap-1.5`}>
              <Mic className="h-3.5 w-3.5" />
              My Talks
            </TabsTrigger>
            <TabsTrigger value="presentations" className={`${TAB_CLASS} inline-flex items-center gap-1.5`}>
              <Presentation className="h-3.5 w-3.5" />
              Presentations
              {hasDeckUploads && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-foreground" aria-label="Upload available" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingEvents limit={3} />
              <RecentFeedback limit={3} />
            </div>
            <FeedbackTrends />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <UpcomingEvents />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <SpeakingRequests />
          </TabsContent>

          <TabsContent value="feedback" className="mt-6 space-y-6">
            <FeedbackTrends />
            <RecentFeedback />
          </TabsContent>

          <TabsContent value="talks" className="mt-6">
            <MyTalksSection />
          </TabsContent>

          <TabsContent value="presentations" className="mt-6">
            <SpeakerDecks events={acceptedEvents} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
