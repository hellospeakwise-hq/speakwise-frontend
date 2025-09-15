import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MessageSquare, Star } from "lucide-react"

export function AttendeeDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendee Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Conferences and meetups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Given</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Speaker reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Registered to attend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="feedback">My Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you're registered to attend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Event 1 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">TechConf 2025</h3>
                      <p className="text-sm text-muted-foreground">June 15-17, 2025</p>
                      <p className="text-sm text-muted-foreground">San Francisco, USA</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Technology</Badge>
                        <Badge variant="outline">Development</Badge>
                        <Badge variant="outline">AI</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                      <Button variant="outline" size="sm">
                        View Ticket
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">AI Summit</h3>
                      <p className="text-sm text-muted-foreground">July 8-10, 2025</p>
                      <p className="text-sm text-muted-foreground">London, UK</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">AI</Badge>
                        <Badge variant="outline">Machine Learning</Badge>
                        <Badge variant="outline">Research</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                      <Button variant="outline" size="sm">
                        View Ticket
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">DesignSummit</h3>
                      <p className="text-sm text-muted-foreground">August 22-24, 2025</p>
                      <p className="text-sm text-muted-foreground">Berlin, Germany</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Design</Badge>
                        <Badge variant="outline">UX</Badge>
                        <Badge variant="outline">Accessibility</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                      <Button variant="outline" size="sm">
                        View Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>Events you've attended</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Past Event 1 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">DevConf 2024</h3>
                      <p className="text-sm text-muted-foreground">March 10-12, 2024</p>
                      <p className="text-sm text-muted-foreground">Berlin, Germany</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Development</Badge>
                        <Badge variant="outline">Cloud</Badge>
                        <Badge variant="outline">DevOps</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                      <Button variant="outline" size="sm">
                        View Speakers
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Past Event 2 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">UX Conference</h3>
                      <p className="text-sm text-muted-foreground">January 15-17, 2024</p>
                      <p className="text-sm text-muted-foreground">New York, USA</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">UX</Badge>
                        <Badge variant="outline">Design</Badge>
                        <Badge variant="outline">Research</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                      <Button variant="outline" size="sm">
                        View Speakers
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>My Feedback</CardTitle>
              <CardDescription>Feedback you've provided to speakers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Feedback 1 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Dr. Sarah Johnson</h3>
                      <p className="text-sm text-primary">The Future of Generative AI</p>
                      <p className="text-xs text-muted-foreground">TechConf 2024 • March 11, 2024</p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 5 ? "text-yellow-500 fill-yellow-500" : "text-muted stroke-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      "Dr. Johnson's presentation on generative AI was incredibly insightful and accessible. She has a
                      unique ability to explain complex concepts in a way that everyone can understand."
                    </p>
                  </div>
                </div>

                {/* Feedback 2 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Michael Chen</h3>
                      <p className="text-sm text-primary">Scaling Microservices Architecture</p>
                      <p className="text-xs text-muted-foreground">DevConf 2024 • March 10, 2024</p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 4 ? "text-yellow-500 fill-yellow-500" : "text-muted stroke-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      "Great presentation on microservices architecture. The real-world examples were very helpful.
                      Would have liked more time for Q&A at the end."
                    </p>
                  </div>
                </div>

                {/* Feedback 3 */}
                <div className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Priya Patel</h3>
                      <p className="text-sm text-primary">Designing for Accessibility</p>
                      <p className="text-xs text-muted-foreground">UX Conference • January 16, 2024</p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 5 ? "text-yellow-500 fill-yellow-500" : "text-muted stroke-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      "Priya's session on accessibility was eye-opening. The practical demonstrations and case studies
                      were excellent. Definitely changed how I'll approach design in the future."
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
