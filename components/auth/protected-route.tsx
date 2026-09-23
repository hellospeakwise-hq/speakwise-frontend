"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface ProtectedRouteProps {
    children: React.ReactNode
    roles?: ('attendee' | 'speaker' | 'organizer')[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [isReady, setIsReady] = useState(false)
    const hasChecked = useRef(false)

    useEffect(() => {
        // Wait for auth context to finish resolving
        if (loading) return

        // Only check once after loading is done
        if (hasChecked.current) return
        hasChecked.current = true

        // Check authentication
        const token = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')

        console.log('[ProtectedRoute] Auth check:', { hasToken: !!token, hasUser: !!storedUser })

        if (!token || !storedUser) {
            console.log('[ProtectedRoute] Not authenticated, redirecting to signin')
            router.replace('/signin')
            return
        }

        // If roles are specified, enforce them using profile_type + userType
        if (roles && roles.length > 0 && user) {
            const profileType = localStorage.getItem('profile_type')

            // Determine the effective user type:
            // profile_type in localStorage is the most reliable signal right after signup/login
            let effectiveRole: string = user.userType || user.role?.role || 'speaker'
            if (profileType === 'organization') {
                effectiveRole = 'organizer'
            } else if (profileType === 'speaker') {
                effectiveRole = 'speaker'
            }

            if (!roles.includes(effectiveRole as any)) {
                console.log(`[ProtectedRoute] Role mismatch: has "${effectiveRole}", needs one of [${roles.join(', ')}]. Redirecting.`)
                // Redirect to the correct dashboard instead of blocking
                if (effectiveRole === 'organizer') {
                    router.replace('/dashboard/organizer')
                } else if (effectiveRole === 'speaker') {
                    router.replace('/dashboard/speaker')
                } else {
                    router.replace('/dashboard/attendee')
                }
                return
            }
        }

        setIsReady(true)
    }, [loading, user, roles, router])

    if (loading || !isReady) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
            </div>
        )
    }

    return <>{children}</>
}
