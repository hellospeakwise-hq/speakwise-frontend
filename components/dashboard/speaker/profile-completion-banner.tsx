"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface ProfileField {
  key: keyof Speaker
  label: string
  weight: number
}

const PROFILE_FIELDS: ProfileField[] = [
  { key: "avatar", label: "Profile photo", weight: 20 },
  { key: "short_bio", label: "Short bio", weight: 20 },
  { key: "long_bio", label: "Detailed bio", weight: 15 },
  { key: "organization", label: "Organization", weight: 15 },
  { key: "country", label: "Location", weight: 10 },
  { key: "skill_tags", label: "Skills/Expertise", weight: 10 },
  { key: "social_links", label: "Social links", weight: 10 },
]

// Fun messages based on completion percentage
const getMotivationalMessage = (percentage: number, missingFields: string[]) => {
  if (percentage < 30) {
    return {
      emoji: "🚀",
      title: "Let's launch your speaker journey!",
      subtitle: "Your profile is just getting started. Add some details to help organizers discover you!",
      mascotMood: "excited"
    }
  } else if (percentage < 50) {
    return {
      emoji: "🌱",
      title: "Growing nicely!",
      subtitle: "You're making progress! A few more details and you'll be on fire!",
      mascotMood: "happy"
    }
  } else if (percentage < 70) {
    return {
      emoji: "⚡",
      title: "Almost there, superstar!",
      subtitle: `Just add your ${missingFields.slice(0, 2).join(" and ").toLowerCase()} to level up!`,
      mascotMood: "encouraging"
    }
  } else {
    return {
      emoji: "🎯",
      title: "So close to 100%!",
      subtitle: "You're nearly there! Complete your profile to maximize your visibility!",
      mascotMood: "cheering"
    }
  }
}

export function ProfileCompletionBanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    let mounted = true

    // Check if banner was dismissed in this session
    const isDismissed = sessionStorage.getItem("profile-banner-dismissed")
    if (isDismissed) {
      setDismissed(true)
      setLoading(false)
      return
    }

    const fetchSpeakerProfile = async () => {
      try {
        // Get current user's speaker profile from the speakers list
        const speakers = await speakerApi.getSpeakers()
        
        // Find the current user's speaker profile using speaker_id from auth context
        let currentSpeaker: Speaker | undefined
        
        if (user?.speaker_id) {
          currentSpeaker = speakers.find(s => s.id === user.speaker_id)
        }
        
        // Fallback: try to match by user_account or name
        if (!currentSpeaker && user) {
          currentSpeaker = speakers.find(s => 
            s.user_account === user.id || 
            s.speaker_name?.toLowerCase() === `${user.first_name} ${user.last_name}`.toLowerCase()
          )
        }
        
        if (currentSpeaker && mounted) {
          calculateCompletion(currentSpeaker)
        }
      } catch (error) {
        console.error("Error fetching speaker profile:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (user) {
      fetchSpeakerProfile()
    } else {
      setLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [user])

  // Trigger animation periodically
  useEffect(() => {
    if (!loading && !dismissed && completionPercentage < 80) {
      const interval = setInterval(() => {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [loading, dismissed, completionPercentage])

  const calculateCompletion = (speaker: Speaker) => {
    let totalWeight = 0
    let completedWeight = 0
    const missing: string[] = []

    PROFILE_FIELDS.forEach((field) => {
      totalWeight += field.weight
      const value = speaker[field.key]

      let isComplete = false

      if (field.key === "avatar") {
        isComplete = !!value && typeof value === 'string' && value !== "" && !value.includes("default")
      } else if (field.key === "skill_tags" || field.key === "social_links") {
        isComplete = Array.isArray(value) && value.length > 0
      } else {
        isComplete = !!value && value !== ""
      }

      if (isComplete) {
        completedWeight += field.weight
      } else {
        missing.push(field.label)
      }
    })

    const percentage = Math.round((completedWeight / totalWeight) * 100)
    setCompletionPercentage(percentage)
    setMissingFields(missing)
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem("profile-banner-dismissed", "true")
  }

  // Don't show if loading, dismissed, or profile is complete (>= 80%)
  if (loading || dismissed || completionPercentage >= 80) {
    return null
  }

  const message = getMotivationalMessage(completionPercentage, missingFields)

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="p-4 sm:p-6">
        {/* Dismiss button - absolute positioned */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>

        {/* Header with emoji and title */}
        <div className="flex items-center gap-3 pr-8">
          <div className={cn(
            "flex-shrink-0 text-3xl transition-transform duration-500",
            isAnimating ? "scale-110 -rotate-6" : "scale-100 rotate-0"
          )}>
            <span className="animate-bounce inline-block" style={{ animationDuration: "2s" }}>
              {message.emoji}
            </span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 flex-wrap">
              {message.title}
              <span className={cn(
                "inline-block transition-transform text-sm",
                isAnimating && "animate-ping"
              )}>
                ✨
              </span>
            </h3>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mt-2">
          {message.subtitle}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Profile Completion
            </span>
            <span className="text-sm font-bold text-foreground">
              {completionPercentage}%
            </span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative bg-primary"
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Missing fields - horizontal scroll on mobile */}
          {missingFields.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {missingFields.slice(0, 3).map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground whitespace-nowrap"
                >
                  <span className="mr-1">📝</span>
                  {field}
                </span>
              ))}
              {missingFields.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground whitespace-nowrap">
                  +{missingFields.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Button - full width on mobile */}
        <Link href="/profile" className="block mt-4">
          <Button className="w-full sm:w-auto group">
            <span>Complete My Profile</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
