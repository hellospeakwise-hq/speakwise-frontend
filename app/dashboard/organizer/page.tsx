"use client"

import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function OrganizerDashboardPage() {
  return (
    <ProtectedRoute roles={["organizer"]}>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage events, speakers, and attendees</p>
          </div>
          <OrganizerDashboard />
        </div>
      </div>
    </ProtectedRoute>
  )
}