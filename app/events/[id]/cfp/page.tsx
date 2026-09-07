'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, FileText } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { eventsApi } from '@/lib/api/events'
import { useAuth } from '@/contexts/auth-context'
import type { Event } from '@/lib/types/api'
import { MarkdownContent } from '@/components/ui/markdown-content'

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysRemaining(iso: string): number | null {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  return days > 0 ? days : null
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20 animate-pulse">
      <div className="h-3.5 w-28 bg-muted rounded mb-10" />
      <div className="h-7 w-1/2 bg-muted rounded mb-2" />
      <div className="h-3 w-24 bg-muted rounded mb-12" />
      <div className="lg:grid lg:grid-cols-[1fr_232px] lg:gap-16">
        <div className="space-y-3">
          {[100, 92, 96, 88, 95, 80].map((w, i) => (
            <div key={i} className="h-3.5 bg-muted rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="hidden lg:block space-y-3 pt-1">
          <div className="h-3 w-16 bg-muted rounded mb-5" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-28 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

export default function CFPLandingPage() {
  const { id: slug } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    eventsApi.getEvent(slug)
      .then(setEvent)
      .catch(() => router.push(`/events/${slug}`))
      .finally(() => setLoading(false))
  }, [slug, router])

  const handleSubmitClick = () => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', `/events/${slug}/cfp/submit`)
      }
      router.push('/signin')
      return
    }
    router.push(`/events/${slug}/cfp/submit`)
  }

  const fadeUp = (delay = 0) => ({
    initial: prefersReduced ? {} : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
  })

  if (loading) return <LoadingSkeleton />
  if (!event) return null

  if (!event.cfp_open) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-4">
        <FileText className="h-9 w-9 text-muted-foreground/30" />
        <h1 className="text-xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">This event is not currently accepting talk proposals.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/events/${slug}`}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to event
          </Link>
        </Button>
      </div>
    )
  }

  const hasDates = event.cfp_open_date || event.cfp_deadline || event.cfp_speaker_notification_date
  const daysLeft = event.cfp_deadline && event.cfp_open ? daysRemaining(event.cfp_deadline) : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24">

        {/* Back link */}
        <motion.div {...fadeUp(0)} className="mb-10">
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {event.title}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div {...fadeUp(0.06)} className="mb-10">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  event.cfp_open ? 'bg-green-500' : 'bg-muted-foreground/30'
                }`}
              />
              {event.cfp_open ? 'CFP Open' : 'CFP Closed'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Call for Proposals</p>
        </motion.div>

        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_232px] lg:gap-16 items-start">

          {/* Left: description prose */}
          <motion.div {...fadeUp(0.1)}>
            {event.description ? (
              <MarkdownContent content={event.description} />
            ) : (
              <p className="text-sm text-muted-foreground">No description has been provided for this CFP.</p>
            )}
          </motion.div>

          {/* Right: sticky sidebar */}
          <motion.aside
            {...fadeUp(0.14)}
            className="mt-12 lg:mt-0 lg:sticky lg:top-6"
          >
            {/* Key dates */}
            {hasDates && (
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-xs text-muted-foreground mb-4">Key dates</p>
                <dl className="space-y-4">
                  {event.cfp_open_date && (
                    <div>
                      <dt className="text-[11px] text-muted-foreground/70 mb-0.5">Opens</dt>
                      <dd className="text-sm font-medium">{formatDate(event.cfp_open_date)}</dd>
                    </div>
                  )}
                  {event.cfp_deadline && (
                    <div>
                      <dt className="text-[11px] text-muted-foreground/70 mb-0.5">Closes</dt>
                      <dd className="text-sm font-medium">{formatDate(event.cfp_deadline)}</dd>
                    </div>
                  )}
                  {event.cfp_speaker_notification_date && (
                    <div>
                      <dt className="text-[11px] text-muted-foreground/70 mb-0.5">Notifications</dt>
                      <dd className="text-sm font-medium">{formatDate(event.cfp_speaker_notification_date)}</dd>
                    </div>
                  )}
                </dl>

                {daysLeft && (
                  <p className="text-xs text-muted-foreground mt-5">
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {event.cfp_open ? (
                <Button
                  className="w-full bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-transform"
                  onClick={handleSubmitClick}
                >
                  <Send className="h-3.5 w-3.5 mr-2" />
                  Submit a proposal
                </Button>
              ) : (
                <Button disabled className="w-full">
                  CFP is closed
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/speaker/cfp">
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  My proposals
                </Link>
              </Button>
            </div>
          </motion.aside>

        </div>
      </div>
    </div>
  )
}
