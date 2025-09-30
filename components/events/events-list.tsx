"use client"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, ImageIcon, Loader2 } from "lucide-react"
import { useMemo } from "react"
import { useEvents } from "@/hooks/use-events"
import { useAuth } from "@/contexts/auth-context"
import type { Event } from "@/lib/types/api"

interface EventsListProps {
    countryFilter?: number[]
    tagFilter?: number | null
}

export function EventsList({ countryFilter, tagFilter }: EventsListProps) {
    const { events, loading, error } = useEvents()

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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-muted-foreground">Loading events...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
                            {/* Event Image Section */}
                            <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                                {event.event_image ? (
                                    <Image
                                        src={event.event_image}
                                        alt={`${event.name || event.title} flyer`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Card Header */}
                            <div className="flex flex-col space-y-1.5 p-6">
                                <h3 className="text-2xl font-semibold leading-none tracking-tight line-clamp-2">
                                    {event.name || event.title}
                                </h3>
                                <div className="text-sm text-muted-foreground">
                                    <div className="flex items-center mt-2">
                                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                        <span className="text-xs">
                                            {event.date_range ? (
                                                event.date_range.same_day ?
                                                    `${event.date_range.start?.date}` :
                                                    `${event.date_range.start?.date} - ${event.date_range.end?.date}`
                                            ) : (event.date || 'Date TBD')}
                                        </span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                        <span className="text-xs">
                                            {event.location 
                                                ? typeof event.location === 'string' 
                                                    ? event.location
                                                    : `${event.location.venue || ''}${event.location.city ? `, ${event.location.city}` : ''}${event.location.country?.name ? `, ${event.location.country.name}` : ''}`.trim().replace(/^,\s*/, '') || 'Location TBD'
                                                : 'Location TBD'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 pt-0 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {event.short_description || event.description || 'No description available.'}
                                </p>

                                {/* Tags */}
                                {event.tags && event.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {event.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${tag.color}33`, // Add transparency
                                                    color: tag.color,
                                                    border: `1px solid ${tag.color}`
                                                }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1 text-orange-500" />
                                        <span className="text-xs text-muted-foreground">
                                            Event
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {event.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center p-6 pt-0">
                                <Link href={`/events/${event.id}`} className="w-full">
                                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400">
                                        View Event
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
