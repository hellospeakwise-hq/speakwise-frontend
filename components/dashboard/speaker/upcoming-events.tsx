import Link from "next/link"
import { Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpcomingEventsProps {
  limit?: number
}

export function UpcomingEvents({ limit }: UpcomingEventsProps) {
  // Sample data - in a real app, this would come from an API
  const events = [
    {
      id: "1",
      name: "TechConf 2025",
      date: "June 15-17, 2025",
      time: "10:00 AM - 11:30 AM",
      location: "Moscone Center, San Francisco, USA",
      session: "The Future of Generative AI",
      attendees: 1200,
      status: "confirmed",
      materials: "pending",
    },
    {
      id: "2",
      name: "AI Summit",
      date: "July 8-10, 2025",
      time: "2:00 PM - 3:30 PM",
      location: "ExCeL London, UK",
      session: "Ethical Considerations in AI Development",
      attendees: 800,
      status: "confirmed",
      materials: "pending",
    },
    {
      id: "3",
      name: "DevCon Europe",
      date: "August 22-24, 2025",
      time: "11:00 AM - 12:30 PM",
      location: "Messe Berlin, Germany",
      session: "Building Responsible AI Systems",
      attendees: 950,
      status: "tentative",
      materials: "not-required",
    },
    {
      id: "4",
      name: "Women in Tech Summit",
      date: "September 5-7, 2025",
      time: "9:30 AM - 11:00 AM",
      location: "Javits Center, New York, USA",
      session: "Leading AI Research Teams",
      attendees: 650,
      status: "confirmed",
      materials: "pending",
    },
    {
      id: "5",
      name: "Global AI Conference",
      date: "October 12-14, 2025",
      time: "3:00 PM - 4:30 PM",
      location: "Marina Bay Sands, Singapore",
      session: "Next Generation Neural Networks",
      attendees: 1100,
      status: "confirmed",
      materials: "submitted",
    },
  ]

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
            <div className="text-center py-6">
              <p className="text-muted-foreground">No upcoming events found</p>
            </div>
          )}
        </div>
      </CardContent>
      {!limit && (
        <CardFooter>
          <Button className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Sync with Calendar
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
