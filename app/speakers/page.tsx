"use client"

import { SpeakersDirectory } from "@/components/speakers/speakers-directory"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SpeakersPage() {
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Speakers Directory</h1>
            <p className="text-muted-foreground">Discover and connect with speakers from around the world</p>
          </div>
          <SpeakersDirectory />
        </div>
      </div>
    </ProtectedRoute>
  )
}
