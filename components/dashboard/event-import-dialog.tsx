"use client"

import { useState } from "react"
import NextImage from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Globe,
  Link2,
  Loader2,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Ticket,
  Image as ImageIcon,
} from "lucide-react"
import { eventsApi, type EventImportPreview } from "@/lib/api/events"

interface EventImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: (preview: EventImportPreview) => void
}

const PLATFORM_LABELS: Record<string, string> = {
  meetup: "Meetup",
  eventbrite: "Eventbrite",
  luma: "Lu.ma",
  devfolio: "Devfolio",
  konfhub: "KonfHub",
  generic: "Web page",
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function EventImportDialog({ open, onOpenChange, onImported }: EventImportDialogProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<EventImportPreview | null>(null)

  const handleReset = () => {
    setUrl("")
    setPreview(null)
  }

  const handleClose = (v: boolean) => {
    if (!v) handleReset()
    onOpenChange(v)
  }

  const handleFetch = async () => {
    if (!url.trim()) return
    setLoading(true)
    setPreview(null)
    try {
      const result = await eventsApi.importPreview(url.trim())
      setPreview(result)
    } catch (err: any) {
      const detail =
        err?.response?.data?.url?.[0] ||
        err?.response?.data?.detail ||
        "Could not fetch the event page. Make sure the URL is public and try again."
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (!preview) return
    onImported(preview)
    handleClose(false)
  }

  const { draft, missing_fields = [], warnings = [], platform } = preview ?? {}
  const platformLabel = PLATFORM_LABELS[platform ?? ""] ?? platform ?? "Unknown"
  const hasMissing = missing_fields.length > 0
  const hasWarnings = warnings.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Import Event from URL
          </DialogTitle>
          <DialogDescription>
            Paste a public event link (Meetup, Lu.ma, Eventbrite, Devfolio, etc.) and we&apos;ll
            prefill the event form for you.
          </DialogDescription>
        </DialogHeader>

        {/* URL input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="import-url-input"
              placeholder="https://lu.ma/my-event or https://www.meetup.com/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (preview) setPreview(null)
              }}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleFetch()}
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button onClick={handleFetch} disabled={loading || !url.trim()} className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
          </Button>
        </div>

        {/* Preview panel */}
        {preview && draft && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            {/* Platform badge + title + image */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <Badge variant="secondary" className="text-xs capitalize">
                  {platformLabel}
                </Badge>
                <p className="text-lg font-semibold leading-tight">
                  {draft.title ?? <span className="text-muted-foreground italic">No title found</span>}
                </p>
              </div>
              {draft.event_image_url ? (
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border">
                  <NextImage
                    src={draft.event_image_url}
                    alt="Event image preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            <Separator />

            {/* Key fields */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">Start:</span>{" "}
                  <span className="text-muted-foreground">{formatDate(draft.start_date_time)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">End:</span>{" "}
                  <span className="text-muted-foreground">{formatDate(draft.end_date_time)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  <span className="text-muted-foreground">
                    {[draft.location, draft.country].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">Admission:</span>{" "}
                  <span className="text-muted-foreground">
                    {draft.is_free === true ? "Free" : draft.is_free === false ? "Ticketed" : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description preview */}
            {draft.description && (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {draft.description}
              </p>
            )}

            <Separator />

            {/* Missing fields */}
            {hasMissing && (
              <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className="font-medium">Fields you&apos;ll need to fill in:</span>{" "}
                  <span>{missing_fields.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {hasWarnings && (
              <div className="space-y-1">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* All good */}
            {!hasMissing && !hasWarnings && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                All fields extracted, just review and submit!
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          {preview ? (
            <Button onClick={handleImport} className="gap-2">
              Fill event form
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFetch} disabled={loading || !url.trim()} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Fetching…" : "Preview"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
