"use client"

import { useState, useEffect, use, useMemo } from "react"
import Link from "next/link"
import { Building2, Globe, Mail, Calendar, ExternalLink, ChevronLeft, Clock, Loader2, MapPin, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { organizationApi, type OrganizationProfile } from "@/lib/api/organizationApi"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { getEventImageUrl, formatEventDateRange, isEventUpcoming, isEventPast } from "@/lib/utils/event-utils"
import { cn } from "@/lib/utils"

function isCFPOpen(cfp: OrganizationProfile["cfps"]): boolean {
    if (!cfp?.close_at) return false
    return new Date(cfp.close_at) > new Date()
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
    })
}

function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ─── Org Event Card ──────────────────────────────────────────────────────────
function OrgEventCard({ event }: { event: Event }) {
    const upcoming = isEventUpcoming(event)
    const past = isEventPast(event)
    const imageUrl = getEventImageUrl(event.event_image ?? undefined)

    return (
        <Link href={`/events/${event.slug}`} className="group block">
            <div className="rounded-xl border border-border overflow-hidden hover:border-white/20 transition-all duration-200 hover:shadow-md bg-card">
                {/* Image / placeholder */}
                <div className="relative h-36 w-full overflow-hidden bg-muted">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={event.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                        {event.cfp_open && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                CFP Open
                            </span>
                        )}
                        {upcoming && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                Upcoming
                            </span>
                        )}
                        {past && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                Past
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {event.title}
                    </h3>

                    {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {event.description}
                        </p>
                    )}

                    <div className="flex flex-col gap-1 pt-1">
                        {(event.start_date_time || event.end_date_time) && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                    {formatEventDateRange(event.start_date_time, event.end_date_time)}
                                </span>
                            </div>
                        )}
                        {(event.location || event.country) && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                    {[event.location, event.country].filter(Boolean).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

type Period = 'all' | 'upcoming' | 'past'

// ─── Org Events Section ───────────────────────────────────────────────────────
function OrgEventsSection({ ownerId }: { ownerId: string }) {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    // Filter state
    const [search, setSearch] = useState('')
    const [cfpOnly, setCfpOnly] = useState(false)
    const [period, setPeriod] = useState<Period>('all')

    useEffect(() => {
        eventsApi.getEvents()
            .then((res) => {
                const all: Event[] = Array.isArray(res) ? res : (res as any).results ?? []
                // Events are linked via submitted_by which stores the owner user ID
                const orgEvents = all.filter((e) => e.submitted_by === ownerId)
                setEvents(orgEvents)
            })
            .catch(() => setEvents([]))
            .finally(() => setLoading(false))
    }, [ownerId])

    // Derived filtered list — runs client-side, no extra API call
    const filtered = useMemo(() => {
        return events.filter((e) => {
            // Search: title or event_nickname
            if (search.trim()) {
                const q = search.toLowerCase()
                const matchesTitle = e.title?.toLowerCase().includes(q)
                const matchesNickname = e.event_nickname?.toLowerCase().includes(q)
                const matchesLocation = e.location?.toLowerCase().includes(q)
                const matchesCountry = e.country?.toLowerCase().includes(q)
                if (!matchesTitle && !matchesNickname && !matchesLocation && !matchesCountry) return false
            }
            // CFP filter
            if (cfpOnly && !e.cfp_open) return false
            // Period filter
            if (period === 'upcoming' && !isEventUpcoming(e)) return false
            if (period === 'past' && !isEventPast(e)) return false
            return true
        })
    }, [events, search, cfpOnly, period])

    const hasActiveFilters = search.trim() || cfpOnly || period !== 'all'

    if (loading) {
        return (
            <section>
                <h2 className="text-lg font-semibold mb-3">Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                        <div key={i} className="rounded-xl border border-border overflow-hidden animate-pulse">
                            <div className="h-36 bg-muted" />
                            <div className="p-4 space-y-2">
                                <div className="h-3.5 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (events.length === 0) return null

    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Events</h2>
                <span className="text-xs text-muted-foreground">
                    {filtered.length !== events.length
                        ? `${filtered.length} of ${events.length}`
                        : `${events.length}`
                    } event{events.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Filter bar */}
            <div className="space-y-3 mb-5">
                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search events by name, location…"
                        className="pl-8 pr-8 h-9 text-sm bg-muted/40 border-border/60 focus:border-border"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Period tabs + CFP toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Period pills */}
                    {(['all', 'upcoming', 'past'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium transition-all border',
                                period === p
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
                            )}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}

                    {/* Divider */}
                    <span className="w-px h-4 bg-border mx-0.5" />

                    {/* CFP Open toggle */}
                    <button
                        onClick={() => setCfpOnly(!cfpOnly)}
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5',
                            cfpOnly
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
                        )}
                    >
                        <Calendar className="h-3 w-3" />
                        CFP Open
                    </button>

                    {/* Clear all */}
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSearch(''); setCfpOnly(false); setPeriod('all') }}
                            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No events match your filters.</p>
                    <button
                        onClick={() => { setSearch(''); setCfpOnly(false); setPeriod('all') }}
                        className="mt-2 text-xs text-amber-500 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((event) => (
                        <OrgEventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </section>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [org, setOrg] = useState<OrganizationProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        organizationApi.getOrganization(id)
            .then(setOrg)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        )
    }

    if (notFound || !org) {
        return (
            <div className="container max-w-4xl mx-auto py-20 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Organization not found</h1>
                <p className="text-muted-foreground mb-6">This organization doesn't exist or hasn't been approved yet.</p>
                <Button asChild variant="outline">
                    <Link href="/organizations">Browse Organizations</Link>
                </Button>
            </div>
        )
    }

    const cfpOpen = isCFPOpen(org.cfps)
    const cfpPast = !cfpOpen && org.cfps?.close_at

    return (
        <div className="min-h-screen">
            {/* Back link */}
            <div className="container max-w-4xl mx-auto px-4 pt-6">
                <Link
                    href="/organizations"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Organizations
                </Link>
            </div>

            {/* Content */}
            <div className="container max-w-4xl mx-auto px-4 pt-8 pb-16">
                {/* Header — logo + name */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Logo avatar */}
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0 flex items-center justify-center">
                            {org.branding ? (
                                <img src={org.branding} alt={org.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-muted-foreground">
                                    {org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{org.name}</h1>
                                {org.status === 'active' && (
                                    <div title="Verified Organization" className="flex-shrink-0">
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="12" className="fill-amber-500" />
                                            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {org.website && (
                                    <a href={org.website} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        <Globe className="h-3.5 w-3.5" />
                                        {org.website.replace(/^https?:\/\//, "")}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {org.contact_email && (
                                    <a href={`mailto:${org.contact_email}`}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        <Mail className="h-3.5 w-3.5" />
                                        {org.contact_email}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        {org.description && (
                            <section>
                                <h2 className="text-lg font-semibold mb-3">About</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {org.description}
                                </p>
                            </section>
                        )}

                        {/* ── Events by this org ── */}
                        {org.owner && <OrgEventsSection ownerId={org.owner} />}

                        {/* CFP section */}
                        {org.cfps && (
                            <section>
                                <h2 className="text-lg font-semibold mb-3">Call for Proposals</h2>

                                <div className={cn(
                                    "rounded-xl border p-5",
                                    cfpOpen
                                        ? "border-white/10 bg-white/[0.03]"
                                        : "border-border bg-muted/20 opacity-60"
                                )}>
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold text-foreground">
                                                {cfpOpen ? "Open CFP" : "Closed CFP"}
                                            </span>
                                        </div>

                                        {cfpOpen && org.cfps.close_at && (
                                            <Badge className="bg-white/5 text-muted-foreground border-white/10 font-medium">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {daysUntil(org.cfps.close_at)} days left
                                            </Badge>
                                        )}
                                    </div>

                                    {org.cfps.description && (
                                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                            {org.cfps.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                        {org.cfps.open_at && (
                                            <span>Opens: <span className="font-medium text-foreground">{formatDate(org.cfps.open_at)}</span></span>
                                        )}
                                        {org.cfps.close_at && (
                                            <span>Closes: <span className="font-medium text-foreground">{formatDate(org.cfps.close_at)}</span></span>
                                        )}
                                    </div>

                                    {org.cfps.url && cfpOpen && (
                                        <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
                                            <a href={org.cfps.url} target="_blank" rel="noopener noreferrer">
                                                Submit a Proposal
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Quick info card */}
                        <div className="rounded-xl border border-border p-4 space-y-4">
                            <h3 className="font-semibold text-sm">Contact</h3>

                            {org.website && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                                    <a
                                        href={org.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-amber-500 hover:underline flex items-center gap-1"
                                    >
                                        {org.website.replace(/^https?:\/\//, "")}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {org.contact_email && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                    <a
                                        href={`mailto:${org.contact_email}`}
                                        className="text-sm hover:text-amber-500 transition-colors"
                                    >
                                        {org.contact_email}
                                    </a>
                                </div>
                            )}

                            {!org.website && !org.contact_email && (
                                <p className="text-xs text-muted-foreground">No contact info provided</p>
                            )}
                        </div>

                        {/* CFP status badge */}
                        {org.cfps && (
                            <div className={cn(
                                "rounded-xl border p-4 text-center",
                                cfpOpen ? "border-white/10 bg-white/[0.03]" : "border-border bg-muted/20"
                            )}>
                                <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-semibold text-foreground">
                                    {cfpOpen ? "CFP is Open" : "CFP Closed"}
                                </p>
                                {cfpOpen && org.cfps.close_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Closes {formatDate(org.cfps.close_at)}
                                    </p>
                                )}
                                {cfpOpen && org.cfps.url && (
                                    <Button asChild size="sm" variant="outline" className="w-full mt-3 border-white/10 hover:bg-white/5">
                                        <a href={org.cfps.url} target="_blank" rel="noopener noreferrer">
                                            Apply Now
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
