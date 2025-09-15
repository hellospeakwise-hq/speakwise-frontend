"use client"

import { useState } from "react"
import { SpeakerStats } from "@/components/dashboard/speaker/speaker-stats"
import { UpcomingEvents } from "@/components/dashboard/speaker/upcoming-events"
import { RecentFeedback } from "@/components/dashboard/speaker/recent-feedback"
import { SpeakingRequests } from "@/components/dashboard/speaker/speaking-requests"
import { FeedbackTrends } from "@/components/dashboard/speaker/feedback-trends"
import { Notifications } from "@/components/dashboard/speaker/notifications"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SpeakerDashboardView() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <Notifications />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpeakerStats />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="requests">Speaking Requests</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Performance</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
