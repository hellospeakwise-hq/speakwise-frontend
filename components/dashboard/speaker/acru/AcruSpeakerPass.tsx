"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  QrCode,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Check,
  MessageSquare,
  Settings,
  Download,
  Copy,
  ArrowRight,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"
import { feedbackAPI } from "@/lib/api/feedbackApi"
import { eventsApi } from "@/lib/api/events"

interface PartnerEvent {
  name: string
  initial: string
  bg: string
  logoUrl?: string | null
}

const DEFAULT_PARTNERS: PartnerEvent[] = [
  {
    name: "DevFest",
    initial: "DF",
    bg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    logoUrl: "https://www.google.com/s2/favicons?domain=developers.google.com&sz=128",
  },
  {
    name: "PyCon",
    initial: "PY",
    bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    logoUrl: "https://www.google.com/s2/favicons?domain=python.org&sz=128",
  },
  {
    name: "AccraJS",
    initial: "JS",
    bg: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    logoUrl: "https://www.google.com/s2/favicons?domain=javascript.info&sz=128",
  },
  {
    name: "AWS Meetup",
    initial: "AWS",
    bg: "bg-amber-600/10 text-amber-600 border-amber-600/20",
    logoUrl: "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128",
  },
  {
    name: "ETH Accra",
    initial: "ETH",
    bg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    logoUrl: "https://www.google.com/s2/favicons?domain=ethereum.org&sz=128",
  },
  {
    name: "DeafFest",
    initial: "DF",
    bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    logoUrl: "https://www.google.com/s2/favicons?domain=deaffest.co.uk&sz=128",
  },
]

/**
 * Resolves a high-res logo URL for a conference using:
 * 1. Uploaded event image from database if available
 * 2. Official website domain favicon via Google Favicon API (free, reliable, high-res)
 * 3. Recognized tech conference domain heuristics
 */
function resolveConferenceLogo(name: string, customImage?: string | null, website?: string | null): string {
  if (customImage) return customImage

  if (website) {
    try {
      const url = new URL(website.startsWith("http") ? website : `https://${website}`)
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`
    } catch {}
  }

  const lower = name.toLowerCase()
  if (lower.includes("devfest") || lower.includes("gdg") || lower.includes("google")) {
    return "https://www.google.com/s2/favicons?domain=developers.google.com&sz=128"
  }
  if (lower.includes("pycon") || lower.includes("python") || lower.includes("django")) {
    return "https://www.google.com/s2/favicons?domain=python.org&sz=128"
  }
  if (lower.includes("js") || lower.includes("javascript") || lower.includes("react")) {
    return "https://www.google.com/s2/favicons?domain=react.dev&sz=128"
  }
  if (lower.includes("aws") || lower.includes("cloud")) {
    return "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128"
  }
  if (lower.includes("eth") || lower.includes("crypto") || lower.includes("web3")) {
    return "https://www.google.com/s2/favicons?domain=ethereum.org&sz=128"
  }
  if (lower.includes("deaf") || lower.includes("deaffest")) {
    return "https://www.google.com/s2/favicons?domain=deaffest.co.uk&sz=128"
  }

  // Universal fallback via DuckDuckGo favicon
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(name.trim().split(" ")[0].toLowerCase())}.org.ico`
}

/**
 * Conference avatar with automatic logo loading and initial fallback
 */
function ConferenceLogoAvatar({
  name,
  logoUrl,
  initial,
  bgClass,
}: {
  name: string
  logoUrl?: string | null
  initial: string
  bgClass: string
}) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shadow-2xs bg-white dark:bg-card shrink-0">
      {!imgFailed && logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="h-6 w-6 object-contain rounded-full"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      ) : (
        <div className={`h-full w-full flex items-center justify-center text-xs font-bold ${bgClass}`}>
          {initial}
        </div>
      )}
    </div>
  )
}

interface AcruSpeakerPassProps {
  speakerName?: string
  headline?: string
  onOpenQr?: () => void
}

