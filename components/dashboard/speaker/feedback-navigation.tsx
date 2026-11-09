"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, MessageSquare, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeedbackNavigation() {
  const pathname = usePathname()

  const tabs = [
    {
      href: "/dashboard/speaker/feedback",
      label: "All Feedback",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/speaker/feedback-by-talks",
      label: "Feedback by Presentation",
      icon: Layers,
    },
  ]

  return (
    <div className="flex flex-col gap-2.5 pb-3 border-b border-border/60 w-full max-w-full min-w-0">
      {/* Top: Return to Dashboard */}
      <div>
        <Link
          href="/dashboard/speaker"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group py-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Downwards: Responsive 2-tab segmented control (no scrollbar) */}
      <div className="grid grid-cols-2 sm:inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40 w-full max-w-full sm:w-auto min-w-0">
        <Link
          href="/dashboard/speaker/feedback"
          className={cn(
            "flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors text-center",
            pathname === "/dashboard/speaker/feedback"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
          <span>All Feedback</span>
        </Link>

        <Link
          href="/dashboard/speaker/feedback-by-talks"
          className={cn(
            "flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors text-center",
            pathname === "/dashboard/speaker/feedback-by-talks"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-3.5 w-3.5 shrink-0" />
          <span className="sm:hidden">By Presentation</span>
          <span className="hidden sm:inline">Feedback by Presentation</span>
        </Link>
      </div>
    </div>
  )
}
