"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Star, Award, Gift } from "lucide-react"
import { useEffect, useState } from "react"
import { feedbackAPI } from "@/lib/api/feedbackApi"

interface SpeakerStatsData {
  averageRating: number | null
  totalFeedback: number
  upcomingEvents: number
  speakerRank: number | null
}

export function SpeakerStats() {
  const [stats, setStats] = useState<SpeakerStatsData>({
    averageRating: null,
    totalFeedback: 0,
    upcomingEvents: 0,
    speakerRank: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real feedback data
        const feedbackData = await feedbackAPI.getCurrentSpeakerFeedback()
        
        if (feedbackData.length > 0) {
          // Calculate average rating from all feedback
          const totalRating = feedbackData.reduce((sum, item) => sum + item.overall_rating, 0)
          const avgRating = totalRating / feedbackData.length
          
          setStats({
            averageRating: avgRating,
            totalFeedback: feedbackData.length,
            upcomingEvents: 0, // TODO: Fetch from events API
            speakerRank: null, // TODO: Fetch from speakers API
          })
        } else {
          setStats({
            averageRating: null,
            totalFeedback: 0,
            upcomingEvents: 0,
            speakerRank: null,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsCards = [
    {
      title: "Average Rating",
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}/10` : "N/A",
      icon: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
      description: stats.averageRating ? "Across all events" : "No ratings yet",
    },
    {
      title: "Total Feedback",
      value: stats.totalFeedback.toString(),
      icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
      description: stats.totalFeedback > 0 ? "From attendees" : "No feedback yet",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      icon: <Calendar className="h-4 w-4 text-orange-500" />,
      description: stats.upcomingEvents > 0 ? "Next 6 months" : "No upcoming events",
    },
    {
      title: "Speaker Rank",
      value: stats.speakerRank ? `#${stats.speakerRank}` : "N/A",
      icon: <Award className="h-4 w-4 text-orange-500" />,
      description: stats.speakerRank ? "In your category" : "Not ranked yet",
    },
    {
      title: "Gifts Received",
      value: "Coming Soon",
      icon: <Gift className="h-4 w-4 text-orange-500" />,
      description: "New feature",
    },
  ]

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-orange-100 dark:border-orange-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {statsCards.map((stat, index) => (
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
