"use client"

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile, events, and feedback</p>
          </div>
          <DashboardTabs />
        </div>
      </div>
    </ProtectedRoute>
  )
}
