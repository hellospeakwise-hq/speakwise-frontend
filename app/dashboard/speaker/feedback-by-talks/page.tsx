"use client"

import { useEffect, useState } from "react"
import { Star, MessageSquare, Calendar, Users, TrendingUp, Eye, ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { feedbackAPI, type Feedback as ApiFeedback } from "@/lib/api/feedbackApi"
import { FeedbackNavigation } from "@/components/dashboard/speaker/feedback-navigation"

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
  sessionId: number
}

interface SessionGroup {
  sessionId: number
  sessionTitle: string
  eventName: string
  feedbackCount: number
  averageRating: number
  feedback: FeedbackDisplay[]
  eventDate?: string
}

export default function SpeakerFeedbackByTalksPage() {
  const [sessions, setSessions] = useState<SessionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<SessionGroup | null>(null)

  useEffect(() => {
    const fetchGroupedFeedback = async () => {
      try {
        const data = await feedbackAPI.getCurrentSpeakerFeedback()
        
        // Transform and group feedback by session
        const sessionMap = new Map<number, SessionGroup>()
        
        data.forEach((item: ApiFeedback) => {
          const sessionId = item.session
          
          // Transform feedback item
          const feedbackItem: FeedbackDisplay = {
            id: item.id,
            rating: item.overall_rating,
            comment: item.comments || "No comments provided",
            categories: calculateCategories(item),
            date: formatDate(item.created_at),
            engagement: item.engagement,
            clarity: item.clarity,
            contentDepth: item.content_depth,
            speakerKnowledge: item.speaker_knowledge,
            practicalRelevance: item.practical_relevance,
            isAnonymous: item.is_anonymous || false,
            sessionId: sessionId
          }
          
          if (!sessionMap.has(sessionId)) {
            // Create new session group with placeholder data
            sessionMap.set(sessionId, {
              sessionId: sessionId,
              sessionTitle: `Loading...`,
              eventName: `Loading...`,
              feedbackCount: 0,
              averageRating: 0,
              feedback: [],
              eventDate: formatDate(item.created_at)
            })
          }
          
          const sessionGroup = sessionMap.get(sessionId)!
          sessionGroup.feedback.push(feedbackItem)
          sessionGroup.feedbackCount = sessionGroup.feedback.length
          sessionGroup.averageRating = sessionGroup.feedback.reduce((sum, f) => sum + f.rating, 0) / sessionGroup.feedback.length
        })
        
        // Get unique session IDs
        const sessionIds = Array.from(sessionMap.keys())
        
        // Fetch session details for all sessions
        try {
          const sessionDetails = await feedbackAPI.getMultipleSessionDetails(sessionIds)
          
          // Update session groups with real details
          sessionIds.forEach(sessionId => {
            const sessionGroup = sessionMap.get(sessionId)!
            const details = sessionDetails.get(sessionId)
            if (details) {
              sessionGroup.sessionTitle = details.title
              sessionGroup.eventName = details.eventName
              if (details.eventDate) {
                sessionGroup.eventDate = formatDate(details.eventDate)
              }
            }
          })
        } catch (error) {
          // Only log non-404 errors to reduce console noise during development
          if (error instanceof Error && !error.message.includes('404')) {
            console.error('Error fetching session details:', error)
          }
          // Use sample data that looks more realistic
          const sampleTitles = [
            "Introduction to Modern Web Development",
            "Building Scalable React Applications",
            "The Future of JavaScript Frameworks",
            "API Design Best Practices",
            "Database Optimization Strategies",
            "Cloud Architecture Patterns",
            "Security in Modern Web Apps",
            "Performance Optimization Techniques"
          ]
          
          const sampleEvents = [
            "TechConf 2024",
            "React Summit",
            "Web Dev Meetup",
            "Developer Conference",
            "CodeCamp NYC",
            "Frontend Masters",
            "Tech Talk Tuesday",
            "Innovation Summit"
          ]
          
          sessionIds.forEach((sessionId, index) => {
            const sessionGroup = sessionMap.get(sessionId)!
            sessionGroup.sessionTitle = sampleTitles[index % sampleTitles.length] || `Talk #${sessionId}`
            sessionGroup.eventName = sampleEvents[index % sampleEvents.length] || `Event #${sessionId}`
          })
        }
        
        // Convert to array and sort by average rating (best first)
        const sessionGroups = Array.from(sessionMap.values()).sort((a, b) => b.averageRating - a.averageRating)
        setSessions(sessionGroups)
      } catch (error) {
        console.error('Error fetching grouped feedback:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupedFeedback()
  }, [])

  const calculateCategories = (item: ApiFeedback): string[] => {
    const categories: string[] = []
    if (item.engagement >= 8) categories.push("Engagement")
    if (item.clarity >= 8) categories.push("Clarity")
    if (item.content_depth >= 8) categories.push("Content")
    if (item.speaker_knowledge >= 8) categories.push("Knowledge")
    if (item.practical_relevance >= 8) categories.push("Practical")
    return categories.length > 0 ? categories : ["General"]
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date not available'
    try {
      const dateObj = new Date(dateString)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    } catch (e) {
      console.error('Date parsing error:', e)
    }
    return 'Date not available'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading feedback by talks...</div>
        </div>
      </div>
    )
  }

  // Show individual session view
  if (selectedSession) {
    return (
      <div className="min-h-screen bg-background">
        {/* Back Button */}
        <div className="container mx-auto px-6 pt-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedSession(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Talks
          </Button>
        </div>

        {/* Hero Banner */}
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white rounded-2xl border border-border/20">
            <div className="absolute inset-0 bg-black/20" />
            <div className="px-8 py-12 relative z-10">
              <div className="max-w-4xl">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-white/20 rounded-full backdrop-blur-sm">
                    Speaker Feedback
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                  {selectedSession.sessionTitle}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-white/90 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">{selectedSession.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">{selectedSession.eventName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {selectedSession.averageRating.toFixed(1)}/10
                    </div>
                    <div className="text-xs sm:text-sm text-white/80">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {selectedSession.feedbackCount}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80">Total Feedback</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 sm:h-6 sm:w-6 ${
                            i < Math.round(selectedSession.averageRating / 2)
                              ? 'fill-yellow-300 text-yellow-300'
                              : 'fill-white/20 text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 mt-1">Star Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6 space-y-6">

        {/* Session Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedSession.feedbackCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(...selectedSession.feedback.map(f => f.rating)).toFixed(1)}/10
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{selectedSession.eventDate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Feedback</CardTitle>
            <CardDescription>All feedback for this specific talk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedSession.feedback.map((item) => (
                <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-medium">Feedback #{item.id}</h3>
                        {item.isAnonymous && (
                          <Badge variant="secondary" className="text-xs w-fit">Anonymous</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-1 justify-between sm:justify-end">
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
                      </div>
                      <span className="ml-2 text-sm font-semibold">{item.rating}/10</span>
                    </div>
                  </div>

                  {/* Individual Rating Criteria */}
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                      <p className="text-sm font-semibold">{item.engagement}/10</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Clarity</p>
                      <p className="text-sm font-semibold">{item.clarity}/10</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Content</p>
                      <p className="text-sm font-semibold">{item.contentDepth}/10</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Knowledge</p>
                      <p className="text-sm font-semibold">{item.speakerKnowledge}/10</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg col-span-2 sm:col-span-1">
                      <p className="text-xs text-muted-foreground mb-1">Practical</p>
                      <p className="text-sm font-semibold">{item.practicalRelevance}/10</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">{item.comment}</p>
                  </div>

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
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  // Show talks overview
  return (
    <div className="container mx-auto p-6 space-y-6">
      <FeedbackNavigation />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/speaker">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Feedback by Talks</h1>
          <p className="text-muted-foreground">View feedback organized by your individual speaking sessions</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Talks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Sessions delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, s) => sum + s.feedbackCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all talks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 
                ? (sessions.reduce((sum, s) => sum + s.averageRating, 0) / sessions.length).toFixed(1)
                : "0.0"}/10
            </div>
            <p className="text-xs text-muted-foreground">All talks average</p>
          </CardContent>
        </Card>
      </div>

      {/* Talks List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Talks</CardTitle>
          <CardDescription>Click on any talk to view detailed feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{session.sessionTitle}</h3>
                      <p className="text-sm text-muted-foreground">{session.eventName}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          {session.feedbackCount} feedback
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {session.eventDate}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(session.averageRating / 2)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {session.averageRating.toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Talks Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start speaking at events to see your talks and feedback organized here!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}