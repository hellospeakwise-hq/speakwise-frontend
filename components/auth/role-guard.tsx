"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ('attendee' | 'speaker' | 'organizer' | 'admin')[]
  fallbackPath?: string
  showUnauthorized?: boolean
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/auth/signin",
  showUnauthorized = false 
}: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      if (user && !allowedRoles.includes(user.userType || 'attendee')) {
        if (showUnauthorized) {
          return // Show unauthorized message
        }
        router.push('/dashboard') // Redirect to dashboard or appropriate page
        return
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router, fallbackPath, showUnauthorized])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (user && !allowedRoles.includes(user.userType || 'attendee')) {
    if (showUnauthorized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required roles: {allowedRoles.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Your role: {user.userType || 'attendee'}
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return null // Will redirect
  }

  return <>{children}</>
}
