import { Calendar, MapPin, Users, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function SpeakingRequests() {
  // Sample data - in a real app, this would come from an API
  const requests = [
    {
      id: "1",
      eventName: "DevConf 2025",
      organization: "DevConf Inc.",
      contactName: "John Smith",
      contactEmail: "john@devconf.example.com",
      date: "November 15-17, 2025",
      location: "Berlin, Germany",
      suggestedTopic: "The Future of AI in Software Development",
      audienceSize: "500-1000",
      status: "pending",
      receivedDate: "May 15, 2025",
      isNew: true,
    },
    {
      id: "2",
      eventName: "Women in Tech Summit",
      organization: "WIT Foundation",
      contactName: "Emily Johnson",
      contactEmail: "emily@witsummit.example.com",
      date: "September 5-7, 2025",
      location: "New York, USA",
      suggestedTopic: "Leading AI Research Teams",
      audienceSize: "200-500",
      status: "pending",
      receivedDate: "May 10, 2025",
      isNew: true,
    },
    {
      id: "3",
      eventName: "AI Ethics Conference",
      organization: "Tech Ethics Institute",
      contactName: "Michael Chen",
      contactEmail: "michael@techethics.example.com",
      date: "October 20-22, 2025",
      location: "Toronto, Canada",
      suggestedTopic: "Ethical Frameworks for AI Development",
      audienceSize: "200-500",
      status: "accepted",
      receivedDate: "April 28, 2025",
      isNew: false,
    },
    {
      id: "4",
      eventName: "Global Tech Forum",
      organization: "GTF Organizers",
      contactName: "Sarah Williams",
      contactEmail: "sarah@gtf.example.com",
      date: "December 5-7, 2025",
      location: "Singapore",
      suggestedTopic: "AI and the Future of Work",
      audienceSize: "1000+",
      status: "declined",
      receivedDate: "April 15, 2025",
      isNew: false,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speaking Requests</CardTitle>
        <CardDescription>Invitations to speak at upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{request.eventName}</h3>
                      {request.isNew && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                          New
                        </Badge>
                      )}
                      {request.status === "pending" && (
                        <Badge variant="outline" className="border-orange-200 text-orange-700 dark:text-orange-400">
                          Pending
                        </Badge>
                      )}
                      {request.status === "accepted" && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Accepted
                        </Badge>
                      )}
                      {request.status === "declined" && <Badge variant="secondary">Declined</Badge>}
                    </div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{request.suggestedTopic}</p>
                    <p className="text-sm text-muted-foreground">From: {request.organization}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                        {request.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                        {request.location}
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1 text-orange-500" />
                      {request.audienceSize} expected attendees
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Received: {request.receivedDate}</div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="justify-start">
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="justify-start text-orange-600 dark:text-orange-400 px-0"
                      >
                        View Details
                      </Button>
                    </div>
                  )}

                  {(request.status === "accepted" || request.status === "declined") && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="justify-start text-orange-600 dark:text-orange-400 px-0"
                      >
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No speaking requests found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
