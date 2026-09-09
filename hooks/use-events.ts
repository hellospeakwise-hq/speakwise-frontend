'use client'

import { useState, useEffect, useCallback } from 'react'
import { eventsApi } from '@/lib/api/events'
import { type Event } from '@/lib/types/api'

interface UseEventsReturn {
    events: Event[]
    countries: { id: string; name: string; code: string }[]
    tags: { id: number; name: string; color?: string }[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useEvents(): UseEventsReturn {
    const [events, setEvents] = useState<Event[]>([])
    const [countries, setCountries] = useState<{ id: string; name: string; code: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const extractCountries = (evs: Event[]) => {
        const seen = new Set<string>()
        return evs
            .filter(e => e.country)
            .map(e => e.country!)
            .filter(c => { if (seen.has(c)) return false; seen.add(c); return true })
            .sort()
            .map(c => ({ id: c, name: c, code: c }))
    }

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true)
            setError(null)
            try {
                const eventsResponse = await eventsApi.getEvents()
                const evs = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || [])
                setEvents(evs)
                setCountries(extractCountries(evs))
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
        setLoading(true)
        setError(null)
        try {
            const eventsResponse = await eventsApi.getEvents()
            const evs = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || [])
            setEvents(evs)
            setCountries(extractCountries(evs))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events.')
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        events,
        countries,
        tags: [],
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
