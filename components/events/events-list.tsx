"use client"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, ImageIcon, Loader2, LayoutGrid, List } from "lucide-react"
import { useMemo, useState } from "react"
import type { DateTimeInfo } from "@/lib/types/api"
import { formatDateFromMaybe } from '@/lib/utils/event-utils'
import { getEventImageUrl } from '@/lib/utils/event-utils'
import { useEvents } from "@/hooks/use-events"
import type { Event } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


interface EventsListProps {
    countryFilter?: string[]
    tagFilter?: number | null
}

type ViewMode = "grid" | "list"

export function EventsList({ countryFilter, tagFilter }: EventsListProps) {
    const { events, loading, error } = useEvents()
    const [viewMode, setViewMode] = useState<ViewMode>("grid")

    // Filter events based on country and tags
    const filteredEvents = useMemo(() => {
        if ((!countryFilter || countryFilter.length === 0) && !tagFilter) {
            return events
        }

        return events.filter(event => {
            let matchesCountry = true;
            let matchesTag = true;

            // Apply country filter
            if (countryFilter && countryFilter.length > 0 && typeof event.location === 'object' && event.location?.country) {
                matchesCountry = countryFilter.includes(event.location.country.id);
            }

            // Apply tag filter
            if (tagFilter) {
                matchesTag = event.tags?.some(tag => tag.id === tagFilter) || false;
            }

            return matchesCountry && matchesTag;
        })
    }, [events, countryFilter, tagFilter])

    const getDateString = (val?: string | DateTimeInfo | null) => formatDateFromMaybe(val as any)

    const getLocationString = (event: Event) => {
        if (!event.location) return 'Location TBD'
        if (typeof event.location === 'string') return event.location
        const parts = [
            event.location.venue,
            event.location.city,
            event.location.country?.name,
        ].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : 'Location TBD'
    }

    const getDateRangeString = (event: Event) => {
        if (event.date_range) {
            if (event.date_range.same_day) {
                return getDateString(event.date_range.start)
            }
            return `${getDateString(event.date_range.start)} - ${getDateString(event.date_range.end)}`
        }
        return event.date || 'Date TBD'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-muted-foreground">Loading events...</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">{error}</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredEvents.length} events
                    {filteredEvents.length === 0 && !loading && " (No events found)"}
                    {((countryFilter && countryFilter.length > 0) || tagFilter) && ` (filtered)`}
                </p>
                <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1">
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        className={`h-7 w-7 rounded-lg ${viewMode === "grid" ? "bg-foreground text-background shadow-sm hover:bg-foreground/90" : "hover:bg-muted"}`}
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="icon"
                        className={`h-7 w-7 rounded-lg ${viewMode === "list" ? "bg-foreground text-background shadow-sm hover:bg-foreground/90" : "hover:bg-muted"}`}
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                    >
                        <List className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {filteredEvents.length === 0 && !loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {((countryFilter && countryFilter.length > 0) || tagFilter)
                            ? "No events found matching the selected filters."
                            : "No events available at the moment."
                        }
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                /* ========== GRID VIEW ========== */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredEvents.map((event) => {
                        const title = event.name || event.title
                        const dateStr = getDateRangeString(event)
                        const location = getLocationString(event)

                        return (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="group block rounded-3xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {/* Image — inset with padding, rounded corners */}
                                <div className="p-3 pb-0">
                                    <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                                        {event.event_image ? (
                                            <img
                                                src={getEventImageUrl(event.event_image)}
                                                alt={`${title} flyer`}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                onError={(e) => {
                                                    const target = e.currentTarget
                                                    target.style.display = 'none'
                                                    target.nextElementSibling?.removeAttribute('hidden')
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="flex h-full items-center justify-center"
                                            hidden={!!event.event_image}
                                        >
                                            <ImageIcon className="h-10 w-10 text-zinc-400" />
                                        </div>

                                        {/* Active pill — top right of image */}
                                        {event.is_active && (
                                            <span className="absolute top-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                                Active
                                            </span>
                                        )}

                                        {/* Date badge — bottom left of image */}
                                        <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:bg-zinc-900/90">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                                <Calendar className="h-3 w-3 shrink-0" />
                                                <span className="leading-none">{dateStr}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-4 pt-3">
                                    {/* Tags */}
                                    {event.tags && event.tags.length > 0 && (
                                        <div className="mb-2 flex flex-wrap gap-1">
                                            {event.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                    style={{
                                                        backgroundColor: `${tag.color}18`,
                                                        color: tag.color,
                                                        border: `1px solid ${tag.color}40`,
                                                    }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
                                        {title}
                                    </h3>

                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{location}</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                /* ========== LIST VIEW ========== */
                <div className="space-y-3">
                    {filteredEvents.map((event) => (
                        <Link
                            key={event.id}
                            href={`/events/${event.slug}`}
                            className="block group"
                        >
                            <div className="flex items-stretch rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-orange-200 dark:hover:border-orange-800 overflow-hidden">
                                {/* Image thumbnail */}
                                <div className="relative w-32 sm:w-44 shrink-0 bg-gray-100 dark:bg-gray-800">
                                    {event.event_image ? (
                                        <Image
                                            src={getEventImageUrl(event.event_image) || '/fallback.jpg'}
                                            alt={`${event.name || event.title} flyer`}
                                            fill
                                            className="object-cover"
                                            sizes="176px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full min-h-[100px]">
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {event.name || event.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1 hidden sm:block">
                                                {event.short_description || event.description || 'No description available.'}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={event.is_active ? "default" : "secondary"}
                                            className={`shrink-0 text-[10px] ${event.is_active ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : ""}`}
                                        >
                                            {event.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                            <span>{getDateRangeString(event)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-orange-500" />
                                            <span className="truncate max-w-[200px]">{getLocationString(event)}</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {event.tags && event.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {event.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                                                    style={{
                                                        backgroundColor: `${tag.color}20`,
                                                        color: tag.color,
                                                        border: `1px solid ${tag.color}40`
                                                    }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                            {event.tags.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    +{event.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
