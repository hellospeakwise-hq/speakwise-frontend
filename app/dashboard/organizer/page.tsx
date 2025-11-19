"use client"

import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect, useState } from "react"
import { organizationApi } from "@/lib/api/organizationApi"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export default function OrganizerDashboardPage() {
  const [isOrgApproved, setIsOrgApproved] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get('org')

  useEffect(() => {
    const checkOrganization = async () => {
      try {
        if (!orgId) {
          toast.error("No organization specified")
          router.push('/organizations')
          return
        }

        // Get the specific organization
        const org = await organizationApi.getOrganization(parseInt(orgId))
        
        // Check if this specific organization is approved
        if (!org.is_active) {
          toast.error("This organization is not approved yet")
          router.push('/organizations')
          return
        }
        
        setIsOrgApproved(true)
      } catch (error) {
        console.error('Error checking organization:', error)
        toast.error("Failed to verify organization access")
        router.push('/organizations')
      } finally {
        setIsLoading(false)
      }
    }

    checkOrganization()
  }, [router, orgId])

  if (isLoading || isOrgApproved === null) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!isOrgApproved) {
    return (
      <ProtectedRoute>
        <div className="container py-10">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Organization Not Approved</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                This organization has not been approved yet. You can only access the dashboard for approved organizations.
              </p>
              <Button onClick={() => router.push('/organizations')}>
                Go to Organizations
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage events, speakers, and attendees</p>
          </div>
          <OrganizerDashboard />
        </div>
      </div>
    </ProtectedRoute>
  )
}