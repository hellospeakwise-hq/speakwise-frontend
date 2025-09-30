"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Users, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Settings, 
  Upload,
  BarChart3,
  Calendar,
  MapPin,
  Clock,
  Plus
} from "lucide-react"
import Link from "next/link"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { EventFormDialog } from "@/components/dashboard/event-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  getEventStatus,
  getEventStatusText,
  getEventStatusColor,
  isEventUpcoming,
  isEventPast,
  formatEventDateRange,
  EventStatus
} from "@/lib/utils/event-utils"

interface EventManagementTableProps {
  events: Event[]
  loading: boolean
  onEventUpdate: (event: Event) => void
  onEventDelete: (eventId: number) => Promise<void>
  onEventCreate: (event: Event) => void
  onEventStatusToggle: (eventId: number, isActive: boolean) => Promise<void>
}

export function EventManagementTable({
  events,
  loading,
  onEventUpdate,
  onEventDelete,
  onEventCreate,
  onEventStatusToggle
}: EventManagementTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setShowEventDialog(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return
    
    try {
      setActionLoading(`delete-${eventToDelete.id}`)
      await onEventDelete(eventToDelete.id)
      setShowDeleteDialog(false)
      setEventToDelete(null)
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusToggle = async (event: Event) => {
    try {
      setActionLoading(`status-${event.id}`)
      await onEventStatusToggle(event.id, !event.is_active)
    } catch (error) {
      console.error('Error toggling event status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEventSaved = (event: Event) => {
    if (selectedEvent) {
      onEventUpdate(event)
    } else {
      onEventCreate(event)
    }
    setShowEventDialog(false)
    setSelectedEvent(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading events...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Management</CardTitle>
          <Button onClick={handleCreateEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to get started
              </p>
              <Button onClick={handleCreateEvent} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => {
                    const status = getEventStatus(event)
                    const upcoming = isEventUpcoming(event)
                    const past = isEventPast(event)
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{event.title}</div>
                            {event.event_nickname && (
                              <div className="text-sm text-muted-foreground">
                                {event.event_nickname}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={getEventStatusColor(status)}
                            >
                              {getEventStatusText(status)}
                            </Badge>
                            {upcoming && (
                              <Badge variant="outline" className="text-blue-600">
                                Upcoming
                              </Badge>
                            )}
                            {past && (
                              <Badge variant="outline" className="text-gray-600">
                                Past
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatEventDateRange(event.start_date_time, event.end_date_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.location ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {typeof event.location === 'string' 
                                ? event.location 
                                : event.location?.venue || 'Location TBD'}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No location</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {event.attendees || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Event
                                </Link>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Event
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.id}/manage`}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Manage Event
                                </Link>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.id}/manage-speakers`}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Manage Speakers
                                </Link>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.id}/manage-sessions`}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Manage Sessions
                                </Link>
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleStatusToggle(event)}
                                disabled={actionLoading === `status-${event.id}`}
                              >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                {event.is_active ? 'Unpublish' : 'Publish'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDeleteEvent(event)}
                                className="text-red-600"
                                disabled={actionLoading === `delete-${event.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EventFormDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
        onEventSaved={handleEventSaved}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
              All associated sessions, speakers, and feedback will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={!!actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
