"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpeakerDashboard } from "@/components/dashboard/speaker-dashboard"
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { AttendeeDashboard } from "@/components/dashboard/attendee-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DashboardTabs() {
  const { user } = useAuth()
  const router = useRouter()

  // Default to user's actual role or "attendee" if not set
  const [userType, setUserType] = useState<"attendee" | "speaker" | "organizer">(
    (user?.userType as "attendee" | "speaker" | "organizer") || "attendee"
  )

  // Set tab based on user's actual role
  useEffect(() => {
    if (user?.userType) {
      setUserType(user.userType as "attendee" | "speaker" | "organizer")
    }
  }, [user?.userType])

  // Handle tab change - with role-based access control
  const handleTabChange = (value: "attendee" | "speaker" | "organizer") => {
    // Check if user has permission to access this tab
    if (user?.userType && user.userType !== value) {
      toast.error(`You don't have ${value} permissions. This is just a demo.`)
      // In a real app, you might prevent the tab change or redirect
    }

    setUserType(value)

    // Redirect to role-specific dashboard if available
    if (value === "speaker") {
      router.push('/dashboard/speaker')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Tabs value={userType} className="space-y-4" onValueChange={(value: string) => handleTabChange(value as any)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="attendee">
          Attendee
        </TabsTrigger>
        <TabsTrigger value="speaker">
          Speaker
        </TabsTrigger>
        <TabsTrigger value="organizer">
          Organizer
        </TabsTrigger>
      </TabsList>
      <TabsContent value="attendee">
        <AttendeeDashboard />
      </TabsContent>
      <TabsContent value="speaker">
        <SpeakerDashboard />
      </TabsContent>
      <TabsContent value="organizer">
        <OrganizerDashboard />
      </TabsContent>
    </Tabs>
  )
}
