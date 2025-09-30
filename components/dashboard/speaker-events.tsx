import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"

interface SpeakerEventsProps {
  type: "upcoming" | "past"
}

export function SpeakerEvents({ type }: SpeakerEventsProps) {
  // Sample data - in a real app, this would come from an API
  const upcomingEvents = [
    {
      id: "1",
      name: "TechConf 2025",
      date: "June 15-17, 2025",
      location: "San Francisco, USA",
      session: "The Future of Generative AI",
      time: "June 15, 10:00 AM - 11:30 AM",
      attendees: 1200,
      rating: 4.8,
      reviews: 45,
    },
    {
      id: "2",
      name: "AI Summit",
      date: "July 8-10, 2025",
      location: "London, UK",
      session: "Ethical Considerations in AI Development",
      time: "July 9, 2:00 PM - 3:30 PM",
      attendees: 800,
      rating: 4.6,
      reviews: 32,
    },
  ]

  const pastEvents = [
    {
      id: "3",
      name: "Global ML Conference",
      date: "November 5-7, 2023",
      location: "London, UK",
      session: "The Future of Neural Networks",
      time: "November 6, 11:00 AM - 12:30 PM",
      attendees: 950,
      rating: 4.8,
      reviews: 45,
    },
    {
      id: "4",
      name: "AI in Healthcare Summit",
      date: "September 20-22, 2023",
      location: "Boston, USA",
      session: "AI Applications in Medical Diagnostics",
      time: "September 21, 9:30 AM - 11:00 AM",
      attendees: 750,
      rating: 4.9,
      reviews: 31,
    },
    {
      id: "5",
      name: "DevConf 2023",
      date: "August 15-17, 2023",
      location: "Berlin, Germany",
      session: "Building Responsible AI Systems",
      time: "August 16, 3:00 PM - 4:30 PM",
      attendees: 1100,
      rating: 4.7,
      reviews: 52,
    },
  ]

  const events = type === "upcoming" ? upcomingEvents : pastEvents

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "upcoming" ? "Upcoming Events" : "Past Events"}</CardTitle>
        <CardDescription>
          {type === "upcoming" ? "Your scheduled speaking engagements" : "Your previous speaking engagements"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">{event.name}</h3>
                    <p className="text-sm font-medium text-primary">{event.session}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.attendees} attendees
                      </div>
                    </div>
                  </div>

                  {type === "upcoming" ? (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                      <Button variant="outline" size="sm">
                        Prepare Materials
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="font-medium">{event.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({event.reviews} reviews)</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Feedback
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No {type} events found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
