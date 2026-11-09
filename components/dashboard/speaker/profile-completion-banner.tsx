"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { userApi, type SpeakerProfile, type User } from "@/lib/api/userApi"
import { speakerApi } from "@/lib/api/speakerApi"
import { cn } from "@/lib/utils"
import { calculateProfileCompletion } from "@/lib/utils/profile-completion"

const getMotivationalMessage = (percentage: number, missingFields: string[]) => {
  if (percentage < 30) {
    return {
      emoji: "🚀",
      title: "Let's launch your speaker journey!",
      subtitle: "Your profile is just getting started. Add some details to help organizers discover you!",
    }
  } else if (percentage < 50) {
    return {
      emoji: "🌱",
      title: "Growing nicely!",
      subtitle: "You're making progress! A few more details and you'll be on fire!",
    }
  } else if (percentage < 70) {
    return {
      emoji: "⚡",
      title: "Almost there, superstar!",
      subtitle: `Just add your ${missingFields.slice(0, 2).join(" and ").toLowerCase()} to level up!`,
    }
  } else {
    return {
      emoji: "🎯",
      title: "So close to 100%!",
      subtitle: "You're nearly there! Complete your profile to maximize your visibility!",
    }
  }
}

/** Dribbble-style segmented pill bar: filled blocks + dashed empty blocks */
function SegmentedProgress({ percentage }: { percentage: number }) {
  const totalSegments = 10
  const filledSegments = Math.round((percentage / 100) * totalSegments)

  return (
    <div className="flex items-center gap-1" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: totalSegments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-all duration-500",
            i < filledSegments
              ? "bg-primary"
              : "bg-muted border border-dashed border-border"
          )}
          style={{
            transitionDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  )
}

export function ProfileCompletionBanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    const isDismissed = sessionStorage.getItem("profile-banner-dismissed")
    if (isDismissed) {
      setDismissed(true)
      setLoading(false)
      return
    }

    const fetchSpeakerProfile = async () => {
      try {
        const profile = await userApi.refreshUserProfile() as any
        const profileUser = profile?.user || profile
        const speakerData = await speakerApi.getProfile()

        if (mounted && profileUser && speakerData) {
          calculateCompletion(profileUser, speakerData)
        }
      } catch (error) {
        console.error("Error fetching speaker profile:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (user) {
      fetchSpeakerProfile()
    } else {
      setLoading(false)
    }

    return () => { mounted = false }
  }, [user])

  const calculateCompletion = (profileUser: User, speaker: SpeakerProfile) => {
    const { percentage, missingFields: missing } = calculateProfileCompletion({
      user: {
        first_name: profileUser.first_name,
        last_name: profileUser.last_name,
        username: profileUser.username,
      },
      speaker,
    })
    setCompletionPercentage(percentage)
    setMissingFields(missing.map((field) => field.label))
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem("profile-banner-dismissed", "true")
  }

  if (loading || dismissed || completionPercentage >= 80) return null

  const message = getMotivationalMessage(completionPercentage, missingFields)

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      {/* Dismiss */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-foreground rounded-full z-10"
        onClick={handleDismiss}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Dismiss</span>
      </Button>

      <div className="p-5 sm:p-6 pr-12">
        {/* Emoji + title row */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl leading-none select-none" aria-hidden>
            {message.emoji}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
            {message.title}
          </h3>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
          {message.subtitle}
        </p>

        {/* Segmented progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Profile Completion</span>
            <span className="text-xs font-bold text-foreground tabular-nums">{completionPercentage}%</span>
          </div>
          <SegmentedProgress percentage={completionPercentage} />
        </div>

        {/* Missing field pills — horizontally scrollable */}
        {missingFields.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
            {missingFields.slice(0, 4).map((field) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground whitespace-nowrap border border-border/60"
              >
                <span aria-hidden>📝</span>
                {field}
              </span>
            ))}
            {missingFields.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] text-muted-foreground whitespace-nowrap">
                +{missingFields.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link href="/profile">
          <Button size="sm" className="h-8 text-xs rounded-full gap-1.5 group">
            Complete My Profile
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
