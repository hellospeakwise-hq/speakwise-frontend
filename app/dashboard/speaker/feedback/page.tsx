"use client"

import { useEffect, useState } from "react"
import { Star, MessageSquare, TrendingUp, Filter, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { feedbackAPI, type Feedback as ApiFeedback } from "@/lib/api/feedbackApi"

interface FeedbackDisplay {
  id: number
  rating: number
  comment: string
  categories: string[]
  date: string
  engagement: number
  clarity: number
  contentDepth: number
  speakerKnowledge: number
  practicalRelevance: number
  isAnonymous: boolean
}

export default function SpeakerFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, recent, high, low
  const [sortBy, setSortBy] = useState("date") // date, rating

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await feedbackAPI.getCurrentSpeakerFeedback()
        
        // Transform API data to display format
        const transformedFeedback: FeedbackDisplay[] = data.map((item: ApiFeedback) => {
          // Calculate categories based on ratings
          const categories: string[] = []
          if (item.engagement >= 8) categories.push("Engagement")
          if (item.clarity >= 8) categories.push("Clarity")
          if (item.content_depth >= 8) categories.push("Content")
          if (item.speaker_knowledge >= 8) categories.push("Knowledge")
          if (item.practical_relevance >= 8) categories.push("Practical")
          
          // Handle date formatting safely
          let formattedDate = 'Date not available'
          if (item.created_at) {
            try {
              const dateObj = new Date(item.created_at)
              if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }
            } catch (e) {
              console.error('Date parsing error:', e)
            }
          }
          
          return {
            id: item.id,
            rating: item.overall_rating,
            comment: item.comments || "No comments provided",
            categories: categories.length > 0 ? categories : ["General"],
            date: formattedDate,
            engagement: item.engagement,
            clarity: item.clarity,
            contentDepth: item.content_depth,
            speakerKnowledge: item.speaker_knowledge,
            practicalRelevance: item.practical_relevance,
            isAnonymous: item.is_anonymous || false
          }
        })
        
        setFeedback(transformedFeedback)
      } catch (error) {
        console.error('Error fetching feedback:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  // Calculate statistics
  const avgRating = feedback.length > 0 
    ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
    : "0.0"
  
  const recentCount = feedback.filter(item => {
    const date = new Date(item.date)
    const monthsAgo = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsAgo < 1
  }).length

  // Apply filters and sorting
  const filteredFeedback = feedback
    .filter(item => {
      if (filter === "recent") {
        const date = new Date(item.date)
        const monthsAgo = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return monthsAgo < 1
      }
      if (filter === "high") return item.rating >= 8
      if (filter === "low") return item.rating < 6
      return true
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading feedback...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/speaker">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">All Feedback</h1>
          <p className="text-muted-foreground">Review all feedback from your speaking engagements</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}/10</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Feedback</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCount}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Ratings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter(f => f.rating >= 8).length}
            </div>
            <p className="text-xs text-muted-foreground">8+ ratings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feedback History</CardTitle>
              <CardDescription>Filter and sort your feedback</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feedback</SelectItem>
                  <SelectItem value="recent">Recent (30 days)</SelectItem>
                  <SelectItem value="high">High Ratings (8+)</SelectItem>
                  <SelectItem value="low">Needs Improvement (&lt;6)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Feedback #{item.id}</h3>
                        {item.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(item.rating / 2)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold">{item.rating}/10</span>
                    </div>
                  </div>

                  {/* Individual Rating Criteria */}
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                      <p className="text-sm font-semibold">{item.engagement}/10</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Clarity</p>
                      <p className="text-sm font-semibold">{item.clarity}/10</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Content</p>
                      <p className="text-sm font-semibold">{item.contentDepth}/10</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Knowledge</p>
                      <p className="text-sm font-semibold">{item.speakerKnowledge}/10</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Practical</p>
                      <p className="text-sm font-semibold">{item.practicalRelevance}/10</p>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">{item.comment}</p>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {item.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filter === "all" 
                    ? "You haven't received any feedback yet."
                    : "No feedback matches your current filter."}
                </p>
                {filter !== "all" && (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
