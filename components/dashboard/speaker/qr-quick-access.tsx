"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  QrCode,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
  Copy,
  Check,
  Download,
  Eye,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"
import { feedbackAPI } from "@/lib/api/feedbackApi"
import { AddExperienceDialog } from "@/components/speakers/add-experience-dialog"
import { toast } from "sonner"
import { format } from "date-fns"

const HOW_STEPS = [
  {
    icon: Award,
    title: "Add your talk details",
    detail: "Enter your event name, presentation topic, and date in less than 30 seconds.",
  },
  {
    icon: QrCode,
    title: "Instant QR code ready",
    detail: "A unique feedback QR code and link are generated automatically with no extra setup.",
  },
  {
    icon: BarChart3,
    title: "Collect live feedback",
    detail: "Drop the QR code onto your slides. Attendees scan and submit ratings from their phones.",
  },
]

export function QrQuickAccess() {
  const [experiences, setExperiences] = useState<SpeakerExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [qrLoadingId, setQrLoadingId] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // QR Preview dialog state
  const [previewExp, setPreviewExp] = useState<SpeakerExperience | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true)
      const data = await experiencesApi.getMyExperiences()
      setExperiences(data)
    } catch (err) {
      console.error("Failed to load experiences in QrQuickAccess:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExperiences()
  }, [loadExperiences])

  const handleDownloadQR = async (experience: SpeakerExperience) => {
    if (!experience.feedback_slug || qrLoadingId) return
    setQrLoadingId(experience.id ?? null)
    let blobUrl: string | null = null
    try {
      blobUrl = await feedbackAPI.getQRCodeBlobUrl(experience.feedback_slug)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `qr-${experience.feedback_slug}.png`
      a.click()
      toast.success("QR code downloaded!")
    } catch (error: any) {
      console.error("Error downloading QR code:", error)
      toast.error(error?.message || "Failed to download QR code")
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setQrLoadingId(null)
    }
  }

  const handleCopyLink = (experience: SpeakerExperience) => {
    if (!experience.feedback_slug) return
    const url = `${window.location.origin}/feedback/${experience.feedback_slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(experience.feedback_slug!)
      toast.success("Feedback link copied to clipboard")
      setTimeout(() => setCopiedSlug(null), 2000)
    })
  }

  const handleOpenPreview = async (experience: SpeakerExperience) => {
    if (!experience.feedback_slug) return
    setPreviewExp(experience)
    setPreviewLoading(true)
    try {
      const url = await feedbackAPI.getQRCodeBlobUrl(experience.feedback_slug)
      setPreviewBlobUrl(url)
    } catch (error: any) {
      console.error("Failed to load QR code preview:", error)
      toast.error(error?.message || "Failed to load QR code preview")
      setPreviewExp(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl)
    }
    setPreviewBlobUrl(null)
    setPreviewExp(null)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return format(date, "MMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const hasExperiences = experiences.length > 0
  const recentExperiences = experiences.slice(0, 3)

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-foreground">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Feedback QR Codes for Your Talks
                </h3>
                <Badge variant="outline" className="text-[11px] font-normal border-border text-muted-foreground">
                  Instant
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
                Every talk you add generates a unique QR code automatically. Add it to your slides and let attendees rate your presentation in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <AddExperienceDialog
              onSuccess={() => loadExperiences()}
              trigger={
                <Button size="sm" className="h-8 text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Talk & Get QR
                </Button>
              }
            />
          </div>
        </div>

        {/* Content: Experiences List or First-time Guide */}
        <div className="mt-5 pt-4 border-t border-border">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              Loading your talk QR codes...
            </div>
          ) : hasExperiences ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Recent Talks Ready for Feedback</span>
                <Link
                  href="/dashboard/speaker/experiences"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  View all ({experiences.length})
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex flex-col justify-between rounded-lg border border-border bg-background p-4 hover:border-border/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                          {exp.topic}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0 border-border text-muted-foreground"
                        >
                          {exp.feedback_enabled !== false ? "Open" : "Paused"}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">{exp.event_name}</span>
                        {exp.event_date && (
                          <>
                            <span>·</span>
                            <span className="shrink-0">{formatDate(exp.event_date)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenPreview(exp)}
                        title="Preview QR Code"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyLink(exp)}
                          title="Copy audience feedback URL"
                        >
                          {copiedSlug === exp.feedback_slug ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedSlug === exp.feedback_slug ? "Copied" : "Link"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[11px] gap-1 hover:bg-accent"
                          disabled={qrLoadingId === exp.id}
                          onClick={() => handleDownloadQR(exp)}
                          title="Download QR code image for your presentation"
                        >
                          {qrLoadingId === exp.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          QR PNG
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* First-time state: 3-step walk-through */
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {HOW_STEPS.map((step, i) => (
                  <div
                    key={step.title}
                    className="rounded-lg border border-border bg-background p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                        0{i + 1}
                      </span>
                      <step.icon className="h-3.5 w-3.5 text-foreground" />
                      <p className="text-xs font-semibold text-foreground">{step.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  Add a talk you gave or are planning to deliver to get your first QR code.
                </p>
                <div className="flex items-center gap-2">
                  <AddExperienceDialog
                    onSuccess={() => loadExperiences()}
                    trigger={
                      <Button size="sm" className="h-8 text-xs gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Add First Talk
                      </Button>
                    }
                  />
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard/speaker/experiences">
                      Go to Experiences
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible "How does live feedback work?" for users who already have experiences */}
          {hasExperiences && (
            <div className="mt-4 pt-3 border-t border-border">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>How audience feedback works</span>
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 grid gap-3 sm:grid-cols-3"
                  >
                    {HOW_STEPS.map((step, i) => (
                      <div
                        key={step.title}
                        className="rounded-lg border border-border bg-background p-3 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                            0{i + 1}
                          </span>
                          <step.icon className="h-3.5 w-3.5 text-foreground" />
                          <p className="text-xs font-semibold text-foreground">{step.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Preview Modal */}
      <Dialog open={previewExp !== null} onOpenChange={(open) => !open && handleClosePreview()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-foreground" />
              Audience Feedback QR Code
            </DialogTitle>
            <DialogDescription className="text-xs">
              Project this QR code on your final slide or print it so attendees can submit live feedback.
            </DialogDescription>
          </DialogHeader>

          {previewExp && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/40 p-3 border border-border/60">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{previewExp.topic}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {previewExp.event_name} {previewExp.event_date && `· ${formatDate(previewExp.event_date)}`}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border shadow-inner">
                {previewLoading ? (
                  <div className="h-52 w-52 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs">Generating QR image...</span>
                  </div>
                ) : previewBlobUrl ? (
                  <Image
                    src={previewBlobUrl}
                    alt={`Feedback QR for ${previewExp.topic}`}
                    width={224}
                    height={224}
                    unoptimized
                    className="h-56 w-56 object-contain"
                  />
                ) : (
                  <div className="h-52 flex items-center justify-center text-xs text-destructive">
                    Failed to render QR code
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-[11px] text-muted-foreground">
                  URL:{" "}
                  <span className="font-mono text-foreground font-medium">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/feedback/${previewExp.feedback_slug}`
                      : `/feedback/${previewExp.feedback_slug}`}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => handleCopyLink(previewExp)}
                >
                  {copiedSlug === previewExp.feedback_slug ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedSlug === previewExp.feedback_slug ? "Copied Link" : "Copy URL"}
                </Button>

                <Button
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => handleDownloadQR(previewExp)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PNG
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
