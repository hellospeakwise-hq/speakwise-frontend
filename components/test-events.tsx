'use client'

import { useEvents } from '@/hooks/use-events'

export function TestEvents() {
    const { events, loading, error } = useEvents()

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <h2>Events Test</h2>
            <p>Found {events.length} events</p>
            {events.map(event => (
                <div key={event.id}>
                    <h3>{event.title}</h3>
                    <p>{event.location}</p>
                </div>
            ))}
        </div>
    )
}
