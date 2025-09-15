import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpeakerStats } from "@/components/dashboard/speaker-stats"
import { SpeakerEvents } from "@/components/dashboard/speaker-events"
import { SpeakerFeedback } from "@/components/dashboard/speaker-feedback"

export function SpeakerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpeakerStats />
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <SpeakerEvents type="upcoming" />
        </TabsContent>
        <TabsContent value="past">
          <SpeakerEvents type="past" />
        </TabsContent>
        <TabsContent value="feedback">
          <SpeakerFeedback />
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Speaker Profile</CardTitle>
              <CardDescription>Manage your public speaker profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold">SJ</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Dr. Sarah Johnson</h3>
                  <p className="text-sm text-muted-foreground">AI Research Lead at TechCorp</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Bio</h4>
                <p className="text-sm text-muted-foreground">
                  Dr. Sarah Johnson is a leading researcher in artificial intelligence with over 10 years of experience
                  in the field. She specializes in generative AI, machine learning algorithms, and neural networks.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Artificial Intelligence</Badge>
                  <Badge>Machine Learning</Badge>
                  <Badge>Neural Networks</Badge>
                  <Badge>Computer Vision</Badge>
                  <Badge>Natural Language Processing</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span> sarah.johnson@example.com
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span> San Francisco, USA
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Twitter:</span> @sarahjohnson
                  </div>
                  <div>
                    <span className="text-muted-foreground">LinkedIn:</span> /in/sarahjohnson
                  </div>
                  <div>
                    <span className="text-muted-foreground">GitHub:</span> @sarahjohnson
                  </div>
                  <div>
                    <span className="text-muted-foreground">Website:</span> sarahjohnson.example.com
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Edit Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
