"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export interface ProtectedRouteProps {
    children: React.ReactNode
    roles?: ('attendee' | 'speaker' | 'organizer')[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            toast.error("Please sign in to access this page")

            // Store the page they were trying to visit
            if (pathname !== '/signin' && pathname !== '/signup') {
                sessionStorage.setItem('redirectAfterLogin', pathname)
            }

            router.push('/signin')
            return
        }

        // Role-based access control
        if (!loading && isAuthenticated && roles && user?.userType) {
            if (!roles.includes(user.userType as any)) {
                toast.error("You don't have permission to access this page")
                router.push('/dashboard')
            }
        }
    }, [isAuthenticated, loading, router, pathname, roles, user])

    // Show loading state or nothing while checking auth
    if (loading || !isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
            </div>
        )
    }

    // If authenticated and has the right role (or no role check required), show the children
    return <>{children}</>
}
