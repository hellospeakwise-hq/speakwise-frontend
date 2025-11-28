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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Loader2 } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { organizationApi, type Organization } from "@/lib/api/organizationApi"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export default function RequestSpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [events, setEvents] = useState<Event[]>([])

  // Form state
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [suggestedTopic, setSuggestedTopic] = useState("")
  const [audienceSize, setAudienceSize] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load speaker details
        const speakerData = await speakerApi.getSpeakerById(id)
        setSpeaker(speakerData)

        // Load user's organizations (only approved ones)
        const orgs = await organizationApi.getUserOrganizations()
        const approvedOrgs = orgs.filter(org => org.is_active === true)
        setOrganizations(approvedOrgs)

        // Check if user has any approved organizations
        if (approvedOrgs.length === 0) {
          toast.error("You need an approved organization to request speakers")
          router.push(`/speakers/${id}`)
          return
        }

        // Load events for all user's organizations
        const allEvents = await eventsApi.getEvents()
        // Filter events that belong to user's organizations
        const userEvents = allEvents.filter(event =>
          approvedOrgs.some(org => event.organizer === org.id)
        )
        setEvents(userEvents)

      } catch (error) {
        console.error('Error loading data:', error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  // Load events when organization is selected
  useEffect(() => {
    const loadOrgEvents = async () => {
      if (!selectedOrgId) {
        setEvents([])
        return
      }

      try {
        const allEvents = await eventsApi.getEvents()
        const orgEvents = allEvents.filter(event =>
          event.organizer === Number(selectedOrgId)
        )
        setEvents(orgEvents)
      } catch (error) {
        console.error('Error loading organization events:', error)
        toast.error("Failed to load events for this organization")
      }
    }

    loadOrgEvents()
  }, [selectedOrgId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrgId || !selectedEventId) {
      toast.error("Please select an organization and event")
      return
    }

    if (!message.trim()) {
      toast.error("Please provide additional details about your request")
      return
    }

    setIsSubmitting(true)

    try {
      // Build message with optional fields
      let fullMessage = message.trim()
      if (suggestedTopic.trim()) {
        fullMessage += `\n\nSuggested Topic: ${suggestedTopic.trim()}`
      }
      if (audienceSize) {
        fullMessage += `\n\nExpected Audience Size: ${audienceSize}`
      }

      await speakerRequestApi.createSpeakerRequest({
        organizer: Number(selectedOrgId),
        speaker: Number(id),
        event: Number(selectedEventId),
        message: fullMessage,
        status: 'pending'
      })

      toast.success("Speaker request submitted successfully!")
      router.push(`/speakers/${id}?request=success`)
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Speaker not found</p>
        </div>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Organizations Available</CardTitle>
            <CardDescription>
              You need an approved organization to request speakers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please create an organization and wait for admin approval before requesting speakers.
            </p>
            <Link href="/organizations">
              <Button>Go to Organizations</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <Link
        href={`/speakers/${id}`}
        className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Speaker Profile
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {speaker.avatar ? (
                <AvatarImage src={speaker.avatar} alt={speaker.speaker_name} />
              ) : (
                <AvatarFallback>
                  {speaker.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle>Request {speaker.speaker_name}</CardTitle>
              <CardDescription>{speaker.organization || speaker.bio}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Organization Selection */}
              <div className="space-y-2">
                <Label htmlFor="organization">Your Organization *</Label>
                <Select value={selectedOrgId} onValueChange={setSelectedOrgId} required>
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select your organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only approved organizations are shown
                </p>
              </div>

              {/* Event Selection */}
              <div className="space-y-2">
                <Label htmlFor="event">Select Event *</Label>
                <Select
                  value={selectedEventId}
                  onValueChange={setSelectedEventId}
                  disabled={!selectedOrgId || events.length === 0}
                  required
                >
                  <SelectTrigger id="event">
                    <SelectValue placeholder={
                      !selectedOrgId
                        ? "Select an organization first"
                        : events.length === 0
                          ? "No events available for this organization"
                          : "Select an event"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name || event.title} - {event.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrgId && events.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No events found for this organization. Please create an event first.
                  </p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="space-y-2">
                <Label htmlFor="audience-size">Expected Audience Size (Optional)</Label>
                <Select value={audienceSize} onValueChange={setAudienceSize}>
                  <SelectTrigger id="audience-size">
                    <SelectValue placeholder="Select audience size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-50">Less than 50</SelectItem>
                    <SelectItem value="50-200">50-200</SelectItem>
                    <SelectItem value="200-500">200-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This field will be saved once backend support is added
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Suggested Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="What would you like the speaker to talk about?"
                  value={suggestedTopic}
                  onChange={(e) => setSuggestedTopic(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This field will be saved once backend support is added
                </p>
              </div>

              {/* Required Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message">Additional Details *</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide any additional information about your event, expectations, speaker requirements, etc."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/speakers/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedOrgId || !selectedEventId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
