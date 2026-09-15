"use client"

import type React from "react"
import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Loader2, Mail } from "lucide-react"
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
      <div className="container py-16 max-w-xl mx-auto flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        <span className="ml-2.5 text-sm text-muted-foreground">Checking authentication...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-16 max-w-xl mx-auto flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        <span className="ml-2.5 text-sm text-muted-foreground">Loading speaker details...</span>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div className="container py-16 max-w-xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">Speaker not found</p>
      </div>
    )
  }

  return (
    <div className="container py-8 sm:py-12 max-w-xl mx-auto px-4">
      {/* Back button */}
      <button
        onClick={() => router.push(`/speakers/${id}`)}
        className="inline-flex items-center mb-5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
        Back to Speaker Profile
      </button>

      {/* Main card with the modal design style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white text-zinc-900 rounded-[28px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] p-7 sm:p-9 border-0"
      >
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <Avatar className="h-13 w-13 rounded-2xl border border-zinc-100 shadow-sm">
            {speaker.avatar ? (
              <AvatarImage src={getAvatarUrl(speaker.avatar)} alt={speaker.speaker_name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-zinc-950 text-white font-semibold rounded-2xl text-sm">
                {speaker.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
              Request {speaker.speaker_name}
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Send a speaking invitation directly to their inbox
            </p>
          </div>
        </div>

        {/* Informative banner */}
        <div className="rounded-2xl bg-[#f8f9fa] border border-zinc-100 p-4 mb-6 flex items-start gap-3">
          <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="h-4 w-4" />
          </div>
          <div className="text-[12.5px] leading-relaxed text-zinc-600">
            <span className="font-semibold text-zinc-900 block mb-0.5">How email requests work</span>
            Your invitation is delivered straight to {speaker.speaker_name}&apos;s verified email. They can review event details and accept or decline from their SpeakWise dashboard.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-name" className="text-xs font-medium text-zinc-700 block mb-1.5">
                Event Name <span className="text-zinc-400">*</span>
              </Label>
              <Input
                id="event-name"
                placeholder="e.g. NextGen Web Summit 2026"
                value={emailEventName}
                onChange={(e) => setEmailEventName(e.target.value)}
                className="bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-11 placeholder:text-zinc-400 transition-all"
                required
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-xs font-medium text-zinc-700 block mb-1.5">
                Event Location <span className="text-zinc-400">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Nairobi, Kenya or Virtual (Zoom)"
                value={emailLocation}
                onChange={(e) => setEmailLocation(e.target.value)}
                className="bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-11 placeholder:text-zinc-400 transition-all"
                required
              />
            </div>

            <div>
              <Label htmlFor="email-message" className="text-xs font-medium text-zinc-700 block mb-1.5">
                Your Message <span className="text-zinc-400">*</span>
              </Label>
              <Textarea
                id="email-message"
                placeholder="Introduce your event, suggested session topics, expected audience, dates, or honorarium details..."
                rows={5}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm placeholder:text-zinc-400 transition-all p-3.5 resize-none leading-relaxed"
                required
              />
              <p className="text-[11.5px] text-zinc-400 mt-1.5">
                Be detailed and personal — thoughtful invitations get accepted much faster.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/speakers/${id}`)}
              className="h-auto py-3.5 px-5 rounded-2xl border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-sm transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !emailEventName.trim() || !emailLocation.trim() || !emailMessage.trim()}
              className="bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-sm py-3.5 px-6 h-auto rounded-2xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending invitation...
                </>
              ) : (
                "Send Email Request"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
