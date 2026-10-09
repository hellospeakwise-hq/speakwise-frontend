'use client'

import { Calendar, MapPin, Clock, Globe, Send, ArrowLeft, ArrowUpRight, ExternalLink, TicketCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { formatDateFromMaybe, formatTimeFromMaybe, getEventImageUrl } from '@/lib/utils/event-utils'
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { useAuth } from "@/contexts/auth-context"
import { useEvents } from "@/hooks/use-events"
import Link from "next/link"

interface EventDetailsProps {
  id: string
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20 animate-pulse">
      <div className="h-3.5 w-28 bg-muted rounded mb-8" />
      <div className="h-60 bg-muted rounded-xl mb-8" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded mb-5" />
          {[100, 92, 96, 88, 80].map((w, i) => (
            <div key={i} className="h-3.5 bg-muted rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="hidden lg:block space-y-3 pt-1">
          <div className="h-36 w-full bg-muted rounded-xl" />
          <div className="h-24 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function EventDetails({ id }: EventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

        // For organizers: prefer the private route so pending/inactive events load correctly
        if (canManageEvent) {
          try {
            const data = await eventsApi.getPrivateEvent(id)
            setEvent(data)
            return
          } catch {
            // Fall through to public lookup if private route fails (e.g. not the owner)
          }
        }

        // Public path: try from cached list first, then fetch
        const eventFromList = allEvents.find(e => e.slug === id)
        if (eventFromList && !eventsLoading) {
          setEvent(eventFromList)
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
  }, [id, allEvents, eventsLoading, canManageEvent])

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

  const locationStr = event.location || ''

  const dateRange = [event.date_range?.start, event.date_range?.end]
    .filter((value): value is string => Boolean(value))
    .map(getDateString)
  const dateDisplay = dateRange.length
    ? [...new Set(dateRange)].join(' – ')
    : event.date || 'Date to be announced'

  const timeRange = [event.date_range?.start, event.date_range?.end]
    .filter((value): value is string => Boolean(value))
    .map(getTimeString)
    .filter(Boolean)
  const timeDisplay = timeRange.length
    ? [...new Set(timeRange)].join(' – ')
    : event.start_date_time
      ? new Date(event.start_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null

  const websiteUrl = (() => {
    if (!event.website) return null
    try {
      const url = new URL(event.website.startsWith('http') ? event.website : `https://${event.website}`)
      return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
    } catch {
      return null
    }
  })()
  const locationLabel = [locationStr, event.country].filter(Boolean).join(', ')
  const directionsUrl = locationLabel
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">

      {/* Hero */}
      <motion.div
        {...fadeUp(0)}
        className="relative h-64 md:h-[340px] w-full rounded-xl overflow-hidden mb-8"
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

        {/* CFP button in hero */}
        {event.cfp_open && (
          <div className="absolute top-4 right-4">
            <Link href={`/events/${id}/cfp`}>
              <button className="h-8 px-4 text-sm font-semibold bg-white text-slate-900 hover:bg-white/90 transition-colors rounded-md flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Submit CFP
              </button>
            </Link>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {dateDisplay}
            </span>
            {locationLabel && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {locationLabel}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.08)} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0 space-y-8">
          {event.description && (
            <section aria-labelledby="event-about">
              <h2 id="event-about" className="text-lg font-semibold tracking-tight">About this event</h2>
              <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {event.description}
              </p>
            </section>
          )}

          <section aria-labelledby="event-details">
            <h2 id="event-details" className="text-lg font-semibold tracking-tight">Event details</h2>
            <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Dates</dt>
                  <dd className="mt-1 text-sm font-medium">{dateDisplay}</dd>
                </div>
              </div>
              {timeDisplay && (
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Time</dt>
                    <dd className="mt-1 text-sm font-medium">{timeDisplay}</dd>
                  </div>
                </div>
              )}
              {locationLabel && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Location</dt>
                    <dd className="mt-1 text-sm font-medium">{locationLabel}</dd>
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        Get directions <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {event.is_free !== null && (
                <div className="flex gap-3">
                  <TicketCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Admission</dt>
                    <dd className="mt-1 text-sm font-medium">
                      {event.is_free
                        ? "Free — registration may be required"
                        : "Ticket required"}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {event.cfp_open && (
            <section className="rounded-xl border border-border bg-card p-5" aria-labelledby="cfp-heading">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="cfp-heading" className="font-semibold">Call for proposals</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.is_cfp_currently_open
                      ? "Share a talk idea with the event organizers."
                      : "This event isn't accepting proposals right now."}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  event.is_cfp_currently_open
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {event.is_cfp_currently_open ? "Open" : "Closed"}
                </span>
              </div>
              {event.cfp_deadline && (
                <p className="mt-4 text-sm">
                  <span className="text-muted-foreground">Deadline: </span>
                  <span className="font-medium">{getDateString(event.cfp_deadline)}</span>
                </p>
              )}
              {event.is_cfp_currently_open && (
                <Button asChild className="mt-5 w-full gap-2">
                  <Link href={`/events/${id}/cfp`}>
                    <Send className="h-4 w-4" />
                    Submit a proposal
                  </Link>
                </Button>
              )}
            </section>
          )}

          {websiteUrl && (
            <section className="rounded-xl border border-border bg-card p-5" aria-labelledby="event-website-heading">
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <h2 id="event-website-heading" className="font-semibold">Event website</h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{websiteUrl.host}</p>
                </div>
              </div>
              <Button asChild variant="outline" className="mt-4 w-full gap-2">
                <a href={websiteUrl.toString()} target="_blank" rel="noopener noreferrer">
                  Visit event website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </section>
          )}
        </aside>
      </motion.div>
    </div>
  )
}
