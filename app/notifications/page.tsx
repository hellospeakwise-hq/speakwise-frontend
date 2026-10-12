"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Notifications } from "@/components/dashboard/speaker/notifications"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Your updates</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          New talks and upcoming event announcements from speakers you follow.
        </p>
        <Notifications pageSize={20} showReadHistory />
      </main>
    </ProtectedRoute>
  )
}
