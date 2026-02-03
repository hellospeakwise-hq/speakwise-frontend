"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export interface ProtectedRouteProps {
    children: React.ReactNode
    roles?: ('attendee' | 'speaker' | 'organizer')[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const router = useRouter()
    const [isReady, setIsReady] = useState(false)
    const hasChecked = useRef(false)

    useEffect(() => {
        // Only check once
        if (hasChecked.current) return
        hasChecked.current = true

        // Check localStorage directly
        const token = localStorage.getItem('accessToken')
        const user = localStorage.getItem('user')
        
        console.log('[ProtectedRoute] Auth check:', { hasToken: !!token, hasUser: !!user })
        
        if (!token || !user) {
            console.log('[ProtectedRoute] Not authenticated, redirecting to signin')
            router.replace('/signin')
            return
        }
        
        setIsReady(true)
    }, [router])

    if (!isReady) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
            </div>
        )
    }

    return <>{children}</>
}
