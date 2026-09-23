"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to role-specific dashboard
      const roleRoute = getRoleDashboardRoute(user.role?.role || user.userType)
      router.push(roleRoute)
    }
  }, [user, loading, router])

  const getRoleDashboardRoute = (role: string): string => {
    // Check for a saved redirect path first
    const savedRedirect = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null
    if (savedRedirect) {
      sessionStorage.removeItem('redirectAfterLogin')
      return savedRedirect
    }

    // profile_type is the most reliable signal — it's set explicitly when the user
    // chooses their profile type in the modal, and synced from the backend on login.
    const profileType = typeof window !== 'undefined' ? localStorage.getItem('profile_type') : null
    if (profileType === 'organization') return '/dashboard/organizer'
    if (profileType === 'speaker') return '/dashboard/speaker'

    // Fall back to backend role
    switch (role) {
      case 'speaker':
        return '/dashboard/speaker'
      case 'organizer':
        return '/dashboard/organizer'
      case 'attendee':
      default:
        return '/dashboard/attendee'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // This should not be reached as user will be redirected
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
