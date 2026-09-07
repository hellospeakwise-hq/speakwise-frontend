"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { eventsApi, type CreateEventRequest } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"

const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  event_nickname: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  start_date_time: z.string().min(1, "Start date and time are required"),
  end_date_time: z.string().min(1, "End date and time are required"),
  cfp_open: z.boolean().default(false),
  cfp_link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  cfp_open_date: z.string().optional(),
  cfp_deadline: z.string().optional(),
  cfp_speaker_notification_date: z.string().optional(),
})

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event | null
  onEventSaved: (event: Event) => void
}

export function EventFormDialog({
  open,
  onOpenChange,
  event = null,
  onEventSaved,
}: EventFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event?.event_image || null)

  const toLocalDatetime = (iso: string | null | undefined) => {
    if (!iso) return ""
    try { return new Date(iso).toISOString().slice(0, 16) } catch { return "" }
  }

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      event_nickname: event?.event_nickname || "",
      description: event?.description || "",
      website: event?.website || "",
      location: typeof event?.location === "string" ? event.location : "",
      start_date_time: toLocalDatetime(event?.start_date_time),
      end_date_time: toLocalDatetime(event?.end_date_time),
      cfp_open: event?.cfp_open || false,
      cfp_link: event?.cfp_link || "",
      cfp_open_date: toLocalDatetime(event?.cfp_open_date),
      cfp_deadline: toLocalDatetime(event?.cfp_deadline),
      cfp_speaker_notification_date: event?.cfp_speaker_notification_date || "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: event?.title || "",
        event_nickname: event?.event_nickname || "",
        description: event?.description || "",
        website: event?.website || "",
        location: typeof event?.location === "string" ? event.location : "",
        start_date_time: toLocalDatetime(event?.start_date_time),
        end_date_time: toLocalDatetime(event?.end_date_time),
        cfp_open: event?.cfp_open || false,
        cfp_link: event?.cfp_link || "",
        cfp_open_date: toLocalDatetime(event?.cfp_open_date),
        cfp_deadline: toLocalDatetime(event?.cfp_deadline),
        cfp_speaker_notification_date: event?.cfp_speaker_notification_date || "",
      })
      setImagePreview(event?.event_image || null)
      setSelectedImage(null)
    }
  }, [event, open])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WebP).")
      e.target.value = ""
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB.")
      e.target.value = ""
      return
    }
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    setIsLoading(true)
    try {
      const eventData: CreateEventRequest = {
        title: values.title,
        event_nickname: values.event_nickname,
        description: values.description,
        website: values.website,
        location: values.location,
        start_date_time: values.start_date_time,
        end_date_time: values.end_date_time,
        cfp_open: values.cfp_open,
        cfp_link: values.cfp_link,
        cfp_open_date: values.cfp_open_date || null,
        cfp_deadline: values.cfp_deadline || null,
        cfp_speaker_notification_date: values.cfp_speaker_notification_date || null,
        event_image: selectedImage || undefined,
      }

      let savedEvent: Event
      if (event) {
        savedEvent = await eventsApi.updateEvent(event.slug, eventData)
      } else {
        savedEvent = await eventsApi.createEvent(eventData)
      }

      onEventSaved(savedEvent)
      onOpenChange(false)
      toast.success(`"${savedEvent.title}" ${event ? "updated" : "created"} successfully!`)
      form.reset()
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error saving event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save event.")
    } finally {
      setIsLoading(false)
    }
  }

  const cfpOpen = form.watch("cfp_open")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Update the event details below." : "Fill in the details to create a new event."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Event Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Image</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP — max 10MB</p>
                </div>
                {imagePreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title *</FormLabel>
                <FormControl><Input placeholder="Enter event title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Nickname */}
            <FormField control={form.control} name="event_nickname" render={({ field }) => (
              <FormItem>
                <FormLabel>Event Nickname</FormLabel>
                <FormControl><Input placeholder="Short name or acronym (e.g. TechConf 25)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detailed event description" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Website */}
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl><Input placeholder="https://example.com" type="url" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Location */}
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="City, venue, or Online" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="start_date_time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time *</FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="end_date_time" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time *</FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* CFP toggle */}
            <FormField control={form.control} name="cfp_open" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">CFP is Open</FormLabel>
                  <FormDescription>Allow speakers to submit proposals for this event</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            {/* CFP details — only shown when CFP is open */}
            {cfpOpen && (
              <div className="space-y-4 pl-4 border-l-2 border-border">
                <FormField control={form.control} name="cfp_link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CFP Link</FormLabel>
                    <FormControl><Input placeholder="https://cfp.example.com" type="url" {...field} /></FormControl>
                    <FormDescription>External URL where speakers submit proposals</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="cfp_open_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CFP Opens</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cfp_deadline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CFP Deadline</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="cfp_speaker_notification_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speaker Notification Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormDescription>When speakers will be notified of the outcome</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving…" : event ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
