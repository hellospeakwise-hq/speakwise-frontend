'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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

const extractCountries = (evs: Event[]) => {
    const seen = new Set<string>()
    return evs
        .filter(e => e.country)
        .map(e => e.country!)
        .filter(c => { if (seen.has(c)) return false; seen.add(c); return true })
        .sort()
        .map(c => ({ id: c, name: c, code: c }))
}

export function useEvents(): UseEventsReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['events', 'public-catalog'],
        queryFn: async () => {
            const eventsResponse = await eventsApi.getEvents()
            return Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.results || [])
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        gcTime: 30 * 60 * 1000,   // Keep in cache for 30 minutes
    })

    const events = data || []
    const countries = useMemo(() => extractCountries(events), [events])

    return {
        events,
        countries,
        tags: [],
        loading: isLoading,
        error: error instanceof Error ? error.message : error ? 'Failed to load events.' : null,
        refetch: () => { refetch() }
    }
}

interface UseEventReturn {
    event: Event | null
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useEvent(id: string): UseEventReturn {
    const { data: event, isLoading, error, refetch } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            if (!id) return null
            return await eventsApi.getEvent(id)
        },
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    })

    return {
        event: event || null,
        loading: isLoading,
        error: error instanceof Error ? error.message : error ? 'Failed to load event.' : null,
        refetch: () => { refetch() }
    }
}
