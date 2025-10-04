"use client"

import { AttendeeDashboard } from "@/components/dashboard/attendee-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AttendeeDashboardPage() {
  return (
    <ProtectedRoute roles={["attendee"]}>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Attendee Dashboard</h1>
            <p className="text-muted-foreground">Discover events, manage your attendance, and provide feedback</p>
          </div>
          <AttendeeDashboard />
        </div>
      </div>
    </ProtectedRoute>
  )
}