"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock, ExternalLink, CalendarPlus, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"

interface UpcomingEventsProps {
  limit?: number
}

export function UpcomingEvents({ limit }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get all incoming speaker requests
        const speakerRequests = await speakerRequestApi.getSpeakerIncomingRequests()
        console.log('All speaker requests:', speakerRequests)

        // Filter to only accepted requests
        const acceptedRequests = speakerRequests.filter(req => req.status === 'accepted')
        console.log('Accepted requests:', acceptedRequests)

        if (acceptedRequests.length > 0) {
          // Get all events
          const eventsResponse = await eventsApi.getEvents()
          const allEvents = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.results || []
          console.log('All events:', allEvents)

          // Get event IDs from accepted requests
          const acceptedEventIds = acceptedRequests.map(req => req.event)
          console.log('Accepted event IDs:', acceptedEventIds)

          // Filter to only events from accepted requests
          const speakerEvents = allEvents.filter((event: Event) =>
            acceptedEventIds.includes(event.id)
          )
          console.log('Matched speaker events:', speakerEvents)

          // Don't filter by date for now - show all accepted events
          // Sort by date (earliest first) - handle date parsing errors gracefully
          speakerEvents.sort((a: Event, b: Event) => {
            try {
              const dateA = new Date(a.date)
              const dateB = new Date(b.date)
              if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0 // Keep original order if dates are invalid
              }
              return dateA.getTime() - dateB.getTime()
            } catch (error) {
              console.error('Error sorting dates:', error)
              return 0
            }
          })

          console.log('Final events to display (sorted):', speakerEvents)
          setEvents(speakerEvents)
        } else {
          console.log('No accepted requests found')
          setEvents([])
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const displayEvents = limit ? events.slice(0, limit) : events

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your scheduled speaking engagements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="ml-2 text-muted-foreground">Loading events...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your scheduled speaking engagements</CardDescription>
        </div>
        {limit && events.length > limit && (
          <Link href="/dashboard/speaker/upcoming">
            <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <div key={event.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{event.name || event.title}</h3>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Confirmed
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                        {(() => {
                          try {
                            const date = new Date(event.date)
                            if (isNaN(date.getTime())) {
                              return event.date // Show raw date if parsing fails
                            }
                            return date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          } catch (error) {
                            return event.date // Fallback to raw date string
                          }
                        })()}
                      </div>
                    </div>
                    {event.location && typeof event.location !== 'string' && (
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                        {event.location.city}, {event.location.country.name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Event
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CalendarPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don&apos;t have any confirmed speaking engagements yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
