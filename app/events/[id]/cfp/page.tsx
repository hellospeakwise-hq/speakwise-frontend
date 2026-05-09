'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Send, FileText, Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { eventsApi } from '@/lib/api/events'
import { useAuth } from '@/contexts/auth-context'
import type { Event } from '@/lib/types/api'
import { MarkdownContent } from '@/components/ui/markdown-content'

function formatDate(iso: string | null) {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

export default function CFPLandingPage() {
    const { id: slug } = useParams<{ id: string }>()
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!event) return null

    if (!event.accepts_cfp) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-muted-foreground">This event is not currently accepting talk proposals.</p>
                <Button variant="outline" asChild>
                    <Link href={`/events/${slug}`}><ArrowLeft className="h-4 w-4 mr-2" />Back to event</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Back link */}
            <div className="max-w-3xl mx-auto px-4 pt-6">
                <Link
                    href={`/events/${slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {event.title}
                </Link>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-3xl font-bold">{event.title}</h1>
                        {event.cfp_open ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/30">CFP Open</Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">CFP Closed</Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Welcome to the official Call for Proposals for{' '}
                        <span className="font-semibold text-foreground">{event.title}</span>
                    </p>
                </div>

                {/* CFP Description */}
                {event.cfp_description && (
                    <MarkdownContent content={event.cfp_description} />
                )}

                {/* Key Dates */}
                {(event.cfp_open_date || event.cfp_deadline || event.cfp_speaker_notification_date) && (
                    <div className="border rounded-xl p-6 space-y-4 bg-muted/30">
                        <h2 className="font-semibold text-lg">Key Dates</h2>
                        <div className="space-y-3">
                            {event.cfp_open_date && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-green-500 shrink-0" />
                                    <span className="text-muted-foreground">CFP Opens:</span>
                                    <span className="font-medium">{formatDate(event.cfp_open_date)}</span>
                                </div>
                            )}
                            {event.cfp_deadline && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                                    <span className="text-muted-foreground">CFP Closes:</span>
                                    <span className="font-medium">{formatDate(event.cfp_deadline)}</span>
                                </div>
                            )}
                            {event.cfp_speaker_notification_date && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Bell className="h-4 w-4 text-blue-500 shrink-0" />
                                    <span className="text-muted-foreground">Speaker Notifications:</span>
                                    <span className="font-medium">{formatDate(event.cfp_speaker_notification_date)}</span>
                                </div>
                            )}
                        </div>

                        {/* Countdown if deadline is set */}
                        {event.cfp_deadline && event.cfp_open && (() => {
                            const msLeft = new Date(event.cfp_deadline).getTime() - Date.now()
                            const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
                            if (daysLeft <= 0) return null
                            return (
                                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                    Submissions close in {daysLeft} day{daysLeft !== 1 ? 's' : ''}.
                                </p>
                            )
                        })()}
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        asChild
                        variant="outline"
                        className="sm:flex-1"
                    >
                        <Link href="/dashboard/speaker/cfp">
                            <FileText className="h-4 w-4 mr-2" />
                            View my proposals
                        </Link>
                    </Button>

                    {event.cfp_open ? (
                        <Button
                            className="sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                            onClick={handleSubmitClick}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Submit a proposal
                        </Button>
                    ) : (
                        <Button disabled className="sm:flex-1 rounded-full">
                            CFP is currently closed
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
