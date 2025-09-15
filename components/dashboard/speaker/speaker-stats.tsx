import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Star, TrendingUp, Award, Gift } from "lucide-react"

export function SpeakerStats() {
  // Sample data - in a real app, this would come from an API
  const stats = [
    {
      title: "Average Rating",
      value: "4.8",
      icon: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
      description: "Across all events",
      trend: "+0.2",
      trendUp: true,
    },
    {
      title: "Total Feedback",
      value: "156",
      icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
      description: "From attendees",
      trend: "+12",
      trendUp: true,
    },
    {
      title: "Upcoming Events",
      value: "5",
      icon: <Calendar className="h-4 w-4 text-orange-500" />,
      description: "Next 6 months",
      trend: "+2",
      trendUp: true,
    },
    {
      title: "Speaker Rank",
      value: "#42",
      icon: <Award className="h-4 w-4 text-orange-500" />,
      description: "In your category",
      trend: "+5",
      trendUp: true,
    },
    {
      title: "Gifts Received",
      value: "Coming Soon",
      icon: <Gift className="h-4 w-4 text-orange-500" />,
      description: "New feature",
      trend: "",
      trendUp: true,
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
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div
                className={`flex items-center text-xs ${stat.trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                )}
                {stat.trend}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
