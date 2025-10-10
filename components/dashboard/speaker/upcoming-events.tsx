"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock, ExternalLink, CalendarPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpcomingEventsProps {
  limit?: number
}

interface Event {
  id: string
  name: string
  date: string
  time: string
  location: string
  session: string
  attendees: number
  status: string
  materials: string
}

export function UpcomingEvents({ limit }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real events from API
    const fetchEvents = async () => {
      try {
        // const response = await fetch('/api/speakers/upcoming-events')
        // const data = await response.json()
        // setEvents(data)
        
        // For now, showing empty state
        setEvents([])
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const displayEvents = limit ? events.slice(0, limit) : events

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your scheduled speaking engagements</CardDescription>
        </div>
        {limit && (
          <Link href="/dashboard/speaker/upcoming">
            <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <div key={event.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{event.name}</h3>
                      {event.status === "confirmed" && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Confirmed
                        </Badge>
                      )}
                      {event.status === "tentative" && (
                        <Badge variant="outline" className="border-orange-200 text-orange-700 dark:text-orange-400">
                          Tentative
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{event.session}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-orange-500" />
                        {event.time}
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1 text-orange-500" />
                      {event.attendees} expected attendees
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Add to Calendar
                    </Button>
                    {event.materials === "pending" && (
                      <Button size="sm" className="justify-start">
                        Upload Materials
                      </Button>
                    )}
                    {event.materials === "submitted" && (
                      <Button variant="outline" size="sm" className="justify-start">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Materials
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CalendarPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don&apos;t have any confirmed speaking engagements yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
