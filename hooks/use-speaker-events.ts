"use client"

import { useEffect, useState } from "react"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { cfpApi } from "@/lib/api/cfpApi"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"

export function useSpeakerAcceptedEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const [requests, cfpSubmissions, eventsResponse] = await Promise.all([
          speakerRequestApi.getSpeakerIncomingRequests(),
          cfpApi.myCFPs(),
          eventsApi.getEvents(),
        ])

        const all: Event[] = Array.isArray(eventsResponse)
          ? eventsResponse
          : eventsResponse.results ?? []

        const acceptedEventIds = new Set<string>()

        // Accepted speaker requests
        requests
          .filter((r) => r.status === "accepted")
          .forEach((r) => acceptedEventIds.add(r.event))

        // Accepted CFP submissions — event is stored as `event` (ID) on each submission
        cfpSubmissions
          .filter((s) => s.status === "accepted")
          .forEach((s) => acceptedEventIds.add(s.event))

        setEvents(all.filter((e: Event) => acceptedEventIds.has(e.id)))
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { events, loading }
}
