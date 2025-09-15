import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface SpeakersListProps {
  eventId: string
}

export function SpeakersList({ eventId }: SpeakersListProps) {
  // Sample data - in a real app, this would come from an API
  const speakers = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      title: "AI Research Lead at TechCorp",
      session: "The Future of Generative AI",
      time: "June 15, 10:00 AM - 11:30 AM",
      rating: 4.8,
      reviews: 156,
      tags: ["AI", "Machine Learning"],
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "2",
      name: "Michael Chen",
      title: "Senior Software Architect",
      session: "Scaling Microservices Architecture",
      time: "June 15, 1:00 PM - 2:30 PM",
      rating: 4.6,
      reviews: 124,
      tags: ["Microservices", "Architecture", "Cloud"],
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "3",
      name: "Priya Patel",
      title: "UX Research Director",
      session: "Designing for Accessibility",
      time: "June 16, 9:30 AM - 11:00 AM",
      rating: 4.9,
      reviews: 178,
      tags: ["UX", "Accessibility", "Design"],
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "4",
      name: "James Wilson",
      title: "Blockchain Strategist",
      session: "Web3 and the Future of Finance",
      time: "June 16, 2:00 PM - 3:30 PM",
      rating: 4.5,
      reviews: 112,
      tags: ["Blockchain", "Web3", "Finance"],
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "5",
      name: "Elena Rodriguez",
      title: "Security Engineer",
      session: "Cybersecurity in the Age of AI",
      time: "June 17, 10:30 AM - 12:00 PM",
      rating: 4.7,
      reviews: 143,
      tags: ["Security", "Cybersecurity", "AI"],
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Speakers</h2>
        <p className="text-muted-foreground">Explore the speakers and their sessions at this event</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {speakers.map((speaker) => (
          <Card key={speaker.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 border border-orange-200">
                <img
                  src={speaker.image || "/placeholder.svg"}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{speaker.name}</CardTitle>
                <CardDescription>{speaker.title}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-orange-700 dark:text-orange-400">{speaker.session}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{speaker.time}</p>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-medium">{speaker.rating}</span>
                  </div>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{speaker.reviews} reviews</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {speaker.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href={`/speakers/${speaker.id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                >
                  View Profile
                </Button>
              </Link>
              <Link href={`/events/${eventId}/speakers/${speaker.id}/feedback`} className="flex-1">
                <Button className="w-full">Give Feedback</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
