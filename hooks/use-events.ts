'use client'

import { useState, useEffect } from 'react'
import { fetchEvents, fetchEventById, type Event } from '@/lib/api/events'

interface UseEventsReturn {
    events: Event[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useEvents(): UseEventsReturn {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEventsData = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await fetchEvents()
            setEvents(data)
        } catch (err) {
            console.error('Error fetching events:', err)
            setError('Failed to load events. Please check if the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEventsData()
    }, [])

    return {
        events,
        loading,
        error,
        refetch: () => { fetchEventsData() }
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
