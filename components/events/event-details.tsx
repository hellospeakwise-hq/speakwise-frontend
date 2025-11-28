'use client'

import { Calendar, MapPin, Users, Clock, Loader2, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { DateTimeInfo } from "@/lib/types/api"
import { formatDateFromMaybe, formatTimeFromMaybe } from '@/lib/utils/event-utils'
import { getEventImageUrl } from '@/lib/utils/event-utils'
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { EventSessions } from "./event-sessions"
import { useAuth } from "@/contexts/auth-context"
import { useEvents } from "@/hooks/use-events"
import { apiClient } from "@/lib/api/base"
import Link from "next/link"

interface EventDetailsProps {
  id: string
}

export function EventDetails({ id }: EventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [speakersCount, setSpeakersCount] = useState<number>(0)
  const [attendeesCount, setAttendeesCount] = useState<number>(0)
  const { user } = useAuth()
  const { events: allEvents, loading: eventsLoading } = useEvents()


  // Helpers to handle both string ISO values and the older object shape
  // Use shared helpers from utils
  const getDateString = (v?: string | DateTimeInfo | null) => formatDateFromMaybe(v as any)
  const getTimeString = (v?: string | DateTimeInfo | null) => formatTimeFromMaybe(v as any)

  // Helper to ensure absolute image URL

  // Only show management buttons to organizers
  const canManageEvent = user?.userType === 'organizer'

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, try to find the event in the already loaded events list
        const eventFromList = allEvents.find(e => e.id.toString() === id)

        if (eventFromList && !eventsLoading) {
          // If we found the event in the list, use it directly
          console.log('Using event from events list:', eventFromList)
          setEvent(eventFromList)
          setLoading(false)
          return
        }

        // If not found in list or list is still loading, try API call
        if (!eventsLoading) {
          console.log('Event not found in list, trying API call...')
          const data = await eventsApi.getEvent(id)
          console.log('Event data received from API:', data)
          setEvent(data)
        }
      } catch (err) {
        console.error('Error fetching event:', err)
        setEvent(null)

        // Handle 401 errors gracefully for event details
        if (err instanceof Error && err.message.includes('401')) {
          setError('Event details are not available. The event may require authentication to view.')
        } else {
          setError('Failed to load event details.')
        }
      } finally {
        if (!eventsLoading) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadEvent()
    }
  }, [id, allEvents, eventsLoading])

  // Load speakers and attendees counts
  useEffect(() => {
    const loadEventStats = async () => {
      try {
        // Fetch talks to count unique speakers
        const talksResponse = await apiClient.get<any[]>('/talks/')
        const eventTalks = talksResponse.data.filter((talk: any) => talk.event.toString() === id)
        const uniqueSpeakers = new Set(eventTalks.map((talk: any) => talk.speaker))
        setSpeakersCount(uniqueSpeakers.size)

        // Fetch attendees for this event
        try {
          const attendeesResponse = await apiClient.get(`/events/${id}/attendees/`)
          setAttendeesCount(attendeesResponse.data.length || 0)
        } catch (err) {
          // If attendees endpoint doesn't exist or returns error, check event.attendees
          if (event?.attendees) {
            setAttendeesCount(event.attendees)
          } else {
            setAttendeesCount(0)
          }
        }
      } catch (error) {
        console.error('Error loading event stats:', error)
        // Set to 0 on error
        setSpeakersCount(0)
        setAttendeesCount(0)
      }
    }

    if (id && !loading) {
      loadEventStats()
    }
  }, [id, loading, event])

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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Banner Section - Contained with rounded borders */}
      <div
        className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden"
        style={{
          backgroundImage: event.event_image
            ? `url(${getEventImageUrl(event.event_image)})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          {/* Management buttons - top right */}
          {canManageEvent && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <Link href={`/events/${id}/manage-sessions`}>
                <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                  Manage Sessions
                </Button>
              </Link>
              <Link href={`/events/${id}/manage-speakers`}>
                <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                  Manage Speakers
                </Button>
              </Link>
            </div>
          )}

          {/* Event Title and Info */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {event.name || event.title}
            </h1>

            {/* Event Tags */}
            <div className="flex flex-wrap gap-2">
              {event.tags && event.tags.length > 0 ? (
                event.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30"
                  >
                    {tag.name || `Tag ${tag.id}`}
                  </span>
                ))
              ) : (
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  Event
                </Badge>
              )}
            </div>

            {/* Quick Info Row */}
            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {event.date_range ?
                    (event.date_range.same_day ?
                      (getDateString(event.date_range.start))
                      :
                      `${getDateString(event.date_range.start)} - ${getDateString(event.date_range.end)}`
                    ) :
                    (event.date || 'TBA')
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {event.location
                    ? typeof event.location === 'string'
                      ? event.location
                      : `${event.location.city || ''}${event.location.country?.name ? `, ${event.location.country.name}` : ''}`.trim().replace(/^,\s*/, '') || 'TBA'
                    : 'TBA'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
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
                        <p className="text-sm text-muted-foreground">{getDateString(event.date_range.start)}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          From: {getDateString(event.date_range.start)}<br />
                          To: {getDateString(event.date_range.end)}
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
                          {getTimeString(event.date_range.start)} - {getTimeString(event.date_range.end)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Start: {getTimeString(event.date_range.start)}<br />
                          End: {getTimeString(event.date_range.end)}
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
              <span className="text-lg font-bold">{attendeesCount}</span>
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
              <span className="text-lg font-bold">{speakersCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Section */}
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
