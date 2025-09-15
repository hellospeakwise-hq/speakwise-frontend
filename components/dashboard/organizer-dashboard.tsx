import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, BarChart, Loader2, Star, RefreshCw } from "lucide-react"
import { useOrganizerEvents } from "@/hooks/use-organizer-events"
import { EventManagementTable } from "@/components/dashboard/event-management-table"
import { AttendeeManagement } from "@/components/dashboard/attendee-management"

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
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and attendees</p>
        </div>
        <Button variant="outline" onClick={handleRefreshStats} disabled={loading || refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Organizer Stats */}
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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
          <TabsTrigger value="events">Manage Events</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
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
