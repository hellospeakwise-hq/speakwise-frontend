'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { speakersAPI, type Speaker } from "@/lib/api/speakersApi";

interface EventSpeakersProps {
    eventId: string;
    isManagement?: boolean;
}

export function EventSpeakers({ eventId, isManagement = false }: EventSpeakersProps) {
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSpeakers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await speakersAPI.getEventSpeakers(parseInt(eventId));
                setSpeakers(data);
            } catch (err) {
                console.error('Error fetching speakers:', err);
                setError('Failed to load speakers');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            loadSpeakers();
        }
    }, [eventId]);

    const handleRemoveSpeaker = async (speakerId: number) => {
        try {
            await speakersAPI.removeSpeakerFromEvent(parseInt(eventId), speakerId);
            // Refresh the speakers list
            setSpeakers(speakers.filter(speaker => speaker.id !== speakerId));
        } catch (err) {
            console.error('Error removing speaker:', err);
            setError('Failed to remove speaker');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="ml-2 text-muted-foreground">Loading speakers...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4">
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (speakers.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-muted-foreground">No speakers found for this event.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Event Speakers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((speaker) => (
                    <Card key={speaker.id} className="overflow-hidden">
                        <div className="flex items-center space-x-4 p-4">
                            <Avatar className="h-12 w-12">
                                {speaker.avatar ? (
                                    <AvatarImage src={speaker.avatar} alt={speaker.full_name} />
                                ) : (
                                    <AvatarFallback>
                                        {speaker.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-medium">{speaker.full_name}</h4>
                                {speaker.organization && (
                                    <p className="text-sm text-muted-foreground">{speaker.organization}</p>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <Link href={`/speakers/${speaker.id}`} passHref>
                                    <Button variant="outline" size="sm">
                                        Profile
                                    </Button>
                                </Link>
                                <Link href={`/events/${eventId}/speakers/${speaker.id}/feedback`} passHref>
                                    <Button size="sm" variant="secondary">
                                        Feedback
                                    </Button>
                                </Link>
                                {isManagement && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleRemoveSpeaker(speaker.id)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}