"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Building2, Globe, Mail, Calendar, ExternalLink, ChevronLeft, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { organizationApi, type OrganizationProfile } from "@/lib/api/organizationApi"
import { cn } from "@/lib/utils"

function isCFPOpen(cfp: OrganizationProfile["cfps"]): boolean {
    if (!cfp?.close_at) return false
    return new Date(cfp.close_at) > new Date()
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
    })
}

function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [org, setOrg] = useState<OrganizationProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        organizationApi.getOrganization(id)
            .then(setOrg)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        )
    }

    if (notFound || !org) {
        return (
            <div className="container max-w-4xl mx-auto py-20 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Organization not found</h1>
                <p className="text-muted-foreground mb-6">This organization doesn't exist or hasn't been approved yet.</p>
                <Button asChild variant="outline">
                    <Link href="/organizations">Browse Organizations</Link>
                </Button>
            </div>
        )
    }

    const cfpOpen = isCFPOpen(org.cfps)
    const cfpPast = !cfpOpen && org.cfps?.close_at

    return (
        <div className="min-h-screen">
            {/* Cover / Branding area */}
            <div className="relative w-full h-52 sm:h-64 overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent">
                {org.branding ? (
                    <img
                        src={org.branding}
                        alt={`${org.name} branding`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="h-20 w-20 text-amber-500/20" />
                    </div>
                )}

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

                {/* Back link */}
                <div className="absolute top-4 left-4">
                    <Link
                        href="/organizations"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Organizations
                    </Link>
                </div>

                {/* Org badge — top right */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                    <Building2 className="h-3.5 w-3.5" />
                    Organization
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-4xl mx-auto px-4 -mt-6 relative z-10 pb-16">
                {/* Name + meta */}
                <div className="mb-8">
                    <div className="flex items-center gap-2.5 mb-3">
                                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{org.name}</h1>
                                        {org.status === 'active' && (
                                            <div title="Verified Organization" className="flex-shrink-0 mt-1">
                                                <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="12" className="fill-amber-500" />
                                                    <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                    <div className="flex flex-wrap gap-4">
                        {org.website && (
                            <a
                                href={org.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 transition-colors"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                {org.website.replace(/^https?:\/\//, "")}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        {org.contact_email && (
                            <a
                                href={`mailto:${org.contact_email}`}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 transition-colors"
                            >
                                <Mail className="h-3.5 w-3.5" />
                                {org.contact_email}
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        {org.description && (
                            <section>
                                <h2 className="text-lg font-semibold mb-3">About</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {org.description}
                                </p>
                            </section>
                        )}

                        {/* CFP section */}
                        {org.cfps && (
                            <section>
                                <h2 className="text-lg font-semibold mb-3">Call for Proposals</h2>

                                <div className={cn(
                                    "rounded-xl border p-5",
                                    cfpOpen
                                        ? "border-white/10 bg-white/[0.03]"
                                        : "border-border bg-muted/20 opacity-60"
                                )}>
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold text-foreground">
                                                {cfpOpen ? "Open CFP" : "Closed CFP"}
                                            </span>
                                        </div>

                                        {cfpOpen && org.cfps.close_at && (
                                            <Badge className="bg-white/5 text-muted-foreground border-white/10 font-medium">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {daysUntil(org.cfps.close_at)} days left
                                            </Badge>
                                        )}
                                    </div>

                                    {org.cfps.description && (
                                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                            {org.cfps.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                        {org.cfps.open_at && (
                                            <span>Opens: <span className="font-medium text-foreground">{formatDate(org.cfps.open_at)}</span></span>
                                        )}
                                        {org.cfps.close_at && (
                                            <span>Closes: <span className="font-medium text-foreground">{formatDate(org.cfps.close_at)}</span></span>
                                        )}
                                    </div>

                                    {org.cfps.url && cfpOpen && (
                                        <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
                                            <a href={org.cfps.url} target="_blank" rel="noopener noreferrer">
                                                Submit a Proposal
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Quick info card */}
                        <div className="rounded-xl border border-border p-4 space-y-4">
                            <h3 className="font-semibold text-sm">Contact</h3>

                            {org.website && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                                    <a
                                        href={org.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-amber-500 hover:underline flex items-center gap-1"
                                    >
                                        {org.website.replace(/^https?:\/\//, "")}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {org.contact_email && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                    <a
                                        href={`mailto:${org.contact_email}`}
                                        className="text-sm hover:text-amber-500 transition-colors"
                                    >
                                        {org.contact_email}
                                    </a>
                                </div>
                            )}

                            {!org.website && !org.contact_email && (
                                <p className="text-xs text-muted-foreground">No contact info provided</p>
                            )}
                        </div>

                        {/* CFP status badge */}
                        {org.cfps && (
                            <div className={cn(
                                "rounded-xl border p-4 text-center",
                                cfpOpen ? "border-white/10 bg-white/[0.03]" : "border-border bg-muted/20"
                            )}>
                                <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-semibold text-foreground">
                                    {cfpOpen ? "CFP is Open" : "CFP Closed"}
                                </p>
                                {cfpOpen && org.cfps.close_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Closes {formatDate(org.cfps.close_at)}
                                    </p>
                                )}
                                {cfpOpen && org.cfps.url && (
                                    <Button asChild size="sm" variant="outline" className="w-full mt-3 border-white/10 hover:bg-white/5">
                                        <a href={org.cfps.url} target="_blank" rel="noopener noreferrer">
                                            Apply Now
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
