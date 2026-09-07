'use client'

import { Calendar, MapPin, Users, Clock, Globe, Send, Mic, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { formatDateFromMaybe, formatTimeFromMaybe, getEventImageUrl } from '@/lib/utils/event-utils'
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

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20 animate-pulse">
      <div className="h-3.5 w-28 bg-muted rounded mb-8" />
      <div className="h-60 bg-muted rounded-xl mb-8" />
      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded mb-5" />
          {[100, 92, 96, 88, 80].map((w, i) => (
            <div key={i} className="h-3.5 bg-muted rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="hidden lg:block space-y-3 pt-1">
          <div className="h-3 w-12 bg-muted rounded mb-5" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

export function EventDetails({ id }: EventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [speakersCount, setSpeakersCount] = useState<number>(0)
  const [attendeesCount, setAttendeesCount] = useState<number>(0)
  const { user } = useAuth()
  const { events: allEvents, loading: eventsLoading } = useEvents()
  const prefersReduced = useReducedMotion()

  const getDateString = (v?: string | null) => formatDateFromMaybe(v as any)
  const getTimeString = (v?: string | null) => formatTimeFromMaybe(v as any)
  const canManageEvent = user?.userType === 'organizer'

  const fadeUp = (delay = 0) => ({
    initial: prefersReduced ? {} : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
  })

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        const eventFromList = allEvents.find(e => e.slug === id)
        if (eventFromList && !eventsLoading) {
          setEvent(eventFromList)
          setLoading(false)
          return
        }
        if (!eventsLoading) {
          const data = await eventsApi.getEvent(id)
          setEvent(data)
        }
      } catch (err) {
        setEvent(null)
        if (err instanceof Error && err.message.includes('401')) {
          setError('Event details are not available. The event may require authentication to view.')
        } else {
          setError('Failed to load event details.')
        }
      } finally {
        if (!eventsLoading) setLoading(false)
      }
    }
    if (id) loadEvent()
  }, [id, allEvents, eventsLoading])

  useEffect(() => {
    const loadEventStats = async () => {
      try {
        const talksResponse = await apiClient.get<any[]>('/talks/')
        const raw = talksResponse.data
        const talks = Array.isArray(raw) ? raw : (raw as any)?.results ?? []
        const eventTalks = talks.filter((talk: any) => talk.event?.toString() === id)
        const uniqueSpeakers = new Set(eventTalks.map((talk: any) => talk.speaker))
        setSpeakersCount(uniqueSpeakers.size)
        try {
          const attendeesResponse = await apiClient.get(`/events/${id}/attendees/`)
          setAttendeesCount(attendeesResponse.data.length || 0)
        } catch {
          setAttendeesCount(0)
        }
      } catch {
        setSpeakersCount(0)
        setAttendeesCount(0)
      }
    }
    if (id && !loading) loadEventStats()
  }, [id, loading, event])

  if (loading) return <LoadingSkeleton />

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">{error || "Event not found"}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/events">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Events
          </Link>
        </Button>
      </div>
    )
  }

  const locationStr = event.location || 'TBA'
  const locationShort = event.location || 'TBA'

  const dateDisplay = event.date_range
    ? `${getDateString(event.date_range.start)} – ${getDateString(event.date_range.end)}`
    : event.date || 'TBA'

  const timeDisplay = event.date_range
    ? `${getTimeString(event.date_range.start)} – ${getTimeString(event.date_range.end)}`
    : event.start_date_time
      ? new Date(event.start_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'TBA'

  const tags = null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20">

      {/* Hero */}
      <motion.div
        {...fadeUp(0)}
        className="relative h-56 md:h-72 w-full rounded-xl overflow-hidden mb-8"
        style={{
          backgroundImage: event.event_image
            ? `url(${getEventImageUrl(event.event_image)})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: event.event_image ? undefined : 'hsl(var(--muted))',
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {canManageEvent && (
            <>
              <Link href={`/events/${id}/manage-sessions`}>
                <button className="h-7 px-3 text-xs bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-colors rounded-md">
                  Manage Sessions
                </button>
              </Link>
              <Link href={`/events/${id}/manage-speakers`}>
                <button className="h-7 px-3 text-xs bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-colors rounded-md">
                  Manage Speakers
                </button>
              </Link>
            </>
          )}
          {event.cfp_open && (
            <Link href={`/events/${id}/cfp`}>
              {event.cfp_open ? (
                <button className="h-8 px-4 text-sm font-semibold bg-white text-slate-900 hover:bg-white/90 transition-colors rounded-md flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Submit CFP
                </button>
              ) : (
                <button className="h-8 px-4 text-sm bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 rounded-md cursor-default" disabled>
                  CFP Closed
                </button>
              )}
            </Link>
          )}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-white/75">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {dateDisplay}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {locationShort}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 items-start">

        {/* Left: About + Details + Talks */}
        <motion.div {...fadeUp(0.08)}>

          {/* About */}
          <div>
            <p className="text-sm font-semibold mb-3">About</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description || 'No description available.'}
            </p>
          </div>

          <div className="border-t border-border my-6" />

          {/* Event Details */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Event details</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <dt className="text-[11px] text-muted-foreground/70 mb-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Date
                </dt>
                <dd className="text-sm font-medium">{dateDisplay}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground/70 mb-0.5 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Time
                </dt>
                <dd className="text-sm font-medium">{timeDisplay}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground/70 mb-0.5 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Location
                </dt>
                <dd className="text-sm font-medium">{locationStr}</dd>
              </div>
              {event.website && (
                <div>
                  <dt className="text-[11px] text-muted-foreground/70 mb-0.5 flex items-center gap-1.5">
                    <Globe className="h-3 w-3" /> Website
                  </dt>
                  <dd>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline underline-offset-2"
                    >
                      {event.website.replace(/^https?:\/\//, '')}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="border-t border-border my-6" />

          {/* Talks */}
          <div>
            <p className="text-sm font-semibold mb-1">Talks</p>
            <p className="text-xs text-muted-foreground mb-5">Speakers and their sessions — leave feedback after each talk</p>
            <EventSessions eventId={id} />
          </div>
        </motion.div>

        {/* Right: Sticky sidebar */}
        <motion.aside {...fadeUp(0.12)} className="mt-10 lg:mt-0 lg:sticky lg:top-6">
          <p className="text-xs text-muted-foreground mb-4">Stats</p>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Attendees
              </dt>
              <dd className="text-sm font-semibold tabular-nums">{attendeesCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground flex items-center gap-2">
                <Mic className="h-3.5 w-3.5" />
                Speakers
              </dt>
              <dd className="text-sm font-semibold tabular-nums">{speakersCount}</dd>
            </div>
          </dl>

          {event.cfp_open && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">CFP is open</p>
              <Link href={`/events/${id}/cfp`}>
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 h-9 text-sm gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Submit a Proposal
                </Button>
              </Link>
            </div>
          )}
        </motion.aside>
      </div>
    </div>
  )
}
