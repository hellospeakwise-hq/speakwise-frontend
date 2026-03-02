"use client"

import { useState } from "react"
import Link from "next/link"
import { SpeakerStats } from "@/components/dashboard/speaker/speaker-stats"
import { UpcomingEvents } from "@/components/dashboard/speaker/upcoming-events"
import { RecentFeedback } from "@/components/dashboard/speaker/recent-feedback"
import { SpeakingRequests } from "@/components/dashboard/speaker/speaking-requests"
import { FeedbackTrends } from "@/components/dashboard/speaker/feedback-trends"
import { Notifications } from "@/components/dashboard/speaker/notifications"
import { ProfileCompletionBanner } from "@/components/dashboard/speaker/profile-completion-banner"
import { MyTalksSection } from "@/components/dashboard/speaker/my-talks-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Award, Mic } from "lucide-react"

const TAB_CLASS = "rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4"

export function SpeakerDashboardView() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <ProfileCompletionBanner />
      <Notifications />

      {/* Quick Actions */}
      <div className="flex justify-end">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/speaker/experiences">
            <Award className="h-4 w-4" />
            Manage Speaking Experiences
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpeakerStats />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none p-0 h-auto gap-0 flex-nowrap">
          <TabsTrigger value="overview"  className={TAB_CLASS}>Overview</TabsTrigger>
          <TabsTrigger value="upcoming"  className={TAB_CLASS}>Upcoming Events</TabsTrigger>
          <TabsTrigger value="requests"  className={TAB_CLASS}>Speaking Requests</TabsTrigger>
          <TabsTrigger value="feedback"  className={TAB_CLASS}>Feedback & Performance</TabsTrigger>
          <TabsTrigger value="talks"     className={`${TAB_CLASS} gap-1.5 flex items-center`}>
            <Mic className="h-4 w-4" />
            My Talks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingEvents limit={3} />
            <RecentFeedback limit={3} />
          </div>
          <FeedbackTrends />
        </TabsContent>

        <TabsContent value="upcoming">
          <UpcomingEvents />
        </TabsContent>

        <TabsContent value="requests">
          <SpeakingRequests />
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-6">
            <FeedbackTrends />
            <RecentFeedback />
          </div>
        </TabsContent>

        <TabsContent value="talks">
          <MyTalksSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
