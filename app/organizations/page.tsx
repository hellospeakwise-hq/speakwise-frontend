"use client"

import { useState, useEffect } from "react"
import { Building2, Search, Filter } from "lucide-react"
// Building2 kept for empty-state illustration below
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OrganizationCard } from "@/components/organization/organization-card"
import { organizationApi, type OrganizationProfile } from "@/lib/api/organizationApi"
import { cn } from "@/lib/utils"

type FilterMode = "all" | "cfp-open"

export default function OrganizationsPage() {
    const [orgs, setOrgs] = useState<OrganizationProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState<FilterMode>("all")

    useEffect(() => {
        organizationApi.listOrganizations()
            // Only show approved orgs publicly (backend will eventually filter server-side too)
            .then((data) => setOrgs(data.filter((o) => o.status === 'active' || o.status == null)))
            .catch(() => setOrgs([]))
            .finally(() => setLoading(false))
    }, [])

    const now = new Date()

    const filtered = orgs.filter((org) => {
        const matchesQuery =
            !query ||
            org.name.toLowerCase().includes(query.toLowerCase()) ||
            (org.description ?? "").toLowerCase().includes(query.toLowerCase())

        const matchesFilter =
            filter === "all" ||
            (filter === "cfp-open" && org.cfps?.close_at && new Date(org.cfps.close_at) > now)

        return matchesQuery && matchesFilter
    })

    return (
        <div className="container py-10 max-w-6xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Discover event organizations, conferences, and communities — find open calls for proposals.
                </p>
            </div>

            {/* Search + filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search organizations..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className="h-10"
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === "cfp-open" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("cfp-open")}
                        className={cn("h-10", filter === "cfp-open" && "bg-emerald-500 hover:bg-emerald-600 border-emerald-500")}
                    >
                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                        CFP Open
                    </Button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 p-4 animate-pulse">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted" />
                            <div className="w-16 h-3 bg-muted rounded" />
                            <div className="w-12 h-2 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 mb-4">
                        <Building2 className="h-8 w-8 text-amber-500/60" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                        {query || filter !== "all" ? "No organizations match your search" : "No organizations yet"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                        {query || filter !== "all"
                            ? "Try adjusting your search or clearing the filter"
                            : "Organizations will appear here once they're approved"}
                    </p>
                    {(query || filter !== "all") && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => { setQuery(""); setFilter("all") }}
                        >
                            Clear filters
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground mb-4">
                        {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
                        {filter === "cfp-open" ? " with open CFP" : ""}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                        {filtered.map((org) => (
                            <OrganizationCard key={org.id} org={org} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
