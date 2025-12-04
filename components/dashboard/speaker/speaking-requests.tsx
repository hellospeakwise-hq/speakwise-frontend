import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, Check, X, Loader2, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { speakerRequestApi, type SpeakerRequest } from "@/lib/api/speakerRequestApi"
import { organizationApi, type Organization } from "@/lib/api/organizationApi"
import { eventsApi } from "@/lib/api/events"
import { type Event } from "@/lib/types/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface EnrichedSpeakerRequest extends SpeakerRequest {
  organizationDetails?: Organization;
  eventDetails?: Event;
}

export function SpeakingRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<EnrichedSpeakerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<EnrichedSpeakerRequest | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [confirmAcceptRequest, setConfirmAcceptRequest] = useState<EnrichedSpeakerRequest | null>(null)
  const [confirmDeclineRequest, setConfirmDeclineRequest] = useState<EnrichedSpeakerRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use speaker-specific endpoint - backend filters by authenticated speaker
        const speakerRequests = await speakerRequestApi.getSpeakerIncomingRequests()
        console.log('Speaker incoming requests:', speakerRequests)

        // Enrich with organization and event details
        const [eventsResponse] = await Promise.all([
          eventsApi.getEvents()
        ])

        // Handle both array and paginated response
        const events = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.results || []

        // Fetch organizations and enrich requests
        const enrichedRequests: EnrichedSpeakerRequest[] = await Promise.all(
          speakerRequests.map(async (req) => {
            let organizationDetails
            if (req.organization) {
              try {
                organizationDetails = await organizationApi.getOrganization(req.organization)
              } catch (error) {
                console.error(`Error loading organization ${req.organization}:`, error)
              }
            } else {
              console.warn('Speaker request missing organization field:', req)
            }

            return {
              ...req,
              organizationDetails,
              eventDetails: events.find((event: any) => event.id === req.event)
            }
          })
        )

        // Sort by created date (newest first)
        enrichedRequests.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        console.log('Requests with status values:', enrichedRequests.map(r => ({
          id: r.id,
          status: r.status,
          statusType: typeof r.status,
          event: r.eventDetails?.name || r.eventDetails?.title
        })))

        // Debug: Log unique status values
        const uniqueStatuses = [...new Set(enrichedRequests.map(r => r.status))]
        console.log('Unique status values found:', uniqueStatuses)

        setRequests(enrichedRequests)
      } catch (err) {
        console.error('Error loading speaking requests:', err)
        setError('Failed to load speaking requests')
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const handleAccept = async (requestId: number) => {
    try {
      setActionLoading(true)

      // Find the request to get the event ID
      const request = requests.find(r => r.id === requestId)

      if (!request) {
        toast.error('Request not found')
        return
      }

      // Accept the speaking request
      await speakerRequestApi.acceptSpeakerRequest(requestId)

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'accepted' as const } : req
      ))

      // Show success message with event name
      const eventName = request.eventDetails?.name || request.eventDetails?.title || 'the event'
      toast.success(`Request accepted! ${eventName} has been added to your upcoming events.`)

      // Note: The backend should automatically add the event to the speaker's events_spoken array
      // when they accept the request. If not, we would need to call:
      // await speakerApi.addEventToProfile(request.event)

      setConfirmAcceptRequest(null)
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async (requestId: number) => {
    try {
      setActionLoading(true)
      // Use the new reject endpoint
      await speakerRequestApi.rejectSpeakerRequest(requestId)
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' as const } : req
      ))
      toast.success('Request declined')
      setConfirmDeclineRequest(null)
    } catch (error) {
      console.error('Error declining request:', error)
      toast.error('Failed to decline request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewDetails = async (requestId: number) => {
    try {
      setSelectedRequestId(requestId)
      setDetailLoading(true)

      // Use speaker-specific endpoint to get request details
      const requestDetail = await speakerRequestApi.getSpeakerRequestDetails(requestId)

      // Enrich with organization and event details
      let organization
      const eventsResponse = await eventsApi.getEvents()

      if (requestDetail.organization) {
        try {
          organization = await organizationApi.getOrganization(requestDetail.organization)
        } catch (error) {
          console.error(`Error loading organization ${requestDetail.organization}:`, error)
          toast.error('Failed to load organization details')
        }
      }

      const events = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.results || []
      const event = events.find((e: any) => e.id === requestDetail.event)

      setSelectedRequest({
        ...requestDetail,
        organizationDetails: organization,
        eventDetails: event
      })
    } catch (error) {
      console.error('Error loading request details:', error)
      toast.error('Failed to load request details')
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speaking Requests</CardTitle>
          <CardDescription>Invitations to speak at upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="ml-2 text-muted-foreground">Loading requests...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speaking Requests</CardTitle>
          <CardDescription>Invitations to speak at upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sampleRequests = [
    {
      id: "1",
      eventName: "DevConf 2025",
      organization: "DevConf Inc.",
      contactName: "John Smith",
      contactEmail: "john@devconf.example.com",
      date: "November 15-17, 2025",
      location: "Berlin, Germany",
      suggestedTopic: "The Future of AI in Software Development",
      audienceSize: "500-1000",
      status: "pending",
      receivedDate: "May 15, 2025",
      isNew: true,
    },
    {
      id: "2",
      eventName: "Women in Tech Summit",
      organization: "WIT Foundation",
      contactName: "Emily Johnson",
      contactEmail: "emily@witsummit.example.com",
      date: "September 5-7, 2025",
      location: "New York, USA",
      suggestedTopic: "Leading AI Research Teams",
      audienceSize: "200-500",
      status: "pending",
      receivedDate: "May 10, 2025",
      isNew: true,
    },
    {
      id: "3",
      eventName: "AI Ethics Conference",
      organization: "Tech Ethics Institute",
      contactName: "Michael Chen",
      contactEmail: "michael@techethics.example.com",
      date: "October 20-22, 2025",
      location: "Toronto, Canada",
      suggestedTopic: "Ethical Frameworks for AI Development",
      audienceSize: "200-500",
      status: "accepted",
      receivedDate: "April 28, 2025",
      isNew: false,
    },
    {
      id: "4",
      eventName: "Global Tech Forum",
      organization: "GTF Organizers",
      contactName: "Sarah Williams",
      contactEmail: "sarah@gtf.example.com",
      date: "December 5-7, 2025",
      location: "Singapore",
      suggestedTopic: "AI and the Future of Work",
      audienceSize: "1000+",
      status: "rejected",
      receivedDate: "April 15, 2025",
      isNew: false,
    },
  ]

  // Filter requests based on status
  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true
    return request.status === statusFilter
  })

  // Count requests by status
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speaking Requests</CardTitle>
        <CardDescription>Invitations to speak at upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${statusFilter === 'all'
              ? 'bg-orange-500 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            All <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/10">{counts.all}</span>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${statusFilter === 'pending'
              ? 'bg-orange-500 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            Pending <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/10">{counts.pending}</span>
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${statusFilter === 'accepted'
              ? 'bg-green-600 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            Accepted <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/10">{counts.accepted}</span>
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${statusFilter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            Declined <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/10">{counts.rejected}</span>
          </button>
        </div>

        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 p-4">
                  {/* Left Section - Event Info */}
                  <div className="flex-1 space-y-3">
                    {/* Event Title and Status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        {request.eventDetails?.name || request.eventDetails?.title || 'Event'}
                      </h3>
                      {request.status === "pending" && (
                        <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
                          Pending Response
                        </Badge>
                      )}
                      {request.status === "accepted" && (
                        <Badge className="bg-green-600 text-white hover:bg-green-700">
                          Accepted
                        </Badge>
                      )}
                      {request.status === "rejected" && (
                        <Badge className="bg-red-600 text-white hover:bg-red-700">
                          Declined
                        </Badge>
                      )}
                      {!['pending', 'accepted', 'rejected'].includes(request.status) && (
                        <Badge variant="secondary">
                          {request.status}
                        </Badge>
                      )}
                    </div>

                    {/* Organization */}
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="font-medium text-muted-foreground">
                        {request.organizationDetails?.name || 'Organization'}
                      </span>
                    </div>

                    {/* Event Details */}
                    {request.eventDetails && (
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span>{request.eventDetails.date}</span>
                        </div>
                        {request.eventDetails.location && typeof request.eventDetails.location !== 'string' && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-orange-500" />
                            <span>
                              {request.eventDetails.location.city}, {request.eventDetails.location.country.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Preview */}
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.message}
                      </p>
                    </div>

                    {/* Received Date */}
                    {request.created_at && (() => {
                      const receivedDate = new Date(request.created_at)
                      const now = new Date()
                      const diffTime = Math.abs(now.getTime() - receivedDate.getTime())
                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
                      const diffMinutes = Math.floor(diffTime / (1000 * 60))

                      let timeAgo = ''
                      if (diffDays > 0) {
                        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
                      } else if (diffHours > 0) {
                        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
                      } else if (diffMinutes > 0) {
                        timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
                      } else {
                        timeAgo = 'Just now'
                      }

                      return (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            Received {receivedDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className={`font-medium ${diffDays >= 5 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                            {timeAgo}
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {request.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request.id!)}
                      >
                        View Details
                      </Button>
                    )}
                    {request.status === "pending" && request.id && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setConfirmAcceptRequest(request)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                          onClick={() => setConfirmDeclineRequest(request)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              {requests.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No speaking requests yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Organizations will send you invitations to speak at their events
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">
                    No {statusFilter === 'all' ? '' : statusFilter} requests
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {statusFilter === 'pending' && 'You have no pending requests at the moment'}
                    {statusFilter === 'accepted' && 'You have not accepted any requests yet'}
                    {statusFilter === 'rejected' && 'You have not declined any requests yet'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Request Details Dialog - Uses GET /api/speaker-requests/{id}/ */}
      <Dialog open={selectedRequestId !== null} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Speaking Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this speaking invitation
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="ml-2 text-muted-foreground">Loading details...</span>
            </div>
          ) : selectedRequest ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {selectedRequest.status === "pending" && (
                  <Badge variant="outline" className="border-orange-200 text-orange-700 dark:text-orange-400">
                    Pending
                  </Badge>
                )}
                {selectedRequest.status === "accepted" && (
                  <Badge className="bg-green-600 text-white hover:bg-green-700">
                    Accepted
                  </Badge>
                )}
                {selectedRequest.status === "rejected" && (
                  <Badge className="bg-red-600 text-white hover:bg-red-700">
                    Declined
                  </Badge>
                )}
              </div>

              {/* Event Information */}
              <div className="space-y-2">
                <h4 className="font-semibold">Event Information</h4>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div>
                    <span className="text-sm font-medium">Event Name:</span>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.eventDetails?.name || selectedRequest.eventDetails?.title || 'Not available'}
                    </p>
                  </div>
                  {selectedRequest.eventDetails?.date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span>{selectedRequest.eventDetails.date}</span>
                    </div>
                  )}
                  {selectedRequest.eventDetails?.location && typeof selectedRequest.eventDetails.location !== 'string' && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>
                        {selectedRequest.eventDetails.location.city}, {selectedRequest.eventDetails.location.country.name}
                      </span>
                    </div>
                  )}
                  {selectedRequest.eventDetails?.description && (
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRequest.eventDetails.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Information */}
              <div className="space-y-2">
                <h4 className="font-semibold">Organization</h4>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">
                      {selectedRequest.organizationDetails?.name || 'Organization'}
                    </span>
                  </div>
                  {selectedRequest.organizationDetails?.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.organizationDetails.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Request Message */}
              <div className="space-y-2">
                <h4 className="font-semibold">Request Message</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.message}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                {selectedRequest.created_at && (
                  <div>
                    <span className="font-medium">Received:</span> {new Date(selectedRequest.created_at).toLocaleString()}
                  </div>
                )}
                {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedRequest.updated_at).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === "pending" && selectedRequest.id && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleAccept(selectedRequest.id!)
                      setSelectedRequestId(null)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept Request
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleDecline(selectedRequest.id!)
                      setSelectedRequestId(null)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Decline Request
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Accept Confirmation Dialog */}
      <Dialog open={confirmAcceptRequest !== null} onOpenChange={(open) => !open && setConfirmAcceptRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Speaking Request?</DialogTitle>
            <DialogDescription>
              {user?.first_name}, you are accepting a request from{' '}
              <span className="font-semibold text-foreground">
                {confirmAcceptRequest?.eventDetails?.name || confirmAcceptRequest?.eventDetails?.title || 'this event'}
              </span>
              . Are you sure you want to accept?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {confirmAcceptRequest?.organizationDetails && (
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{confirmAcceptRequest.organizationDetails.name}</span>
                </div>
                {confirmAcceptRequest.eventDetails && (
                  <>
                    {confirmAcceptRequest.eventDetails.date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{confirmAcceptRequest.eventDetails.date}</span>
                      </div>
                    )}
                    {confirmAcceptRequest.eventDetails.location && typeof confirmAcceptRequest.eventDetails.location !== 'string' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {confirmAcceptRequest.eventDetails.location.city}, {confirmAcceptRequest.eventDetails.location.country.name}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmAcceptRequest(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => confirmAcceptRequest?.id && handleAccept(confirmAcceptRequest.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Yes, Accept
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={confirmDeclineRequest !== null} onOpenChange={(open) => !open && setConfirmDeclineRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Speaking Request?</DialogTitle>
            <DialogDescription>
              {user?.first_name}, you are declining a request from{' '}
              <span className="font-semibold text-foreground">
                {confirmDeclineRequest?.eventDetails?.name || confirmDeclineRequest?.eventDetails?.title || 'this event'}
              </span>
              . Are you sure you want to decline?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {confirmDeclineRequest?.organizationDetails && (
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{confirmDeclineRequest.organizationDetails.name}</span>
                </div>
                {confirmDeclineRequest.eventDetails && (
                  <>
                    {confirmDeclineRequest.eventDetails.date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{confirmDeclineRequest.eventDetails.date}</span>
                      </div>
                    )}
                    {confirmDeclineRequest.eventDetails.location && typeof confirmDeclineRequest.eventDetails.location !== 'string' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {confirmDeclineRequest.eventDetails.location.city}, {confirmDeclineRequest.eventDetails.location.country.name}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDeclineRequest(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => confirmDeclineRequest?.id && handleDecline(confirmDeclineRequest.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Yes, Decline
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
