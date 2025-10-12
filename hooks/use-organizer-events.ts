'use client'

import { useState, useEffect, useCallback } from 'react'
import { eventsApi } from '@/lib/api/events'
import { type Event } from '@/lib/types/api'
import { attendeeAPI } from '@/lib/api/attendeeApi'

interface UseOrganizerEventsReturn {
    events: Event[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    createEvent: (data: any) => Promise<Event>
    updateEvent: (id: number, data: any) => Promise<Event>
    deleteEvent: (id: number) => Promise<void>
    toggleEventStatus: (id: number, isActive: boolean) => Promise<Event>
    refreshAttendeeStats: () => Promise<void>
    stats: {
        totalEvents: number
        upcomingEvents: number
        pastEvents: number
        totalAttendees: number
        avgRating: number
        feedbackRate: number
    }
}

export function useOrganizerEvents(): UseOrganizerEventsReturn {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalAttendees, setTotalAttendees] = useState(0)

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await eventsApi.getEvents()
            const data = Array.isArray(response) ? response : (response.results ?? [])
            setEvents(data)
            
            // Calculate total attendees across all events
            await calculateTotalAttendees(data)
        } catch (err) {
            console.error('Error fetching organizer events:', err)
            setError('Failed to load events. Please check if the backend is running.')
        } finally {
            setLoading(false)
        }
    }, [])

    const calculateTotalAttendees = async (eventsList: Event[]) => {
        try {
            let total = 0
            
            // Get attendees for each event
            for (const event of eventsList) {
                try {
                    const attendees = await attendeeAPI.getAttendanceEmailsByEvent(event.id)
                    total += attendees.length
                } catch (err) {
                    console.warn(`Failed to get attendees for event ${event.id}:`, err)
                }
            }
            
            setTotalAttendees(total)
        } catch (err) {
            console.error('Error calculating total attendees:', err)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const createEvent = async (data: any): Promise<Event> => {
        try {
            const newEvent = await eventsApi.createEvent(data)
            setEvents(prevEvents => [...prevEvents, newEvent])
            return newEvent
        } catch (error) {
            console.error('Error creating event:', error)
            throw error
        }
    }

    const updateEvent = async (id: number, data: any): Promise<Event> => {
        try {
            const updatedEvent = await eventsApi.updateEvent(id.toString(), data)
            setEvents(prevEvents => 
                prevEvents.map(event => 
                    event.id === id ? updatedEvent : event
                )
            )
            return updatedEvent
        } catch (error) {
            console.error('Error updating event:', error)
            throw error
        }
    }

    const deleteEvent = async (id: number): Promise<void> => {
        try {
            await eventsApi.deleteEvent(id.toString())
            setEvents(prevEvents => prevEvents.filter(event => event.id !== id))
        } catch (error) {
            console.error('Error deleting event:', error)
            throw error
        }
    }

    const toggleEventStatus = async (id: number, isActive: boolean): Promise<Event> => {
        try {
            const updatedEvent = await eventsApi.updateEvent(id.toString(), { is_active: isActive })
            setEvents(prevEvents => 
                prevEvents.map(event => 
                    event.id === id ? updatedEvent : event
                )
            )
            return updatedEvent
        } catch (error) {
            console.error('Error toggling event status:', error)
            throw error
        }
    }

    // Calculate stats from events data
    const stats = {
        totalEvents: events.length,
        upcomingEvents: events.filter(event => {
            if (!event.start_date_time) return false
            return new Date(event.start_date_time) > new Date()
        }).length,
        pastEvents: events.filter(event => {
            if (!event.end_date_time) return false
            return new Date(event.end_date_time) < new Date()
        }).length,
        totalAttendees: totalAttendees, // Use calculated total from attendance emails
        avgRating: 4.7, // This would come from feedback API in real implementation
        feedbackRate: 68, // This would come from feedback API in real implementation
    }

    const refreshAttendeeStats = async () => {
        await calculateTotalAttendees(events)
    }

    return {
        events,
        loading,
        error,
        refetch: fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        toggleEventStatus,
        refreshAttendeeStats,
        stats
    }
}
