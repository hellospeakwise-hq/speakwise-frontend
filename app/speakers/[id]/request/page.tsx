"use client"

import type React from "react"
import { useState, use, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Loader2, Mail, MapPin, CalendarDays, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { getAvatarUrl } from "@/lib/utils"

export default function RequestSpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [speaker, setSpeaker] = useState<Speaker | null>(null)

  const [emailEventName, setEmailEventName] = useState("")
  const [emailLocation, setEmailLocation] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to request a speaker")
      router.push(`/signin?redirect=/speakers/${id}/request`)
    }
  }, [authLoading, isAuthenticated, router, id])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    const loadData = async () => {
      try {
        setLoading(true)
        const speakerData = await speakerApi.getSpeakerById(id)
        setSpeaker(speakerData)
      } catch {
        toast.error("Failed to load speaker data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, authLoading, isAuthenticated])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailEventName.trim()) return toast.error("Please enter your event name")
    if (!emailLocation.trim()) return toast.error("Please enter the event location")
    if (!emailMessage.trim()) return toast.error("Please provide a message for the speaker")
    if (!speaker?.user_account) return toast.error("Unable to identify the speaker's account.")

    setIsSubmitting(true)
    try {
      await speakerRequestApi.createEmailRequest({
        event: emailEventName.trim(),
        location: emailLocation.trim(),
        message: emailMessage.trim(),
        speaker_id: speaker.user_account,
      })
      toast.success("Email request sent successfully! The speaker will be notified via email.")
      router.push(`/speakers/${id}?request=success`)
    } catch (error: any) {
      const errMsg = error.response?.data?.detail
        || error.response?.data?.non_field_errors?.[0]
        || error.message
        || 'Failed to send email request. Please try again.'
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container py-10 max-w-2xl mx-auto flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-muted-foreground">Checking authentication...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-10 max-w-2xl mx-auto flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div className="container py-10 max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Speaker not found</p>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/speakers/${id}`)}
        className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Speaker Profile
      </button>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-border">
              {speaker.avatar ? (
                <AvatarImage src={getAvatarUrl(speaker.avatar)} alt={speaker.speaker_name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold">
                  {speaker.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Request {speaker.speaker_name}
              </CardTitle>
              <CardDescription>
                The speaker will receive an email notification with your request details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <Mail className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">How email requests work</p>
                <p className="text-muted-foreground mt-1">
                  Your request will be sent directly to the speaker&apos;s email. They can accept or decline from their SpeakWise dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-name" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-orange-500" />
                  Event Name *
                </Label>
                <Input
                  id="event-name"
                  placeholder="e.g. TechConf Africa 2026"
                  value={emailEventName}
                  onChange={(e) => setEmailEventName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Event Location *
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Nairobi, Kenya or Virtual"
                  value={emailLocation}
                  onChange={(e) => setEmailLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-orange-500" />
                  Your Message *
                </Label>
                <Textarea
                  id="email-message"
                  placeholder="Tell the speaker about your event, what topics you'd like them to cover, expected audience, dates, and any other relevant details..."
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Be detailed — this is the first impression the speaker will get of your event.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/speakers/${id}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !emailEventName.trim() || !emailLocation.trim() || !emailMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email Request
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
