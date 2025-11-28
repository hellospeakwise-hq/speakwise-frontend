"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { organizationApi, Organization } from "@/lib/api/organizationApi"
import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog"
import { Building2, Plus, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react"
import { getEventImageUrl } from '@/lib/utils/event-utils'
import { toast } from "sonner"
import Link from "next/link"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { organizationsOnboardingSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Onboarding
    const { shouldShowOnboarding, completeOnboarding } = useOnboarding('ORGANIZATIONS')

    useEffect(() => {
        loadOrganizations()
    }, [])

    const loadOrganizations = async () => {
        try {
            setIsLoading(true)
            const data = await organizationApi.getUserOrganizations()
            setOrganizations(data)
        } catch (error) {
            console.error('Failed to load organizations:', error)
            toast.error("Failed to load organizations")
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (org: Organization) => {
        if (org.is_active) {
            return (
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                </Badge>
            )
        }
        return (
            <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                <Clock className="w-3 h-3 mr-1" />
                Pending Approval
            </Badge>
        )
    }

    const handleCreateSuccess = () => {
        loadOrganizations()
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="container py-10">
                    <div className="flex justify-center">
                        <div className="text-lg">Loading organizations...</div>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    const approvedOrgs = organizations.filter(org => org.is_active)
    const pendingOrgs = organizations.filter(org => !org.is_active)

    return (
        <ProtectedRoute>
            <div className="container py-10">
                <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">My Organizations</h1>
                            <p className="text-muted-foreground">
                                Manage your organizations and event hosting
                            </p>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" data-tour="create-organization">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Organization
                        </Button>
                    </div>

                    {/* Approved Organizations */}
                    {approvedOrgs.length > 0 && (
                        <div className="space-y-4" data-tour="approved-orgs">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <h2 className="text-2xl font-semibold">Active Organizations</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {approvedOrgs.map((org) => (
                                    <Card key={org.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            {org.logo ? (
                                                                <img src={getEventImageUrl(org.logo)} alt={org.name} className="w-full h-full rounded-lg object-cover" />
                                                            ) : (
                                                                <Building2 className="w-6 h-6 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                                                            <CardDescription className="text-sm truncate">{org.email}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {getStatusBadge(org)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {org.description}
                                            </p>
                                            {org.website && (
                                                <a
                                                    href={org.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline mb-4 block"
                                                >
                                                    {org.website}
                                                </a>
                                            )}
                                            <Link href={`/dashboard/organizer?org=${org.id}`} data-tour="org-dashboard-button">
                                                <Button className="w-full" variant="default">
                                                    Go to Organization Dashboard
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Organizations */}
                    {pendingOrgs.length > 0 && (
                        <div className="space-y-4" data-tour="pending-orgs">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <h2 className="text-2xl font-semibold">Pending Approval</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingOrgs.map((org) => (
                                    <Card key={org.id} className="border-dashed">
                                        <CardHeader>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                                            {org.logo ? (
                                                                <img src={org.logo} alt={org.name} className="w-full h-full rounded-lg object-cover opacity-50" />
                                                            ) : (
                                                                <Building2 className="w-6 h-6 text-yellow-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                                                            <CardDescription className="text-sm truncate">{org.email}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {getStatusBadge(org)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {org.description}
                                            </p>
                                            <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-3">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    <Clock className="w-4 h-4 inline mr-2" />
                                                    Your organization request is being reviewed by our admin team. You&apos;ll receive an email notification once approved.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {organizations.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Building2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No Organizations Yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Create your first organization to start hosting events and managing your team as an organizer.
                                </p>
                                <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Organization
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Organization Dialog */}
            <CreateOrganizationDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />

            {/* Onboarding Tour */}
            <OnboardingTour
                steps={organizationsOnboardingSteps}
                run={shouldShowOnboarding && !isLoading}
                onComplete={completeOnboarding}
            />
        </ProtectedRoute>
    )
}
