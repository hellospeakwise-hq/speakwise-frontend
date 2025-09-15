"use client"

import { useAuth } from "@/contexts/auth-context"
import { useMemo } from "react"

export function usePermissions() {
  const { user, isAuthenticated } = useAuth()

  const permissions = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        canViewSpeakers: true, // Public access
        canEditProfile: false,
        canManageEvents: false,
        canManageUsers: false,
        canCreateSpeakers: false,
        canCreateEvents: false,
        canViewDashboard: false,
        canUploadAvatar: false,
        canManageSkills: false,
        isAdmin: false,
        isOrganizer: false,
        isSpeaker: false,
        isAttendee: false,
      }
    }

    const userType = user.userType || 'attendee'
    
    return {
      // Public permissions
      canViewSpeakers: true,
      
      // Basic authenticated permissions
      canEditProfile: true,
      canViewDashboard: true,
      
      // Speaker-specific permissions
      canUploadAvatar: userType === 'speaker',
      canManageSkills: userType === 'speaker',
      
      // Organizer permissions
      canManageEvents: userType === 'organizer' || userType === 'admin',
      canCreateEvents: userType === 'organizer' || userType === 'admin',
      canCreateSpeakers: userType === 'organizer' || userType === 'admin',
      
      // Admin permissions
      canManageUsers: userType === 'admin',
      
      // Role checks
      isAdmin: userType === 'admin',
      isOrganizer: userType === 'organizer',
      isSpeaker: userType === 'speaker',
      isAttendee: userType === 'attendee',
    }
  }, [user, isAuthenticated])

  return permissions
}

// Permission checker utility function
export function hasPermission(
  user: { userType?: string } | null,
  requiredRoles: string[]
): boolean {
  if (!user || !user.userType) return false
  return requiredRoles.includes(user.userType)
}

// Component permission wrapper
interface PermissionWrapperProps {
  children: React.ReactNode
  permission: keyof ReturnType<typeof usePermissions>
  fallback?: React.ReactNode
}

export function PermissionWrapper({ 
  children, 
  permission, 
  fallback = null 
}: PermissionWrapperProps) {
  const permissions = usePermissions()
  
  if (permissions[permission]) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}