export function AcruSpeakerPass({
  speakerName = "Nana Acheampong",
  headline = "Senior Cloud Architect & Speaker",
  onOpenQr,
}: AcruSpeakerPassProps) {
  const [copied, setCopied] = useState(false)
  const [partners, setPartners] = useState<PartnerEvent[]>(DEFAULT_PARTNERS)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [latestExperience, setLatestExperience] = useState<SpeakerExperience | null>(null)
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const handleOpenQrModal = async () => {
    if (onOpenQr) {
      onOpenQr()
      return
    }
    setIsQrModalOpen(true)
    if (latestExperience?.feedback_slug && !qrBlobUrl) {
      setQrLoading(true)
      try {
        const blob = await feedbackAPI.getQRCodeBlobUrl(latestExperience.feedback_slug)
        setQrBlobUrl(blob)
      } catch (err) {
        console.warn("Could not load backend QR blob, using profile QR fallback", err)
      } finally {
        setQrLoading(false)
      }
    }
  }

  useEffect(() => {
    // Dynamically fetch the speaker's real experiences and try to resolve their conference logos
    Promise.allSettled([
      experiencesApi.getMyExperiences(),
      eventsApi.getEvents(),
    ]).then(([expResult, evtResult]) => {
      const myExperiences = expResult.status === "fulfilled" ? expResult.value : []
      if (myExperiences.length > 0) {
        setLatestExperience(myExperiences[0])
      }
      const allEvents =
        evtResult.status === "fulfilled"
          ? Array.isArray(evtResult.value)
            ? evtResult.value
            : evtResult.value?.results || []
          : []

      if (myExperiences.length > 0) {
        // Build map of event title -> event record for quick logo/website lookup
        const eventMap = new Map<string, any>()
        allEvents.forEach((evt: any) => {
          if (evt.title) eventMap.set(evt.title.toLowerCase().trim(), evt)
        })

        // Extract distinct events from speaker's experiences
        const uniqueEventNames = Array.from(
          new Set(myExperiences.map((e) => e.event_name).filter(Boolean))
        )

        const dynamicPartners: PartnerEvent[] = uniqueEventNames.slice(0, 6).map((name) => {
          const matchedEvt = eventMap.get(name.toLowerCase().trim())
          const initial = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()

          return {
            name,
            initial: initial || "EV",
            bg: "bg-primary/10 text-primary border-primary/20",
            logoUrl: resolveConferenceLogo(
              name,
              matchedEvt?.event_image,
              matchedEvt?.website
            ),
          }
        })

        // If speaker has experiences, show their real conferences; pad with defaults if fewer than 4
        if (dynamicPartners.length > 0) {
          const combined = [
            ...dynamicPartners,
            ...DEFAULT_PARTNERS.filter(
              (def) => !dynamicPartners.some((p) => p.name.toLowerCase() === def.name.toLowerCase())
            ),
          ].slice(0, 6)
          setPartners(combined)
        }
      }
    })
  }, [])

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin)
      setCopied(true)
      toast.success("Speaker profile link copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* ── Header Row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            Speaker Pass
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Digital credential &amp; quick actions
          </p>
        </div>
        <Link
          href="/dashboard/speaker/experiences"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Add Talk</span>
        </Link>
      </div>

      {/* ── Tactile Physical Speaker Card (Reference: Matte Olive/Sage Green Card) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5E9E3B] text-white p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[195px] select-none transition-transform hover:scale-[1.01] duration-200">
        {/* Subtle physical texture & specular highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />

        {/* Top Card Row */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              Verified Speaker
            </span>
            <p className="mt-1.5 text-xs text-white/90 font-medium tracking-wide">
              SpeakWise Pro
            </p>
          </div>
          {/* Hologram / Brand Mark */}
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
            <span className="font-heading text-xs font-bold tracking-tight">SPK</span>
            <span className="h-2 w-2 rounded-full bg-amber-300" />
          </div>
        </div>

        {/* Metallic Chip Element */}
        <div className="relative z-10 my-3 sm:my-4">
          <div className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-600/40 shadow-xs flex items-center justify-center">
            <div className="h-4 w-6 border-y border-amber-700/30 grid grid-cols-2 gap-1">
              <span className="border-r border-amber-700/30" />
              <span />
            </div>
          </div>
        </div>

        {/* Bottom Card Row */}
        <div className="relative z-10 flex items-end justify-between pt-1">
          <div>
            <p className="font-mono text-sm sm:text-base tracking-[0.2em] text-white/95 font-medium">
              •••• •••• •••• 7890
            </p>
            <p className="mt-1 text-xs sm:text-sm font-semibold tracking-tight text-white capitalize line-clamp-1">
              {speakerName}
            </p>
          </div>
          <div className="text-right shrink-0 pl-2">
            <p className="text-[9px] uppercase tracking-wider text-white/70 font-medium">
              Valid Thru
            </p>
            <p className="font-mono text-xs sm:text-sm font-medium text-white/95 mt-0.5">
              12/28
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Action Icon Buttons (ACRU Clean Tactile Buttons: 4 buttons, CFPs removed) ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* QR Pass */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleOpenQrModal}
            title="Open QR Pass"
            aria-label="Open QR Pass"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-muted/60 hover:bg-muted border border-border/70 flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
          >
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            QR Pass
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Share Speaker Profile"
            aria-label="Share Speaker Profile"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-muted/60 hover:bg-muted border border-border/70 flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
          >
            {copied ? (
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            ) : (
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            {copied ? "Copied" : "Share"}
          </span>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <Link
            href="/profile"
            title="View Public Profile"
            aria-label="View Public Profile"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-muted/60 hover:bg-muted border border-border/70 flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95 shadow-2xs"
          >
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            Profile
          </span>
        </div>

        {/* More Options Dropdown */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="More Options"
                aria-label="More Options"
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-muted/60 hover:bg-muted border border-border/70 flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-xl rounded-xl">
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/speaker/experiences"
                  className="flex items-center gap-2 cursor-pointer text-xs py-2"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Add Presentation</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/speaker/feedback"
                  className="flex items-center gap-2 cursor-pointer text-xs py-2"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Attendee Reviews</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/speaker/experiences"
                  className="flex items-center gap-2 cursor-pointer text-xs py-2"
                >
                  <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Slide QR Codes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 cursor-pointer text-xs py-2"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Speaker Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            More
          </span>
        </div>
      </div>

      {/* ── Frequent Event Partners (With High-Res Conference Logos) ────────── */}
      <div className="pt-3 border-t border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground tracking-tight">
            Frequent Event Partners
          </span>
          <span className="text-[11px] text-muted-foreground">Recent</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center gap-1.5 shrink-0 min-w-[54px] group cursor-pointer"
            >
              {/* Conference Logo Avatar with live image and fallback */}
              <ConferenceLogoAvatar
                name={partner.name}
                logoUrl={partner.logoUrl}
                initial={partner.initial}
                bgClass={partner.bg}
              />
              <span className="text-[11px] text-muted-foreground group-hover:text-foreground font-medium text-center truncate w-full transition-colors">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Speaker QR Pass Dialog Modal ────────────────────────────────────── */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              <span>Speaker Digital Pass &amp; Slide QR</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {latestExperience
                ? `Active presentation feedback QR for "${latestExperience.topic}"`
                : "Your verified speaker pass and audience feedback QR code."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border/70 my-2 space-y-3">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-border/40">
              {qrLoading ? (
                <div className="h-48 w-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <img
                  src={
                    qrBlobUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      typeof window !== "undefined"
                        ? latestExperience?.feedback_slug
                          ? `${window.location.origin}/rate/${latestExperience.feedback_slug}`
                          : window.location.href
                        : "https://speakwise.co"
                    )}`
                  }
                  alt="Speaker QR Pass"
                  className="h-48 w-48 object-contain"
                />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">
                {latestExperience?.topic || `${speakerName}'s Speaker Pass`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {latestExperience?.event_name
                  ? `${latestExperience.event_name} · Attendees scan to rate live`
                  : "Scan with any phone camera to view profile and submit reviews"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1 text-xs h-8 gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const qrUrl =
                  qrBlobUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? latestExperience?.feedback_slug
                        ? `${window.location.origin}/rate/${latestExperience.feedback_slug}`
                        : window.location.href
                      : "https://speakwise.co"
                  )}`
                const a = document.createElement("a")
                a.href = qrUrl
                a.download = `speaker-pass-qr.png`
                a.click()
                toast.success("QR code downloaded!")
              }}
              className="flex-1 text-xs h-8 gap-1.5 bg-[#72A847] hover:bg-[#62923C] text-white border-transparent"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </Button>
          </div>

          <div className="pt-2 border-t border-border/50 text-center">
            <Link
              href="/dashboard/speaker/experiences"
              onClick={() => setIsQrModalOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>Manage all talk presentation QRs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
