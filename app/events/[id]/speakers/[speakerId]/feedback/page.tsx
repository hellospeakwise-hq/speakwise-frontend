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

      // Load both session and speaker data
      await Promise.all([loadSessionData(), loadSpeakerData()])
      setStep("feedback")
    }
  }

  const loadSessionData = async () => {
    setIsLoadingSession(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

      const sessionsResponse = await fetch(`${API_BASE_URL}/api/events/${eventId}/sessions/`)
      if (!sessionsResponse.ok) {
        throw new Error('Failed to load sessions')
      }
      const sessions = await sessionsResponse.json()

      const session = sessions.find((s: any) =>
        s.speaker_details && s.speaker_details.id === parseInt(speakerId)
      )

      if (session) {
        setSessionData({
          sessionId: session.id,
          sessionName: session.name,
          speakerName: session.speaker_details.full_name
        })
      } else {
        throw new Error('No session found for this speaker in this event')
      }

    } catch (error) {
      console.error('Error loading session data:', error)
      toast.error('Failed to load session information', {
        description: 'Please refresh the page and try again.',
        duration: 4000,
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

      const feedbackData = {
        session: sessionData.sessionId,
        attendee: attendeeId,
        overall_rating: overallRating,
        engagement: ratings.engagement,
        clarity: ratings.clarity,
        content_depth: ratings.contentDepth,
        speaker_knowledge: ratings.speakerKnowledge,
        practical_relevance: ratings.practicalRelevance,
        comment: comment.trim() || null,
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
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Session Information</h3>
                {isLoadingSession ? (
                  <p className="text-sm text-muted-foreground">Loading session details...</p>
                ) : sessionData ? (
                  <>
                    <p className="text-sm text-muted-foreground">{sessionData.sessionName}</p>
                    <p className="text-xs text-muted-foreground">Speaker: {sessionData.speakerName}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Session information will be loaded after verification</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Speaker Profile</h3>
                {isLoadingSpeaker ? (
                  <p className="text-sm text-muted-foreground">Loading speaker details...</p>
                ) : speakerData ? (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 border border-orange-200">
                      {speakerData.avatar ? (
                        <img
                          src={speakerData.avatar.startsWith('http') ? speakerData.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${speakerData.avatar}`}
                          alt={speakerData.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-200 flex items-center justify-center text-orange-700 font-medium">
                          {speakerData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">{speakerData.full_name}</h4>
                      {speakerData.organization && (
                        <p className="text-xs text-orange-700 dark:text-orange-300">{speakerData.organization}</p>
                      )}
                      {speakerData.country && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">{speakerData.country}</p>
                      )}
                      {speakerData.short_bio && (
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1 line-clamp-2">{speakerData.short_bio}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Speaker information will be loaded after verification</p>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Engagement</h3>
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

                <div className="space-y-2">
                  <h3 className="font-medium">Clarity</h3>
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

                <div className="space-y-2">
                  <h3 className="font-medium">Content Depth</h3>
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

                <div className="space-y-2">
                  <h3 className="font-medium">Speaker Knowledge</h3>
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

                <div className="space-y-2">
                  <h3 className="font-medium">Practical Relevance</h3>
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

                <div className="space-y-2">
                  <h3 className="font-medium">Additional Comments</h3>
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
