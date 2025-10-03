'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, User, Star, MessageSquare } from "lucide-react";
import { apiClient } from '@/lib/api/base';

interface EventTalk {
    id: number;
    title: string;
    speaker: number;
    speaker_name: string;
    description: string;
    duration: number;
    category: string;
    presentation_files?: string;
    event: number;
}

interface EventSessionsProps {
    eventId: string;
}

export function EventSessions({ eventId }: EventSessionsProps) {
    const [talks, setTalks] = useState<EventTalk[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTalks = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch talks from the API
                const response = await apiClient.get<EventTalk[]>('/talks/');
                const allTalks = response.data;
                
                // Filter talks for this specific event
                const eventTalks = allTalks.filter(talk => talk.event.toString() === eventId);
                setTalks(eventTalks);
            } catch (err) {
                console.error('Error fetching talks:', err);
                setError('Failed to load talks');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            loadTalks();
        }
    }, [eventId]);



    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="ml-2 text-muted-foreground">Loading talks...</span>
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

    if (talks.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-muted-foreground">No talks have been scheduled for this event yet.</p>
            </div>
        );
    }



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talks.map((talk) => (
                <Card key={talk.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold line-clamp-2">{talk.title}</h3>
                            <Badge variant="outline" className="text-xs">
                                {talk.category}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{talk.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Talk Details */}
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                <span>{talk.duration} hour{talk.duration !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <User className="h-4 w-4 mr-2 text-orange-500" />
                                <span>{talk.speaker_name}</span>
                            </div>
                        </div>

                        {/* Presentation Files */}
                        {talk.presentation_files && (
                            <div className="bg-muted p-3 rounded-md">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Presentation:</span>
                                    <a 
                                        href={talk.presentation_files} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Download File
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            <Link href={`/speakers/${talk.speaker}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                    <User className="h-4 w-4 mr-2" />
                                    View Speaker Profile
                                </Button>
                            </Link>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Star className="h-4 w-4 mr-1" />
                                    Rate
                                </Button>
                                <Link href={`/events/${eventId}/speakers/${talk.speaker}/feedback`}>
                                    <Button variant="outline" size="sm" className="flex-1 w-full">
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Feedback
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
