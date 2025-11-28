'use client'

import { useState, useEffect } from "react"
import { Calendar, MapPin, User, Loader2, Building2, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { speakerRequestApi, type SpeakerRequest } from "@/lib/api/speakerRequestApi"
import { organizationApi, type Organization } from "@/lib/api/organizationApi"
import { eventsApi } from "@/lib/api/events"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { type Event } from "@/lib/types/api"
import { toast } from "sonner"

interface EnrichedOrganizerRequest extends SpeakerRequest {
    speakerDetails?: Speaker;
    eventDetails?: Event;
}

export function OrganizerSpeakerRequests() {
    const [requests, setRequests] = useState<EnrichedOrganizerRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userOrgs, setUserOrgs] = useState<Organization[]>([])
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

    useEffect(() => {
        const loadRequests = async () => {
            try {
                setLoading(true)
                setError(null)

                // Get user's organizations
                const orgs = await organizationApi.getUserOrganizations()
                const approvedOrgs = orgs.filter(org => org.is_active === true)
                setUserOrgs(approvedOrgs)

                if (approvedOrgs.length === 0) {
                    setRequests([])
                    setLoading(false)
                    return
                }

                // Get speaker requests for each organization and combine them
                const allRequestsPromises = approvedOrgs.map(org =>
                    speakerRequestApi.getSpeakerRequests(org.id!)
                )
                const requestsArrays = await Promise.all(allRequestsPromises)
                const allRequests = requestsArrays.flat()

                // Enrich with speaker and event details
                const [speakers, eventsResponse] = await Promise.all([
                    speakerApi.getSpeakers(),
                    eventsApi.getEvents()
                ])

                // Handle both array and paginated response
                const events = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.results || []

                const enrichedRequests: EnrichedOrganizerRequest[] = allRequests.map(req => ({
                    ...req,
                    speakerDetails: speakers.find((speaker: Speaker) => speaker.id === req.speaker),
                    eventDetails: events.find((event: Event) => event.id === req.event)
                }))

                // Sort by created date (newest first)
                enrichedRequests.sort((a, b) => {
                    if (!a.created_at || !b.created_at) return 0
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                })

                setRequests(enrichedRequests)
            } catch (err) {
                console.error('Error loading speaker requests:', err)
                setError('Failed to load speaker requests')
            } finally {
                setLoading(false)
            }
        }

        loadRequests()
    }, [])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Speaker Requests</CardTitle>
                    <CardDescription>Track your speaker invitation requests</CardDescription>
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
                    <CardTitle>Speaker Requests</CardTitle>
                    <CardDescription>Track your speaker invitation requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (userOrgs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Speaker Requests</CardTitle>
                    <CardDescription>Track your speaker invitation requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            You need an approved organization to make speaker requests
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Filter requests based on status
    const filteredRequests = requests.filter(request => {
        if (statusFilter === 'all') return true
        return request.status === statusFilter
    })

    // Count requests by status
    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Speaker Requests</CardTitle>
                <CardDescription>
                    You have {requests.length} speaker {requests.length === 1 ? 'request' : 'requests'}
                </CardDescription>
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
                        onClick={() => setStatusFilter('approved')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${statusFilter === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                    >
                        Accepted <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/10">{counts.approved}</span>
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

                <div className="space-y-6">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                            <div key={request.id} className="border-b pb-6 last:border-0 last:pb-0">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        {/* Speaker Info */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                {request.speakerDetails?.avatar ? (
                                                    <AvatarImage
                                                        src={request.speakerDetails.avatar}
                                                        alt={request.speakerDetails.speaker_name}
                                                    />
                                                ) : (
                                                    <AvatarFallback>
                                                        {request.speakerDetails?.speaker_name
                                                            .split(' ')
                                                            .map(n => n[0])
                                                            .join('')
                                                            .slice(0, 2) || 'SP'}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">
                                                    {request.speakerDetails?.speaker_name || 'Speaker'}
                                                </h3>
                                                {request.speakerDetails?.organization && (
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {request.speakerDetails.organization}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Status Badge */}
                                            <div className="flex-shrink-0">
                                                {request.status === "pending" && (
                                                    <Badge variant="outline" className="border-orange-200 text-orange-700 dark:text-orange-400">
                                                        Pending
                                                    </Badge>
                                                )}
                                                {request.status === "approved" && (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                        Approved
                                                    </Badge>
                                                )}
                                                {request.status === "rejected" && (
                                                    <Badge variant="secondary">Rejected</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        {request.eventDetails && (
                                            <div className="pl-15 space-y-2">
                                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                                    For: {request.eventDetails.name || request.eventDetails.title}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                                                        {request.eventDetails.date}
                                                    </div>
                                                    {request.eventDetails.location && typeof request.eventDetails.location !== 'string' && (
                                                        <div className="flex items-center">
                                                            <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                                                            {request.eventDetails.location.city}, {request.eventDetails.location.country.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Preview */}
                                        <div className="pl-15">
                                            <div className="p-3 bg-muted rounded-md">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm font-medium">Your Message:</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {request.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Request Date */}
                                        {request.created_at && (
                                            <div className="pl-15 text-xs text-muted-foreground">
                                                Sent: {new Date(request.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            {requests.length === 0 ? (
                                <>
                                    <p className="text-muted-foreground">No speaker requests yet</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Visit speaker profiles to invite them to your events
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-muted-foreground">
                                        No {statusFilter === 'all' ? '' : statusFilter} requests
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {statusFilter === 'pending' && 'No pending responses from speakers'}
                                        {statusFilter === 'approved' && 'No speakers have accepted your invitations yet'}
                                        {statusFilter === 'rejected' && 'No speakers have declined your invitations'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
