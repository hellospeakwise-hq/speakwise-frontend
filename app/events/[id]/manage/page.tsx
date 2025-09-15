'use client'

import Link from "next/link"
import { useState, use, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventDetails } from "@/components/events/event-details"
import { SpeakersList } from "@/components/events/speakers-list"
import { TagManager } from "@/components/events/tag-manager"
import { TagCreator } from "@/components/events/tag-creator"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function EventManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [activeTab, setActiveTab] = useState("details")
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user?.userType !== 'organizer') {
            router.push(`/events/${id}`)
        }
    }, [loading, user, router, id])

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="container py-10">
                <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </div>
        )
    }

    // Redirect if not organizer
    if (user?.userType !== 'organizer') {
        return null
    }

    return (
        <div className="container py-10">
            <Link
                href="/events"
                className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
            >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Events
            </Link>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-6">
                    <TabsList>
                        <TabsTrigger value="details">Event Details</TabsTrigger>
                        <TabsTrigger value="speakers">Speakers</TabsTrigger>
                        <TabsTrigger value="tags">Manage Tags</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="details" className="space-y-10">
                    <EventDetails id={id} />
                </TabsContent>

                <TabsContent value="speakers" className="space-y-10">
                    <SpeakersList eventId={id} />
                </TabsContent>

                <TabsContent value="tags">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">Tag Management</h2>
                        <p className="text-muted-foreground">
                            Create, assign, and manage tags for this event to help categorize and filter events.
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                            <TagCreator onTagCreated={() => {
                                // Refresh tag data when a new tag is created
                                // This will be handled by the TagManager component
                            }} />
                        </div>

                        <div className="bg-card rounded-md border p-6">
                            <TagManager eventId={parseInt(id)} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
