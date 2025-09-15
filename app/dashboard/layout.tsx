"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            toast.error("Please sign in to access the dashboard")
            router.push('/signin')
            return
        }
    }, [isAuthenticated, loading, router])

    // Show loading state while checking auth
    if (loading || !isAuthenticated) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
            </div>
        )
    }

    // Return the dashboard content if authenticated
    return <>{children}</>
}
