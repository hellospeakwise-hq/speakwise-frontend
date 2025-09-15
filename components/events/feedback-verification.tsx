"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState("in-person")

  const handleVerify = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address")
      return
    }

    setIsVerifying(true)
    setErrorMessage("")

    try {
      const result = await feedbackAPI.verifyAttendee(email.trim(), parseInt(eventId))

      if (result.verified) {
        setVerificationResult("success")
        setTimeout(() => {
          onVerificationComplete(true, email.trim())
        }, 1500)
      } else {
        setVerificationResult("error")
        setErrorMessage(result.message || "Attendee verification failed")
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult("error")
      setErrorMessage("Failed to verify attendance. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVirtualAttendee = () => {
    // For virtual attendees, we skip verification but still pass a flag
    onVerificationComplete(true, "virtual-attendee")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Attendance</CardTitle>
        <CardDescription>Before providing feedback, we need to verify your attendance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="in-person" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in-person">In-Person Attendee</TabsTrigger>
            <TabsTrigger value="virtual">Virtual Attendee</TabsTrigger>
          </TabsList>
          <TabsContent value="in-person" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter the email you used for registration"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isVerifying || verificationResult === "success"}
              />
              <p className="text-xs text-muted-foreground">
                We'll check this against the attendance list provided by the event organizer.
              </p>
            </div>

            {verificationResult === "success" && (
              <Alert
                variant="default"
                className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Verification Successful</AlertTitle>
                <AlertDescription>Your attendance has been verified. You can now provide feedback.</AlertDescription>
              </Alert>
            )}

            {verificationResult === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage || "We couldn't verify your attendance. Please check your email or contact the event organizer."}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          <TabsContent value="virtual" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              As a virtual attendee, you can provide feedback without email verification. Your feedback will be marked
              as coming from a virtual attendee.
            </p>
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-md dark:bg-orange-900/10 dark:border-orange-900/20">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Note:</p>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                By continuing, you confirm that you attended this session virtually and are providing honest feedback
                based on your experience.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === "in-person" ? (
          <Button
            onClick={handleVerify}
            disabled={!email || isVerifying || verificationResult === "success"}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify Attendance"}
          </Button>
        ) : (
          <Button onClick={handleVirtualAttendee} className="w-full">
            Continue as Virtual Attendee
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
