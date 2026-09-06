"use client"

import Link from "next/link"
import { Globe, Calendar } from "lucide-react"
import { Sparkle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { OrganizationProfile } from "@/lib/api/organizationApi"

interface OrganizationCardProps {
    org: OrganizationProfile
    className?: string
}

function isCFPOpen(cfp: OrganizationProfile["cfps"]): boolean {
    if (!cfp?.close_at) return false
    return new Date(cfp.close_at) > new Date()
}

function formatDeadline(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function OrganizationCard({ org, className }: OrganizationCardProps) {
    const cfpOpen = isCFPOpen(org.cfps)
    const initials = org.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <Link href={`/organizations/${org.id}`} className="block group">
            <div
                className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200",
                    "hover:bg-muted/60 focus-within:bg-muted/60",
                    className
                )}
            >
                {/* Logo / Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted/40 border border-white/10 group-hover:border-white/20 transition-colors flex items-center justify-center">
                        {org.branding ? (
                            <img
                                src={org.branding}
                                alt={org.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-amber-600">{initials}</span>
                        )}
                    </div>

                    {/* Org type badge */}
                    <div className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 shadow-sm">
                        <Sparkle weight="fill" size={10} color="white" />
                    </div>

                    {/* CFP open dot */}
                    {cfpOpen && (
                        <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                    )}
                </div>

                {/* Name + meta */}
                <div className="text-center w-full">
                    <p className="text-[13px] font-semibold leading-tight line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {org.name}
                    </p>

                    {org.website && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {org.website.replace(/^https?:\/\//, "")}
                        </p>
                    )}

                    {cfpOpen && org.cfps?.close_at && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-2.5 w-2.5" />
                            CFP · {formatDeadline(org.cfps.close_at)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
