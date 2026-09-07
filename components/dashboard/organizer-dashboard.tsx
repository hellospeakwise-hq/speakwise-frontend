import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Loader2,
  Megaphone,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react"
import { useOrganizerEvents } from "@/hooks/use-organizer-events"
import { EventManagementTable } from "@/components/dashboard/event-management-table"
import Link from "next/link"

type Section = "overview" | "events" | "cfp"

interface NavItem {
  id: Section
  label: string
  icon: React.ElementType
}

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "events", label: "Events", icon: Calendar },
  { id: "cfp", label: "CFP", icon: Megaphone },
]

export function OrganizerDashboard() {
  const {
    events,
    loading,
    error,
    refetch,
    deleteEvent,
    toggleEventStatus,
    stats,
  } = useOrganizerEvents()

  const [section, setSection] = useState<Section>("overview")

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  const eventsWithOpenCFP = events.filter((e) => {
    if (!e.cfp_open) return false
    if (!e.cfp_deadline) return true
    return new Date(e.cfp_deadline) > new Date()
  })

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] border rounded-xl overflow-hidden bg-background">

      {/* Mobile tab bar */}
      <nav className="md:hidden flex border-b bg-muted/20">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 border-r bg-muted/20 flex-col py-4">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-r" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 overflow-auto">

        {/* Overview */}
        {section === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Your organizer summary</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Events", value: stats.totalEvents, sub: "All time", icon: Calendar },
                { label: "Upcoming", value: stats.upcomingEvents, sub: "Events ahead", icon: Calendar },
                { label: "Past Events", value: stats.pastEvents, sub: "Completed", icon: Calendar },
              ].map(({ label, value, sub, icon: Icon }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-2xl font-bold">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Manage Events", target: "events" as Section, icon: Calendar, desc: "Create and edit events" },
                { label: "CFP", target: "cfp" as Section, icon: Megaphone, desc: "Events with open CFP" },
              ].map(({ label, target, icon: Icon, desc }) => (
                <button
                  key={label}
                  onClick={() => setSection(target)}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {section === "events" && (
          <div className="space-y-4">
            <SectionHeader title="Events" desc="Create and manage your events" />
            <EventManagementTable
              events={events}
              loading={loading}
              onEventCreate={() => refetch()}
              onEventUpdate={() => refetch()}
              onEventDelete={deleteEvent}
              onEventStatusToggle={async (slug, isActive) => { await toggleEventStatus(slug, isActive) }}
            />
          </div>
        )}

        {/* CFP — events with open call for proposals */}
        {section === "cfp" && (
          <div className="space-y-4">
            <SectionHeader title="Call for Proposals" desc="Your events that currently have an open CFP" />
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading events…
              </div>
            ) : eventsWithOpenCFP.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/10">
                <div className="p-3 rounded-xl bg-muted mb-3">
                  <Megaphone className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">No open CFPs</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  None of your events have an active call for proposals right now. Open a CFP from the Events section.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setSection("events")}>
                  Go to Events
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {eventsWithOpenCFP.map((event) => {
                  const deadline = event.cfp_deadline ? new Date(event.cfp_deadline) : null
                  const daysLeft = deadline
                    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000))
                    : null

                  return (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        {deadline && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">
                              Closes{" "}
                              {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              {daysLeft !== null && (
                                <span className="ml-1 text-emerald-600 font-medium">· {daysLeft}d left</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </div>
  )
}
