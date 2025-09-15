"use client"

import { SpeakerDashboardView } from "@/components/dashboard/speaker/speaker-dashboard-view"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SpeakerDashboardPage() {
  return (
    <ProtectedRoute roles={["speaker"]}>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Speaker Dashboard</h1>
            <p className="text-muted-foreground">Manage your speaking engagements and track your performance</p>
          </div>
          <SpeakerDashboardView />
        </div>
      </div>
    </ProtectedRoute>
  )
}
