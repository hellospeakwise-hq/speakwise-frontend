"use client"

import { SpeakerDashboardView } from "@/components/dashboard/speaker/speaker-dashboard-view"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SpeakerDashboardPage() {
  return (
    <ProtectedRoute roles={["speaker"]}>
      <SpeakerDashboardView />
    </ProtectedRoute>
  )
}
