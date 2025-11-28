import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, BarChart, Loader2, Star, RefreshCw, Building2 } from "lucide-react"
import { useOrganizerEvents } from "@/hooks/use-organizer-events"
import { EventManagementTable } from "@/components/dashboard/event-management-table"
import { AttendeeManagement } from "@/components/dashboard/attendee-management"
import { OrganizerSpeakerRequests } from "@/components/dashboard/organizer-speaker-requests"
import { OrganizationMembersManager } from "@/components/organization/organization-members-manager"
import { organizationApi, type Organization } from "@/lib/api/organizationApi"
import { toast } from "sonner"

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
    stats
  } = useOrganizerEvents()

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
      const activeOrgs = orgs.filter(org => org.is_active)
      setOrganizations(activeOrgs)
    } catch (error) {
      console.error('Error loading organizations:', error)
      toast.error('Failed to load organizations')
    } finally {
      setLoadingOrgs(false)
    }
  }

  const handleEventCreate = (event: any) => {
    refetch() // Refresh the events list
  }

  const handleEventUpdate = (event: any) => {
    refetch() // Refresh the events list
  }

  const handleEventDelete = async (eventId: number) => {
    await deleteEvent(eventId)
  }

  const handleEventStatusToggle = async (eventId: number, isActive: boolean) => {
    await toggleEventStatus(eventId, isActive)
  }

  // Refresh attendee stats when attendee tab is selected or when needed
  const handleRefreshStats = async () => {
    setRefreshing(true)
    try {
      await refreshAttendeeStats()
    } finally {
      setRefreshing(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error loading dashboard</div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">

        <Button variant="outline" onClick={handleRefreshStats} disabled={loading || refreshing} data-tour="refresh-stats">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Organizer Stats */}
        <Card data-tour="stats-total-events">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalEvents
              )}
            </div>
            <p className="text-xs text-muted-foreground">Organized events</p>
          </CardContent>
        </Card>
        <Card data-tour="stats-attendees">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalAttendees.toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card data-tour="stats-feedback">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Rate</CardTitle>
            <BarChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${stats.feedbackRate}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Of attendees provided feedback</p>
          </CardContent>
        </Card>
        <Card data-tour="stats-rating">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Speaker Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.avgRating.toFixed(1)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all speakers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events" data-tour="manage-events-tab">Manage Events</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="speaker-requests">Speaker Requests</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="attendees" data-tour="attendees-tab">Attendees</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <EventManagementTable
            events={events}
            loading={loading}
            onEventCreate={handleEventCreate}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            onEventStatusToggle={handleEventStatusToggle}
          />
        </TabsContent>
        <TabsContent value="organization">
          {loadingOrgs ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  <span className="ml-2 text-muted-foreground">Loading organizations...</span>
                </div>
              </CardContent>
            </Card>
          ) : organizations.length > 0 ? (
            <OrganizationMembersManager organizations={organizations} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Management
                </CardTitle>
                <CardDescription>Manage your organization members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">You don't have any active organizations</p>
                  <p className="text-sm text-muted-foreground">
                    Create an organization to start managing team members
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="speaker-requests">
          <OrganizerSpeakerRequests />
        </TabsContent>
        <TabsContent value="speakers">
          <Card>
            <CardHeader>
              <CardTitle>Event Speakers</CardTitle>
              <CardDescription>Manage speakers for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Select an event to view and manage its speakers.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendees">
          <div onFocus={handleRefreshStats}>
            <AttendeeManagement events={events} />
          </div>
        </TabsContent>
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Reports</CardTitle>
              <CardDescription>View and export feedback for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Select an event to view aggregated feedback and reports.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
