"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"
import { FeedbackVerification } from "@/components/events/feedback-verification"
import { toast } from "sonner"

interface FeedbackPageProps {
  params: Promise<{ id: string; speakerId: string }>
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const router = useRouter()
  const { id: eventId, speakerId } = React.use(params)

  const [step, setStep] = useState<"verification" | "feedback">("verification")
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedAttendeeData, setVerifiedAttendeeData] = useState<{
    email: string;
    attendeeId?: number;
    isVirtual?: boolean;
  } | null>(null)
  const [sessionData, setSessionData] = useState<{
    sessionId?: number;
    sessionName?: string;
    speakerName?: string;
  } | null>(null)
  const [speakerData, setSpeakerData] = useState<{
    id: number;
    full_name: string;
    organization?: string;
    country?: string;
    avatar?: string;
    short_bio?: string;
  } | null>(null)
  const [eventData, setEventData] = useState<{
    id: number;
    title: string;
    event_nickname?: string;
    location?: string;
    start_date_time: string;
    end_date_time: string;
    event_image?: string;
    short_description?: string;
  } | null>(null)
  const [ratings, setRatings] = useState({
    engagement: 0,
    clarity: 0,
    contentDepth: 0,
    speakerKnowledge: 0,
    practicalRelevance: 0,
  })
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [isLoadingSpeaker, setIsLoadingSpeaker] = useState(false)
  const [isLoadingEvent, setIsLoadingEvent] = useState(false)

  const handleVerificationComplete = async (verified: boolean, verifiedEmail?: string) => {
    setIsVerified(verified)
    if (verified && verifiedEmail) {
      setVerifiedAttendeeData({
        email: verifiedEmail,
        isVirtual: verifiedEmail === "virtual-attendee"
      })

      toast.success('Verification successful!', {
        description: 'Loading session details...',
        duration: 3000,
      })

      // Load session, speaker, and event data
      await Promise.all([loadSessionData(), loadSpeakerData(), loadEventData()])
      setStep("feedback")
    }
  }

  const loadSessionData = async () => {
    setIsLoadingSession(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

      // Use the talks endpoint instead of sessions
      const talksResponse = await fetch(`${API_BASE_URL}/api/talks/`)
      if (!talksResponse.ok) {
        throw new Error('Failed to load talks')
      }
      const allTalks = await talksResponse.json()

      // Find the talk for this specific event and speaker
      const talk = allTalks.find((t: any) =>
        t.event.toString() === eventId && t.speaker.toString() === speakerId
      )

      if (talk) {
        setSessionData({
          sessionId: talk.id,
          sessionName: talk.title,
          speakerName: talk.speaker_name
        })
      } else {
        // If no talk found, still allow feedback but with minimal info
        setSessionData({
          sessionId: parseInt(speakerId), // Use speaker ID as fallback
          sessionName: 'Speaker Session',
          speakerName: 'Speaker'
        })
        console.warn('No specific talk found for this speaker in this event')
      }

    } catch (error) {
      console.error('Error loading session data:', error)
      // Don't show toast error for session data as it's not critical
      // Still allow feedback with fallback data
      setSessionData({
        sessionId: parseInt(speakerId),
        sessionName: 'Speaker Session',
        speakerName: 'Speaker'
      })
    } finally {
      setIsLoadingSession(false)
    }
  }

  const loadSpeakerData = async () => {
    setIsLoadingSpeaker(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

      const speakerResponse = await fetch(`${API_BASE_URL}/api/speakers/${speakerId}/`)
      if (!speakerResponse.ok) {
        throw new Error('Failed to load speaker data')
      }
      const speaker = await speakerResponse.json()

      setSpeakerData({
        id: speaker.id,
        full_name: speaker.full_name,
        organization: speaker.organization,
        country: speaker.country,
        avatar: speaker.avatar,
        short_bio: speaker.short_bio
      })

    } catch (error) {
      console.error('Error loading speaker data:', error)
      // Don't show alert for speaker data as it's not critical for feedback submission
    } finally {
      setIsLoadingSpeaker(false)
    }
  }

  const loadEventData = async () => {
    setIsLoadingEvent(true)
    try {
      // Import the events API here to avoid issues
      const { eventsApi } = await import('@/lib/api/events')
      
      const event = await eventsApi.getEvent(eventId)

      setEventData({
        id: event.id,
        title: event.title,
        event_nickname: event.event_nickname,
        location: typeof event.location === 'string' ? event.location : event.location?.venue || 'Unknown Location',
        start_date_time: event.start_date_time,
        end_date_time: event.end_date_time,
        event_image: event.event_image || undefined,
        short_description: event.short_description
      })

    } catch (error) {
      console.error('Error loading event data:', error)
      // Don't show toast error as event info is not critical for feedback
      console.warn('Event information will not be displayed')
    } finally {
      setIsLoadingEvent(false)
    }
  }

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings({
      ...ratings,
      [category]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!verifiedAttendeeData || !sessionData?.sessionId) {
        throw new Error('Missing verification or session data')
      }

      // Check if all ratings are filled
      const allRatings = Object.values(ratings)
      if (allRatings.some(rating => rating === 0)) {
        toast.error('Please provide ratings for all criteria before submitting.')
        setIsSubmitting(false)
        return
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

      let attendeeId: number

      if (verifiedAttendeeData.isVirtual) {
        attendeeId = 1
      } else {
        try {
          const attendeeResponse = await fetch(`${API_BASE_URL}/api/attendees/by-email/${verifiedAttendeeData.email}/`)
          if (attendeeResponse.ok) {
            const attendeeData = await attendeeResponse.json()
            attendeeId = attendeeData.id
          } else {
            attendeeId = 1
          }
        } catch (error) {
          console.error('Error fetching attendee:', error)
          attendeeId = 1
        }
      }

      const overallRating = Math.round(allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length)

      // Include required 'speaker' field and use 'comments' (plural)
      const feedbackData = {
        session: sessionData.sessionId,
        attendee: attendeeId,
        speaker: parseInt(speakerId, 10),
        overall_rating: overallRating,
        engagement: ratings.engagement,
        clarity: ratings.clarity,
        content_depth: ratings.contentDepth,
        speaker_knowledge: ratings.speakerKnowledge,
        practical_relevance: ratings.practicalRelevance,
        comments: comment.trim() || null,
        is_anonymous: verifiedAttendeeData.isVirtual || false,
        is_editable: true
      }

      console.log('Submitting feedback:', feedbackData) // Debug log

      const response = await fetch(`${API_BASE_URL}/api/feedbacks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      if (response.ok) {
        toast.success('Feedback submitted successfully! Thank you for your valuable input.', {
          description: `Your feedback for ${sessionData.speakerName} has been recorded.`,
          duration: 4000,
        })
        
        // Wait a moment before redirecting so user can see the success message
        setTimeout(() => {
          router.push(`/events/${eventId}?feedback=success`)
        }, 1000)
      } else {
        console.error('Feedback submission failed with status:', response.status)
        
        let errorData: any = {}
        
        try {
          // Try to parse response as JSON
          const responseText = await response.text()
          console.log('Response text:', responseText)
          
          if (responseText.trim()) {
            errorData = JSON.parse(responseText)
          } else {
            console.warn('Empty response body received')
            errorData = { detail: 'Empty response from server' }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorData = { detail: `HTTP ${response.status} - ${response.statusText}` }
        }
        
        console.error('Parsed error data:', errorData)

        if (response.status === 400) {
          if (errorData.detail && errorData.detail.includes('unique_feedback_per_attendee_session')) {
            toast.error('Duplicate feedback detected', {
              description: 'You have already submitted feedback for this speaker. You can only provide feedback once per speaker.',
              duration: 5000,
            })
          } else if (errorData.non_field_errors) {
            toast.error('Submission failed', {
              description: errorData.non_field_errors[0] || 'Please check your input and try again.',
              duration: 5000,
            })
          } else {
            toast.error('Feedback submission failed', {
              description: 'Please check your ratings and try again.',
              duration: 4000,
            })
          }
        } else if (response.status === 500) {
          toast.error('Server error', {
            description: 'There was an issue on our end. Please try again in a moment.',
            duration: 5000,
          })
        } else {
          toast.error('Failed to submit feedback', {
            description: 'Please check your connection and try again.',
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Network error', {
        description: 'Failed to submit feedback. Please check your internet connection and try again.',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!eventId || !speakerId) {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <Link
        href={`/events/${eventId}`}
        className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Event
      </Link>

      {step === "verification" ? (
        <FeedbackVerification
          eventId={eventId}
          speakerId={speakerId}
          onVerificationComplete={handleVerificationComplete}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Speaker Feedback</CardTitle>
            <CardDescription>Please rate the speaker on the following criteria from 1 to 10</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Event Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Conference Information</h3>
                {isLoadingEvent ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <p className="text-sm text-muted-foreground">Loading conference details...</p>
                  </div>
                ) : eventData ? (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start space-x-4">
                      {eventData.event_image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-orange-100 border border-orange-200 flex-shrink-0">
                          <img
                            src={eventData.event_image.startsWith('http') ? eventData.event_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${eventData.event_image}`}
                            alt={eventData.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-orange-900 dark:text-orange-100 text-lg">
                          {eventData.title}
                        </h4>
                        {eventData.event_nickname && (
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            {eventData.event_nickname}
                          </p>
                        )}
                        {eventData.location && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {eventData.location}
                          </p>
                        )}
                        <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(eventData.start_date_time).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {eventData.short_description && (
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-2 line-clamp-2">
                            {eventData.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Conference information will be loaded after verification</p>
                )}
              </div>

              {/* Session/Talk Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Talk/Session Details</h3>
                {isLoadingSession ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-muted-foreground">Loading session details...</p>
                  </div>
                ) : sessionData ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-base mb-2">
                      {sessionData.sessionName}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Presented by: <span className="font-medium">{sessionData.speakerName}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Session information will be loaded after verification</p>
                )}
              </div>

              {/* Speaker Profile */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Speaker Profile</h3>
                {isLoadingSpeaker ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    <p className="text-sm text-muted-foreground">Loading speaker details...</p>
                  </div>
                ) : speakerData ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-green-100 border-2 border-green-200 flex-shrink-0">
                        {speakerData.avatar ? (
                          <img
                            src={speakerData.avatar.startsWith('http') ? speakerData.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${speakerData.avatar}`}
                            alt={speakerData.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-lg">
                            {speakerData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 dark:text-green-100 text-lg">
                          {speakerData.full_name}
                        </h4>
                        {speakerData.organization && (
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            {speakerData.organization}
                          </p>
                        )}
                        {speakerData.country && (
                          <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {speakerData.country}
                          </p>
                        )}
                        {speakerData.short_bio && (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-2 line-clamp-3">
                            {speakerData.short_bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Speaker information will be loaded after verification</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Rating Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Rate This Speaker</h3>
                  <p className="text-muted-foreground">Please rate the speaker on the following criteria from 1 to 10</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Engagement</h4>
                  <p className="text-sm text-muted-foreground">How well did the speaker maintain audience interest?</p>
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ratings.engagement === value ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => handleRatingChange("engagement", value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Clarity</h4>
                    <p className="text-sm text-muted-foreground">How clear and understandable was the presentation?</p>
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ratings.clarity === value ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => handleRatingChange("clarity", value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Content Depth</h4>
                    <p className="text-sm text-muted-foreground">How would you rate the depth of the content covered?</p>
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ratings.contentDepth === value ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => handleRatingChange("contentDepth", value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Speaker Knowledge</h4>
                    <p className="text-sm text-muted-foreground">
                      How knowledgeable did the speaker seem about the topic?
                    </p>
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ratings.speakerKnowledge === value ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => handleRatingChange("speakerKnowledge", value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Practical Relevance</h4>
                    <p className="text-sm text-muted-foreground">
                      How relevant was the content to practical applications?
                    </p>
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ratings.practicalRelevance === value
                          ? "bg-orange-500 text-white"
                          : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => handleRatingChange("practicalRelevance", value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Additional Comments</h4>
                    <p className="text-sm text-muted-foreground">
                      Share any additional feedback you have for the speaker
                    </p>
                    <Textarea
                      id="comment"
                      placeholder="What did you like or what could be improved?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep("verification")}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || Object.values(ratings).some(rating => rating === 0)}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}
