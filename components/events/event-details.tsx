'use client'

import { Calendar, MapPin, Users, Clock, Loader2, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { fetchEventById, type Event } from "@/lib/api/events"
import { EventSessions } from "./event-sessions"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface EventDetailsProps {
  id: string
}

export function EventDetails({ id }: EventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Only show management buttons to organizers
  const canManageEvent = user?.userType === 'organizer'

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchEventById(parseInt(id))
        console.log('Event data received in details component:', data)
        console.log('Tags data:', data.tags)
        setEvent(data)
      } catch (err) {
        console.error('Error fetching event:', err)
        setEvent(null)
        setError('Failed to load event. Please check if the backend is running.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadEvent()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-muted-foreground">Loading event...</span>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || "Event not found"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name || event.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {event.tags && event.tags.length > 0 ? (
              event.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color || '#007bff'}33`, // Add transparency
                    color: tag.color || '#007bff',
                    border: `1px solid ${tag.color || '#007bff'}`
                  }}
                >
                  {tag.name || `Tag ${tag.id}`}
                </span>
              ))
            ) : (
              <Badge variant="outline">No tags</Badge>
            )}
          </div>
        </div>

        {/* Management links only shown to organizers */}
        {canManageEvent && (
          <div className="flex space-x-2">
            <Link href={`/events/${id}/manage-sessions`}>
              <Button variant="outline" size="sm">
                Manage Sessions
              </Button>
            </Link>
            <Link href={`/events/${id}/manage-speakers`}>
              <Button variant="outline" size="sm">
                Manage Speakers
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About the Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{event.description || event.short_description || 'No description available'}</p>
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-medium">Date</p>
                    {event.date_range ? (
                      event.date_range.same_day ? (
                        <p className="text-sm text-muted-foreground">{event.date_range.start?.date}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          From: {event.date_range.start?.date}<br />
                          To: {event.date_range.end?.date}
                        </p>
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">{event.date || 'TBA'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-medium">Time</p>
                    {event.date_range ? (
                      event.date_range.same_day ? (
                        <p className="text-sm text-muted-foreground">
                          {event.date_range.start?.time} - {event.date_range.end?.time}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Start: {event.date_range.start?.time}<br />
                          End: {event.date_range.end?.time}
                        </p>
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {event.start_date_time
                          ? new Date(event.start_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'TBA'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location 
                        ? typeof event.location === 'string' 
                          ? event.location
                          : `${event.location.venue || ''}${event.location.city ? `, ${event.location.city}` : ''}${event.location.country?.name ? `, ${event.location.country.name}` : ''}`.trim().replace(/^,\s*/, '') || 'TBA'
                        : 'TBA'
                      }
                    </p>
                  </div>
                </div>
                {event.website && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 mr-2 text-orange-500 shrink-0" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={event.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {event.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                <span className="font-medium">Attendees</span>
              </div>
              <span className="text-lg font-bold">TBA</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 mr-2 text-orange-500"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="font-medium">Speakers</span>
              </div>
              <span className="text-lg font-bold">TBA</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Section */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Event Talks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-muted-foreground">View all Speakers and their respective talks and give feedback to talk sessions</p>
          </div>
          <EventSessions eventId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
