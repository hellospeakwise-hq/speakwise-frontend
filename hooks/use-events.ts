'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchEvents, fetchEventById, extractCountriesFromEvents, extractTagsFromEvents, type Event } from '@/lib/api/events'

interface UseEventsReturn {
    events: Event[]
    countries: Array<{id: number; name: string; code: string}>
    tags: Array<{id: number; name: string; color?: string}>
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

    const fetchAllData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Fetch events only - countries and tags will be extracted from events data
            const eventsData = await fetchEvents()
            
            // Set events data
            setEvents(eventsData)
            
            // Extract countries and tags from the events data
            const extractedCountries = extractCountriesFromEvents(eventsData)
            const extractedTags = extractTagsFromEvents(eventsData)
            
            setCountries(extractedCountries)
            setTags(extractedTags)

        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load events. Please check if the backend is running.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    return {
        events,
        countries,
        tags,
        loading,
        error,
        refetch: fetchAllData
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

    const fetchEventData = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await fetchEventById(parseInt(id))
            setEvent(data)
        } catch (err) {
            console.error('Error fetching event:', err)
            setEvent(null)
            setError('Failed to load event. Please check if the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchEventData()
        }
    }, [id])

    return {
        event,
        loading,
        error,
        refetch: () => { fetchEventData() }
    }
}
