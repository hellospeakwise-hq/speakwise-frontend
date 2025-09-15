"use client"

import { useAuth } from "@/contexts/auth-context"
import { RoleGuard } from "./role-guard"

interface AdminGuardProps {
  children: React.ReactNode
  fallbackComponent?: React.ReactNode
}

export function AdminGuard({ children, fallbackComponent }: AdminGuardProps) {
  return (
    <RoleGuard allowedRoles={['admin', 'organizer']} showUnauthorized={!!fallbackComponent}>
      {children}
    </RoleGuard>
  )
}

interface SpeakerGuardProps {
  children: React.ReactNode
  fallbackComponent?: React.ReactNode
}

export function SpeakerGuard({ children, fallbackComponent }: SpeakerGuardProps) {
  return (
    <RoleGuard allowedRoles={['speaker']} showUnauthorized={!!fallbackComponent}>
      {children}
    </RoleGuard>
  )
}

interface OrganizerGuardProps {
  children: React.ReactNode
  fallbackComponent?: React.ReactNode
}

export function OrganizerGuard({ children, fallbackComponent }: OrganizerGuardProps) {
  return (
    <RoleGuard allowedRoles={['organizer', 'admin']} showUnauthorized={!!fallbackComponent}>
      {children}
    </RoleGuard>
  )
}
