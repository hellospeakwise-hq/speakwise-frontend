'use client'

import { useState, useEffect, useCallback } from 'react'
import { eventsApi } from '@/lib/api/events'
import { type Event, type Country, type Tag } from '@/lib/types/api'

interface UseEventsReturn {
    events: Event[]
    countries: Country[]
    tags: Tag[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useEvents(): UseEventsReturn {
    const [events, setEvents] = useState<Event[]>([])
    const [countries, setCountries] = useState<Array<{id: number; name: string; code: string}>>([])
    const [tags, setTags] = useState<Array<{id: number; name: string; color?: string}>>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true)
            setError(null)

            try {
                // Fetch events data once
                const eventsResponse = await eventsApi.getEvents()
                // Handle both paginated response (results) and direct array response
                const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || [])
                
                // Set events data
                setEvents(events)
                
                // Extract unique countries from events
                const countryMap = new Map<number, {id: number; name: string; code: string}>()
                events.forEach(event => {
                    if (event.location && typeof event.location === 'object' && event.location.country) {
                        const country = event.location.country
                        countryMap.set(country.id, {
                            id: country.id,
                            name: country.name,
                            code: country.code
                        })
                    }
                })
                
                // Extract unique tags from events
                const tagMap = new Map<number, {id: number; name: string; color?: string}>()
                events.forEach(event => {
                    if (event.tags && Array.isArray(event.tags)) {
                        event.tags.forEach(tag => {
                            tagMap.set(tag.id, {
                                id: tag.id,
                                name: tag.name,
                                color: tag.color
                            })
                        })
                    }
                })
                
                // Set extracted data
                setCountries(Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
                setTags(Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name)))

            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'Failed to load events. Please check if the backend is running.')
            } finally {
                setLoading(false)
            }
        }

        fetchAllData()
    }, [])

    const refetch = useCallback(async () => {
        // For refetch, we can create a simple version
        setLoading(true)
        setError(null)
        try {
            const eventsResponse = await eventsApi.getEvents()
            const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || [])
            setEvents(events)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events.')
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        events,
        countries,
        tags,
        loading,
        error,
        refetch
    }
}

interface UseEventReturn {
    event: Event | null
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useEvent(id: string): UseEventReturn {
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEventData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await eventsApi.getEvent(id)
            setEvent(data)
        } catch (err) {
            console.error('Error fetching event:', err)
            setEvent(null)
            setError('Failed to load event. Please check if the backend is running.')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchEventData()
        }
    }, [id, fetchEventData])

    return {
        event,
        loading,
        error,
        refetch: () => { fetchEventData() }
    }
}
