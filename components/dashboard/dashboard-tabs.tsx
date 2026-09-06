"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpeakerDashboard } from "@/components/dashboard/speaker-dashboard"
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DashboardTabs() {
  const { user } = useAuth()
  const router = useRouter()

  const [userType, setUserType] = useState<"speaker" | "organizer">(
    (user?.userType as "speaker" | "organizer") || "speaker"
  )

  useEffect(() => {
    if (user?.userType && (user.userType === "speaker" || user.userType === "organizer")) {
      setUserType(user.userType as "speaker" | "organizer")
    }
  }, [user?.userType])

  const handleTabChange = (value: "speaker" | "organizer") => {
    if (user?.userType && user.userType !== value) {
      toast.error(`You don't have ${value} permissions.`)
    }
    setUserType(value)
    if (value === "speaker") {
      router.push('/dashboard/speaker')
    } else {
      router.push('/dashboard/organizer')
    }
  }

  return (
    <Tabs value={userType} className="space-y-4" onValueChange={(v) => handleTabChange(v as any)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="speaker">Speaker</TabsTrigger>
        <TabsTrigger value="organizer">Organizer</TabsTrigger>
      </TabsList>
      <TabsContent value="speaker">
        <SpeakerDashboard />
      </TabsContent>
      <TabsContent value="organizer">
        <OrganizerDashboard />
      </TabsContent>
    </Tabs>
  )
}
