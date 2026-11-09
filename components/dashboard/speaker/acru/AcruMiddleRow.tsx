"use client"

import React from "react"
import Link from "next/link"
import { Pencil, ArrowRight, Sparkles } from "lucide-react"

interface AcruMiddleRowProps {
  completionPercentage?: number
}

export function AcruMiddleRow({ completionPercentage = 80 }: AcruMiddleRowProps) {
  // Generate 16 chiclet segments matching ACRU spending limit
  const totalSegments = 16
  const filledSegments = Math.round((completionPercentage / 100) * totalSegments)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Card 1: Speaking Readiness & Profile (Monthly spending limit equivalent) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground tracking-tight">
              Speaker Profile & Readiness
            </h4>
            <p className="text-[11px] text-muted-foreground">CFP discovery and bio completeness</p>
          </div>
          <Link
            href="/profile"
            className="p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Chiclet Segmented Bar (16 distinct rounded pill blocks) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 w-full">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 rounded-sm transition-all duration-300 ${
                  i < filledSegments
                    ? "bg-[#72A847]"
                    : "bg-[#E5E7EB] dark:bg-muted/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="text-foreground font-semibold">
              {completionPercentage}% complete
            </span>
            <span className="text-muted-foreground">100% Target</span>
          </div>
        </div>
      </div>

      {/* Card 2: Keynote Tips & Insight (Optimize your budget equivalent) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-2 max-w-sm">
          <h4 className="text-xs font-semibold text-foreground tracking-tight">
            Optimize your talk with quick tips
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Project your feedback QR code 3 minutes before Q&A begins to capture up to 4x more attendee responses.
          </p>
          <Link
            href="/dashboard/speaker/experiences"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground hover:text-primary pt-1 group"
          >
            <span>Preview talk QR codes</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Pastel Mosaic Blocks (Exact ACRU visual element) */}
        <div className="shrink-0 grid grid-cols-3 gap-1 p-1 bg-muted/20 rounded-xl">
          <div className="h-4 w-4 rounded-sm bg-[#76C844]" />
          <div className="h-4 w-4 rounded-sm bg-[#A3D977]" />
          <div className="h-4 w-4 rounded-sm bg-[#F59E0B]" />
          <div className="h-4 w-4 rounded-sm bg-[#E5E7EB] dark:bg-muted" />
          <div className="h-4 w-4 rounded-sm bg-[#76C844]" />
          <div className="h-4 w-4 rounded-sm bg-[#A3D977]" />
        </div>
      </div>
    </div>
  )
}

