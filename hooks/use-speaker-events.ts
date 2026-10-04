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
        const safeRequests = Array.isArray(requests) ? requests : (requests as any)?.results ?? []
        safeRequests
          .filter((r: any) => r.status === "accepted")
          .forEach((r: any) => acceptedEventIds.add(r.event))

        // Accepted CFP submissions — event is stored as `event` (ID) on each submission
        const safeCFPs = Array.isArray(cfpSubmissions) ? cfpSubmissions : (cfpSubmissions as any)?.results ?? []
        safeCFPs
          .filter((s: any) => s.status === "accepted")
          .forEach((s: any) => acceptedEventIds.add(s.event))

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
