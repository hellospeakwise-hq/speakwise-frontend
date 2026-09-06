"use client"

import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect, useState } from "react"
import { organizationApi, type OrganizationProfile } from "@/lib/api/organizationApi"
import { Building2, Clock } from "lucide-react"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { organizerDashboardSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"

export default function OrganizerDashboardPage() {
    const [org, setOrg] = useState<OrganizationProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const { shouldShowOnboarding, completeOnboarding } = useOnboarding('ORGANIZER_DASHBOARD')

    useEffect(() => {
        const load = async () => {
            try {
                // Try API first, fall back to localStorage cache for pending orgs
                let found = await organizationApi.getMyOrganization()
                if (!found) {
                    const cached = localStorage.getItem("cached_org_profile")
                    if (cached) {
                        try { found = JSON.parse(cached) } catch { /* ignore */ }
                    }
                }
                if (found) {
                    localStorage.setItem("cached_org_profile", JSON.stringify(found))
                    setOrg(found)
                }
            } catch {
                // fall through — pending state handled below
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-200/40">
                        {org?.branding ? (
                            <img src={org.branding} alt={org.name} className="h-full w-full rounded-2xl object-cover" />
                        ) : (
                            <span className="text-base font-bold text-amber-600">
                                {org?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            {org?.name ?? "Organization Dashboard"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage your events, CFPs, and speaker connections</p>
                    </div>
                </div>

                {/* Pending approval banner */}
                {org && org.status !== 'active' && (
                    <div className="rounded-xl border border-amber-200/60 bg-amber-500/5 p-4 flex items-start gap-3">
                        <Clock className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Profile under review</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Your organization is being reviewed before it goes public. This usually takes 1–2 business days.
                                You can explore the dashboard and prepare your content in the meantime.
                            </p>
                        </div>
                    </div>
                )}

                {/* No org found */}
                {!org && (
                    <div className="rounded-xl border border-dashed p-10 flex flex-col items-center text-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No organization found</p>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Your organization profile is being set up. If you just submitted it, check back shortly or refresh the page.
                        </p>
                    </div>
                )}

                {/* Dashboard body — always render so org can explore while pending */}
                {org && <OrganizerDashboard />}
            </div>

            <OnboardingTour
                steps={organizerDashboardSteps}
                run={shouldShowOnboarding && !isLoading && !!org}
                onComplete={completeOnboarding}
            />
        </ProtectedRoute>
    )
}
