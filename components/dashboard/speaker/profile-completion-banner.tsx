"use client"

import { useState, useEffect } from "react"
import { UserCircle, X, ChevronRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { useAuth } from "@/contexts/auth-context"

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
  { key: "skill_tag", label: "Skills/Expertise", weight: 10 },
  { key: "social_links", label: "Social links", weight: 10 },
]

export function ProfileCompletionBanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [missingFields, setMissingFields] = useState<string[]>([])

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
      } else if (field.key === "skill_tag" || field.key === "social_links") {
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

  return (
    <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30">
      <div className="flex items-start justify-between">
        <div className="flex">
          <UserCircle className="h-4 w-4 text-orange-500 mt-0.5 mr-2" />
          <div>
            <AlertTitle className="text-orange-800 dark:text-orange-300">
              Complete your profile to get noticed
            </AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-400">
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    {completionPercentage}%
                  </span>
                </div>
                
                {missingFields.length > 0 && (
                  <p className="text-sm">
                    Add your {missingFields.slice(0, 2).join(" and ").toLowerCase()}
                    {missingFields.length > 2 && ` (+${missingFields.length - 2} more)`} to help organizers find you.
                  </p>
                )}

                <Link href="/profile">
                  <Button variant="link" className="p-0 h-auto text-orange-600 dark:text-orange-400 gap-1">
                    Update Profile
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </Alert>
  )
}
