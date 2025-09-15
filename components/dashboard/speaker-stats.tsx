import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Star, TrendingUp } from "lucide-react"

export function SpeakerStats() {
  // Sample data - in a real app, this would come from an API
  const stats = [
    {
      title: "Average Rating",
      value: "4.8",
      icon: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
      description: "Across all events",
    },
    {
      title: "Total Feedback",
      value: "156",
      icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
      description: "From attendees",
    },
    {
      title: "Events",
      value: "24",
      icon: <Calendar className="h-4 w-4 text-orange-500" />,
      description: "Past and upcoming",
    },
    {
      title: "Traction Score",
      value: "92",
      icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
      description: "Visibility metric",
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="border-orange-100 dark:border-orange-900/20 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
