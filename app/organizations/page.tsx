"use client"

import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { organizationApi, Organization } from "@/lib/api/organizationApi"
import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog"
import { Building2, Plus, ArrowRight } from "lucide-react"
import { getEventImageUrl } from "@/lib/utils/event-utils"
import { toast } from "sonner"
import Link from "next/link"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { organizationsOnboardingSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"
import { cn } from "@/lib/utils"

// ─── Avatar ───────────────────────────────────────────────────────────────────

function OrgAvatar({ org, dim = "h-10 w-10" }: { org: Organization; dim?: string }) {
  if (org.logo) {
    return (
      <img
        src={getEventImageUrl(org.logo)}
        alt={org.name}
        className={cn(dim, "rounded-md object-cover")}
      />
    )
  }
  return (
    <div className={cn(dim, "rounded-md bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground select-none shrink-0")}>
      {org.name[0]?.toUpperCase() ?? "O"}
    </div>
  )
}

// ─── Org card ─────────────────────────────────────────────────────────────────

function OrgCard({ org, index, active }: { org: Organization; index: number; active: boolean }) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const }}
      className={cn(
        "group rounded-lg border bg-card p-4 flex items-start gap-4 transition-colors duration-150",
        active
          ? "hover:bg-muted/30"
          : "opacity-60 border-dashed"
      )}
    >
      <OrgAvatar org={org} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{org.name}</p>
            <p className="text-xs text-muted-foreground truncate">{org.email}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 mt-0.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-green-500" : "bg-muted-foreground/40")} />
            {active ? "Active" : "Pending review"}
          </span>
        </div>

        {org.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{org.description}</p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                {org.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {org.members?.length > 0 && (
              <span className="text-xs text-muted-foreground shrink-0">
                {org.members.length} {org.members.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>

          {active ? (
            <Link href={`/dashboard/organizer?org=${org.slug}`} data-tour="org-dashboard-button">
              <Button
                size="sm"
                className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-transform shrink-0"
              >
                Open
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground shrink-0">Under review</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrgCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-lg border bg-card p-4 flex items-start gap-4 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 bg-muted rounded w-2/5" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-3/4 mt-1" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-muted rounded w-24" />
          <div className="h-6 w-14 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
      className="rounded-lg border border-dashed p-16 flex flex-col items-center text-center"
    >
      <Building2 className="h-8 w-8 text-muted-foreground/40 mb-4" />
      <p className="text-sm font-medium mb-1">No organizations yet</p>
      <p className="text-xs text-muted-foreground mb-6 max-w-xs">
        Create an organization to start hosting events and managing your team.
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-transform"
        size="sm"
      >
        <Plus className="w-3.5 h-3.5 mr-1.5" />
        New organization
      </Button>
    </motion.div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { shouldShowOnboarding, completeOnboarding } = useOnboarding("ORGANIZATIONS")

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setIsLoading(true)
      const data = await organizationApi.getUserOrganizations()
      setOrganizations(data)
    } catch {
      toast.error("Failed to load organizations")
    } finally {
      setIsLoading(false)
    }
  }

  const approvedOrgs = organizations.filter((o) => o.is_active)
  const pendingOrgs = organizations.filter((o) => !o.is_active)

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Organizations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "" : organizations.length === 0
                ? "None yet"
                : `${organizations.length} total`}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-transform"
            size="sm"
            data-tour="create-organization"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New organization
          </Button>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <OrgCardSkeleton key={i} index={i} />)}
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Empty */}
            {organizations.length === 0 && (
              <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
            )}

            {/* Active */}
            {approvedOrgs.length > 0 && (
              <div data-tour="approved-orgs">
                <SectionLabel label="Active" count={approvedOrgs.length} />
                <div className="space-y-2">
                  {approvedOrgs.map((org, i) => (
                    <OrgCard key={org.id} org={org} index={i} active />
                  ))}
                </div>
              </div>
            )}

            {/* Pending */}
            {pendingOrgs.length > 0 && (
              <div data-tour="pending-orgs">
                <SectionLabel label="Pending review" count={pendingOrgs.length} />
                <div className="space-y-2">
                  {pendingOrgs.map((org, i) => (
                    <OrgCard key={org.id} org={org} index={i} active={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadOrganizations}
      />

      <OnboardingTour
        steps={organizationsOnboardingSteps}
        run={shouldShowOnboarding && !isLoading}
        onComplete={completeOnboarding}
      />
    </ProtectedRoute>
  )
}
