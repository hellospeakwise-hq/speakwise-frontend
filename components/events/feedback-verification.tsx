"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { feedbackAPI } from "@/lib/api/feedbackApi"

interface FeedbackVerificationProps {
  eventId: string
  speakerId: string
  onVerificationComplete: (verified: boolean, verifiedEmail?: string) => void
}

export function FeedbackVerification({ eventId, speakerId, onVerificationComplete }: FeedbackVerificationProps) {
  const [email, setEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<"success" | "error" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleVerify = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address")
      return
    }

    setIsVerifying(true)
    setErrorMessage("")

    try {
      // Call verification endpoint with email and event ID
      // Backend checks if this email is in the attendance list for this specific event
      const result = await feedbackAPI.verifyAttendeeEmail(email.trim(), eventId)

      console.log('🔍 Verification result:', result)

      if (result.verified && result.is_attendee) {
        setVerificationResult("success")
        setTimeout(() => {
          onVerificationComplete(true, email.trim())
        }, 1500)
      } else {
        setVerificationResult("error")
        setErrorMessage(result.message || "You are not registered as an attendee for this event. Please check your email or contact the event organizer.")
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult("error")
      setErrorMessage("Failed to verify attendance. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Attendance</CardTitle>
        <CardDescription>
          Before providing feedback, please verify that you attended this event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter the email you used to register for the event"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isVerifying || verificationResult === "success"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email.trim() && !isVerifying && verificationResult !== "success") {
                handleVerify()
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Enter the email address you used when registering for this event. We&apos;ll verify it against the attendance list.
          </p>
        </div>

        {verificationResult === "success" && (
          <Alert
            variant="default"
            className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30"
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Attendance Verified! ✓</AlertTitle>
            <AlertDescription>
              Your attendance has been confirmed. You can now provide anonymous feedback for this speaker.
            </AlertDescription>
          </Alert>
        )}

        {verificationResult === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              <p>{errorMessage || "We couldn&apos;t verify your attendance. Please ensure you&apos;re using the email address you registered with."}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-md dark:bg-blue-900/10 dark:border-blue-900/20">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">📝 Note on Anonymous Feedback</p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Your feedback will remain completely anonymous. We only verify your attendance to ensure feedback comes from actual event attendees.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-3 rounded-md dark:bg-gray-900/20 dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <strong>Virtual/Online attendees:</strong> Feedback feature coming soon! We&apos;re working on a verification system for virtual attendees.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleVerify}
          disabled={!email || isVerifying || verificationResult === "success"}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify Attendance"}
        </Button>
      </CardFooter>
    </Card>
  )
}
