"use client"

import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect, useState } from "react"
import { organizationApi, type OrganizationProfile } from "@/lib/api/organizationApi"
import { Building2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { organizerDashboardSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"

export default function OrganizerDashboardPage() {
    const [org, setOrg] = useState<OrganizationProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showApprovedBanner, setShowApprovedBanner] = useState(false)

    const { shouldShowOnboarding, completeOnboarding } = useOnboarding('ORGANIZER_DASHBOARD')

    useEffect(() => {
        const load = async () => {
            try {
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

                    // Track when we first saw the active status
                    if (found.status === 'active') {
                        const key = `org_approved_at_${found.id}`
                        if (!localStorage.getItem(key)) {
                            localStorage.setItem(key, Date.now().toString())
                        }
                        const approvedAt = parseInt(localStorage.getItem(key) || '0', 10)
                        const oneDayMs = 24 * 60 * 60 * 1000
                        setShowApprovedBanner(Date.now() - approvedAt < oneDayMs)
                    }
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
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {org?.name ?? "Organization Dashboard"}
                            </h1>
                            {org?.status === 'active' && !showApprovedBanner && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    Active
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage your events, CFPs, and speaker connections</p>
                    </div>
                </div>

                {/* Status banners */}
                {org?.status === 'pending' && (
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

                {org?.status === 'active' && showApprovedBanner && (
                    <div className="rounded-xl border border-green-200/60 bg-green-500/5 p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">Organization approved</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Your organization is verified and live. You can now create events and post CFPs.
                            </p>
                        </div>
                    </div>
                )}

                {org?.status === 'rejected' && (
                    <div className="rounded-xl border border-red-200/60 bg-red-500/5 p-4 flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">Application not approved</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Your organization application was not approved.
                                {org.admin_notes ? ` Reason: ${org.admin_notes}` : " Please contact support for more information."}
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
