"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { SpeakerManager } from "@/components/events/speaker-manager";
import { eventsApi } from "@/lib/api/events";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function ManageEventSpeakers({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [eventTitle, setEventTitle] = useState<string | null>(null);
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user?.userType !== 'organizer') {
            router.push(`/events/${id}`)
        }
    }, [loading, user, router, id])

    // Load the event title
    useState(() => {
        const loadEventTitle = async () => {
            try {
                const event = await eventsApi.getEvent(id);
                setEventTitle(event.title);
            } catch (error) {
                console.error("Error loading event:", error);
            }
        };

        loadEventTitle();
    });

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="container py-10 max-w-4xl mx-auto">
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
        <div className="container py-10 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    href={`/events/${id}`}
                    className="inline-flex items-center mb-4 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Event
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                    Manage Speakers: {eventTitle || "Loading..."}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Add or remove speakers for this event. Only speakers registered on the platform can be added.
                </p>
            </div>

            <SpeakerManager eventId={id} />
        </div>
    );
}
