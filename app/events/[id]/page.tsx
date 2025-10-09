'use client'

import Link from "next/link"
import { use } from "react"
import { EventDetails } from "@/components/events/event-details"
import { SpeakersList } from "@/components/events/speakers-list"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()

  // Only show management button to organizers
  const canManageEvent = user?.userType === 'organizer'

  return (
    <div className="min-h-screen">
      {/* Back button and manage button */}
      <div className="container pt-6 pb-4">
        <div className="flex justify-between items-center">
          <Link
            href="/events"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Events
          </Link>

          {canManageEvent && (
            <Link href={`/events/${id}/manage`}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Manage Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Event Details with contained hero */}
      <EventDetails id={id} />
      
      {/* Additional content can go here */}
      {/* <SpeakersList eventId={id} /> */}
    </div>
  )
}
