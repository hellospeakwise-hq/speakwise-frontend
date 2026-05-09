import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  Loader2,
  RefreshCw,
  Building2,
  Mic2,
  MessageSquare,
  Megaphone,
  LayoutDashboard,
  UserCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useOrganizerEvents } from "@/hooks/use-organizer-events"
import { EventManagementTable } from "@/components/dashboard/event-management-table"
import { AttendeeManagement } from "@/components/dashboard/attendee-management"
import { OrganizerSpeakerRequests } from "@/components/dashboard/organizer-speaker-requests"
import { OrganizerCFPView } from "@/components/cfp/organizer-cfp-view"
import { OrganizerCFPSettingsView } from "@/components/cfp/organizer-cfp-settings-view"
import { OrganizationMembersManager } from "@/components/organization/organization-members-manager"
import { organizationApi, type Organization } from "@/lib/api/organizationApi"
import { toast } from "sonner"

type Section =
  | "overview"
  | "events"
  | "organization"
  | "speaker-requests"
  | "speakers"
  | "attendees"
  | "feedback"
  | "cfp-submissions"
  | "cfp-settings"

interface NavItem {
  id: Section
  label: string
  icon: React.ElementType
  children?: { id: Section; label: string }[]
}

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "events", label: "Events", icon: Calendar },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "speaker-requests", label: "Speaker Requests", icon: UserCheck },
  { id: "speakers", label: "Speakers", icon: Mic2 },
  { id: "attendees", label: "Attendees", icon: Users },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  {
    id: "cfp-submissions",
    label: "CFP",
    icon: Megaphone,
    children: [
      { id: "cfp-submissions", label: "Submissions" },
      { id: "cfp-settings", label: "Settings" },
    ],
  },
]

export function OrganizerDashboard() {
  const {
    events,
    loading,
    error,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    refreshAttendeeStats,
    stats,
  } = useOrganizerEvents()

  const [section, setSection] = useState<Section>("overview")
  const [cfpOpen, setCfpOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true)
      const orgs = await organizationApi.getUserOrganizations()
      setOrganizations(orgs.filter((o) => o.is_active))
    } catch {
      toast.error("Failed to load organizations")
    } finally {
      setLoadingOrgs(false)
    }
  }

  const handleRefreshStats = async () => {
    setRefreshing(true)
    try {
      await refreshAttendeeStats()
    } finally {
      setRefreshing(false)
    }
  }

  const navigate = (id: Section) => {
    if (id === "cfp-submissions" || id === "cfp-settings") setCfpOpen(true)
    setSection(id)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] border rounded-xl overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="w-52 shrink-0 border-r bg-muted/20 flex flex-col py-4">
        {NAV.map((item) => {
          const Icon = item.icon
          const isCFP = !!item.children
          const isParentActive =
            isCFP && (section === "cfp-submissions" || section === "cfp-settings")
          const isActive = !isCFP && section === item.id

          if (isCFP) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setCfpOpen((o) => !o)
                    if (!cfpOpen) navigate("cfp-submissions")
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors",
                    isParentActive
                      ? "text-orange-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {cfpOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
                {cfpOpen &&
                  item.children!.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => navigate(child.id)}
                      className={cn(
                        "w-full flex items-center gap-2 pl-10 pr-4 py-1.5 text-sm transition-colors",
                        section === child.id
                          ? "text-orange-500 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {section === child.id && (
                        <span className="absolute left-0 w-0.5 h-5 bg-orange-500 rounded-r" />
                      )}
                      {child.label}
                    </button>
                  ))}
              </div>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-orange-500 bg-orange-500/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 p-6 overflow-auto">
        {/* Overview */}
        {section === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Your organizer summary</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStats}
                disabled={loading || refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Events", value: stats.totalEvents, sub: "All time", icon: Calendar },
                { label: "Upcoming", value: stats.upcomingEvents, sub: "Events ahead", icon: Calendar },
                { label: "Past Events", value: stats.pastEvents, sub: "Completed", icon: Calendar },
                { label: "Attendees", value: stats.totalAttendees.toLocaleString(), sub: "Across all events", icon: Users },
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Manage Events", target: "events" as Section, icon: Calendar, desc: "Create and edit events" },
                { label: "CFP Submissions", target: "cfp-submissions" as Section, icon: Megaphone, desc: "Review proposals" },
                { label: "Attendees", target: "attendees" as Section, icon: Users, desc: "Track attendance" },
              ].map(({ label, target, icon: Icon, desc }) => (
                <button
                  key={label}
                  onClick={() => navigate(target)}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-orange-500/10">
                    <Icon className="h-4 w-4 text-orange-500" />
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

        {/* Organization */}
        {section === "organization" && (
          <div className="space-y-4">
            <SectionHeader title="Organization" desc="Manage your team members" />
            {loadingOrgs ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading…
              </div>
            ) : organizations.length > 0 ? (
              <OrganizationMembersManager organizations={organizations} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No active organizations yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create an organization to manage team members.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Speaker Requests */}
        {section === "speaker-requests" && (
          <div className="space-y-4">
            <SectionHeader title="Speaker Requests" desc="Incoming and outgoing speaker invitations" />
            <OrganizerSpeakerRequests />
          </div>
        )}

        {/* Speakers */}
        {section === "speakers" && (
          <div className="space-y-4">
            <SectionHeader title="Speakers" desc="Speakers associated with your events" />
            <Card>
              <CardContent className="py-12 text-center">
                <Mic2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Select an event to view its speakers.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendees */}
        {section === "attendees" && (
          <div className="space-y-4">
            <SectionHeader title="Attendees" desc="Track attendance across your events" />
            <AttendeeManagement events={events} />
          </div>
        )}

        {/* Feedback */}
        {section === "feedback" && (
          <div className="space-y-4">
            <SectionHeader title="Feedback" desc="Aggregated feedback from your events" />
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Feedback reports coming soon.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CFP Submissions */}
        {section === "cfp-submissions" && (
          <div className="space-y-4">
            <SectionHeader title="CFP Submissions" desc="Review and respond to speaker proposals" />
            <OrganizerCFPView
              events={events.map((e) => ({ id: e.id, slug: e.slug, title: e.title || e.name }))}
            />
          </div>
        )}

        {/* CFP Settings */}
        {section === "cfp-settings" && (
          <div className="space-y-4">
            <SectionHeader title="CFP Settings" desc="Configure the CFP page, description, and dates for each event" />
            <OrganizerCFPSettingsView
              events={events.map((e) => ({ id: e.id, slug: e.slug, title: e.title || e.name }))}
            />
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
