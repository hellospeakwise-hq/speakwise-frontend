"use client"

import type React from "react"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft, Loader2, Building2, Mail,
  MapPin, CalendarDays, MessageSquare
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { organizationApi, type Organization } from "@/lib/api/organizationApi"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { speakerRequestApi } from "@/lib/api/speakerRequestApi"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

type RequestMethod = "select" | "organization" | "email"

export default function RequestSpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [method, setMethod] = useState<RequestMethod>("select")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [events, setEvents] = useState<Event[]>([])

  // Organization form state
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [orgMessage, setOrgMessage] = useState("")
  const [suggestedTopic, setSuggestedTopic] = useState("")
  const [audienceSize, setAudienceSize] = useState("")

  // Email form state
  const [emailEventName, setEmailEventName] = useState("")
  const [emailLocation, setEmailLocation] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to request a speaker")
      router.push(`/signin?redirect=/speakers/${id}/request`)
    }
  }, [authLoading, isAuthenticated, router, id])

  // Check query param for pre-selected method
  useEffect(() => {
    const methodParam = searchParams.get("method")
    if (methodParam === "organization" || methodParam === "email") {
      setMethod(methodParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Don't load data until auth check is complete and user is authenticated
    if (authLoading || !isAuthenticated) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Load speaker details
        const speakerData = await speakerApi.getSpeakerById(id)
        setSpeaker(speakerData)

        // Load user's organizations (only approved ones)
        try {
          const orgs = await organizationApi.getUserOrganizations()
          const approvedOrgs = orgs.filter(org => org.is_active === true)
          setOrganizations(approvedOrgs)

          // Load events for all user's organizations
          if (approvedOrgs.length > 0) {
            const allEventsResponse = await eventsApi.getEvents()
            const allEvents = Array.isArray(allEventsResponse) ? allEventsResponse : (allEventsResponse.results || [])
            const userEvents = allEvents.filter((event: Event) =>
              approvedOrgs.some(org => event.organizer === org.id)
            )
            setEvents(userEvents)
          }
        } catch {
          // User might not have organizations — that's fine now
          setOrganizations([])
        }

      } catch (error) {
        console.error('Error loading data:', error)
        toast.error("Failed to load speaker data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, authLoading, isAuthenticated])

  // Load events when organization is selected
  useEffect(() => {
    const loadOrgEvents = async () => {
      if (!selectedOrgId) {
        setEvents([])
        return
      }

      try {
        const allEventsResponse = await eventsApi.getEvents()
        const allEvents = Array.isArray(allEventsResponse) ? allEventsResponse : (allEventsResponse.results || [])
        const orgEvents = allEvents.filter((event: Event) =>
          event.organizer === selectedOrgId
        )
        setEvents(orgEvents)
      } catch (error) {
        console.error('Error loading organization events:', error)
        toast.error("Failed to load events for this organization")
      }
    }

    loadOrgEvents()
  }, [selectedOrgId])

  // Handle organization form submit (existing flow)
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrgId || !selectedEventId) {
      toast.error("Please select an organization and event")
      return
    }

    if (!orgMessage.trim()) {
      toast.error("Please provide additional details about your request")
      return
    }

    setIsSubmitting(true)

    try {
      let fullMessage = orgMessage.trim()
      if (suggestedTopic.trim()) {
        fullMessage += `\n\nSuggested Topic: ${suggestedTopic.trim()}`
      }
      if (audienceSize) {
        fullMessage += `\n\nExpected Audience Size: ${audienceSize}`
      }

      await speakerRequestApi.createSpeakerRequest({
        organizer: selectedOrgId,
        speaker: speaker!.id,
        event: Number(selectedEventId),
        message: fullMessage,
        status: 'pending'
      })

      toast.success("Speaker request submitted successfully!")
      router.push(`/speakers/${id}?request=success`)
    } catch (error: any) {
      console.error('Error submitting request:', error)
      const errMsg = error.response?.data?.detail
        || error.response?.data?.non_field_errors?.[0]
        || error.message
        || 'Failed to submit request. Please try again.'

      if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('unique set')) {
        toast.error('You have already sent a request to this speaker for this event.')
      } else {
        toast.error(errMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle email form submit (NEW flow)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailEventName.trim()) {
      toast.error("Please enter your event name")
      return
    }
    if (!emailLocation.trim()) {
      toast.error("Please enter the event location")
      return
    }
    if (!emailMessage.trim()) {
      toast.error("Please provide a message for the speaker")
      return
    }

    if (!speaker?.user_account) {
      toast.error("Unable to identify the speaker's account. Please try again.")
      return
    }

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
      console.error('Error submitting email request:', error)
      const errMsg = error.response?.data?.detail
        || error.response?.data?.non_field_errors?.[0]
        || error.message
        || 'Failed to send email request. Please try again.'
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth or if not yet authenticated
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-muted-foreground">Checking authentication...</span>
        </div>
      </div>
    )
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

  const hasApprovedOrgs = organizations.length > 0

  // ── METHOD SELECTION SCREEN ─────────────────────────────────────────────────
  if (method === "select") {
    return (
      <div className="container py-10 max-w-3xl mx-auto">
        <Link
          href={`/speakers/${id}`}
          className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Speaker Profile
        </Link>

        {/* Speaker Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16 border-2 border-border shadow-lg">
            {speaker.avatar ? (
              <AvatarImage src={speaker.avatar} alt={speaker.speaker_name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold">
                {speaker.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Request {speaker.speaker_name}</h1>
            <p className="text-muted-foreground text-sm">{speaker.organization || speaker.short_bio}</p>
          </div>
        </div>

        {/* Method Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">How would you like to send your request?</h2>
          <p className="text-sm text-muted-foreground">Choose the method that works best for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Card */}
          <button
            onClick={() => {
              if (hasApprovedOrgs) {
                setMethod("organization")
              } else {
                toast.error("You need an approved organization to use this method. You can create one or use the email option instead.")
              }
            }}
            className={`group relative text-left rounded-2xl overflow-hidden transition-all duration-300 ${
              hasApprovedOrgs
                ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10'
                : 'cursor-not-allowed opacity-75'
            }`}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative flex flex-col items-center text-center p-8 min-h-[320px]">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                hasApprovedOrgs
                  ? 'bg-orange-500/15 group-hover:bg-orange-500/25 group-hover:scale-110 shadow-lg shadow-orange-500/10'
                  : 'bg-white/5'
              }`}>
                <Building2 className={`h-8 w-8 ${hasApprovedOrgs ? 'text-orange-400' : 'text-slate-500'}`} />
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-3 ${hasApprovedOrgs ? 'text-white' : 'text-slate-400'}`}>
                Organization
              </h3>

              {/* Description */}
              <p className={`text-sm leading-relaxed mb-6 max-w-[240px] ${hasApprovedOrgs ? 'text-slate-400' : 'text-slate-600'}`}>
                Send a request through your organization and select an existing event
              </p>

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA */}
              {hasApprovedOrgs ? (
                <div className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300">
                  Request via Organization
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <div className="w-full rounded-xl bg-white/5 border border-white/10 py-3 px-6 text-sm font-medium text-slate-500">
                    Requires an Organization
                  </div>
                  <Link
                    href="/organizations"
                    className="text-xs text-orange-400 hover:text-orange-300 hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Create one →
                  </Link>
                </div>
              )}
            </div>

            {/* Border glow on hover */}
            <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-orange-500/30 transition-colors duration-300 pointer-events-none" />
          </button>

          {/* Email Card */}
          <button
            onClick={() => setMethod("email")}
            className="group relative text-left rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative flex flex-col items-center text-center p-8 min-h-[320px]">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 group-hover:bg-blue-500/25 group-hover:scale-110 shadow-lg shadow-blue-500/10 flex items-center justify-center mb-6 transition-all duration-300">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3">
                Email
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-[240px]">
                Send a direct email request to this speaker. No organization needed
              </p>

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA */}
              <div className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                Request via Email
              </div>
            </div>

            {/* Border glow on hover */}
            <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-colors duration-300 pointer-events-none" />
          </button>
        </div>
      </div>
    )
  }

  // ── ORGANIZATION REQUEST FORM ───────────────────────────────────────────────
  if (method === "organization") {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <button
          onClick={() => setMethod("select")}
          className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to request options
        </button>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-border">
                {speaker.avatar ? (
                  <AvatarImage src={speaker.avatar} alt={speaker.speaker_name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold">
                    {speaker.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  Request {speaker.speaker_name}
                </CardTitle>
                <CardDescription>Send request through your organization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleOrgSubmit}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Suggested Topic (Optional)</Label>
                  <Input
                    id="topic"
                    placeholder="What would you like the speaker to talk about?"
                    value={suggestedTopic}
                    onChange={(e) => setSuggestedTopic(e.target.value)}
                  />
                </div>

                {/* Required Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="org-message">Additional Details *</Label>
                  <Textarea
                    id="org-message"
                    placeholder="Please provide any additional information about your event, expectations, speaker requirements, etc."
                    rows={6}
                    value={orgMessage}
                    onChange={(e) => setOrgMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setMethod("select")}>
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

  // ── EMAIL REQUEST FORM ──────────────────────────────────────────────────────
  if (method === "email") {
    return (
      <div className="container py-10 max-w-2xl mx-auto">
        <button
          onClick={() => setMethod("select")}
          className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to request options
        </button>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-border">
                {speaker.avatar ? (
                  <AvatarImage src={speaker.avatar} alt={speaker.speaker_name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold">
                    {speaker.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Request {speaker.speaker_name} via Email
                </CardTitle>
                <CardDescription>
                  The speaker will receive an email notification with your request details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-6">
              {/* Info banner */}
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
                {/* Event Name */}
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

                {/* Location */}
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

                {/* Message */}
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
              <Button type="button" variant="outline" onClick={() => setMethod("select")}>
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

  return null
}
