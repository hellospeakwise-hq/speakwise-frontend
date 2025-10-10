"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { feedbackAPI, type Feedback as ApiFeedback } from "@/lib/api/feedbackApi"

interface RecentFeedbackProps {
  limit?: number
}

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
}

export function RecentFeedback({ limit }: RecentFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await feedbackAPI.getCurrentSpeakerFeedback()
        
        console.log('Raw feedback data:', data) // Debug log
        
        // Transform API data to display format
        const transformedFeedback: FeedbackDisplay[] = data.map((item: ApiFeedback) => {
          // Calculate categories based on ratings
          const categories: string[] = []
          if (item.engagement >= 4) categories.push("Engagement")
          if (item.clarity >= 4) categories.push("Clarity")
          if (item.content_depth >= 4) categories.push("Content")
          if (item.speaker_knowledge >= 4) categories.push("Knowledge")
          if (item.practical_relevance >= 4) categories.push("Practical")
          
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
            comment: item.comments || "No comments provided",  // Backend uses "comments" (plural)
            categories: categories.length > 0 ? categories : ["General"],
            date: formattedDate,
            engagement: item.engagement,
            clarity: item.clarity,
            contentDepth: item.content_depth,
            speakerKnowledge: item.speaker_knowledge,
            practicalRelevance: item.practical_relevance
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

  const displayFeedback = limit ? feedback.slice(0, limit) : feedback

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Anonymous feedback from your speaking engagements</CardDescription>
        </div>
        {limit && feedback.length > 0 && (
          <Link href="/dashboard/speaker/feedback">
            <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayFeedback.length > 0 ? (
            displayFeedback.map((item) => (
              <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Feedback #{item.id}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(item.rating / 2)  // Convert 10-scale to 5-star display
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold">{item.rating}/10</span>
                  </div>
                </div>
                
                {/* Individual Rating Criteria */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
                
                <div className="mt-3">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 block">Comments:</span>
                  <p className="text-sm text-muted-foreground">{item.comment}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
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
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven&apos;t received any feedback from attendees yet. Complete your first speaking engagement to start receiving feedback!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
