'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2, User, Star, MessageSquare } from "lucide-react";
import { Session, sessionsAPI } from '@/lib/api/sessionsApi';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface EventSessionsProps {
    eventId: string;
}

export function EventSessions({ eventId }: EventSessionsProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await sessionsAPI.getEventSessions(parseInt(eventId));
                setSessions(data);
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError('Failed to load sessions');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            loadSessions();
        }
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="ml-2 text-muted-foreground">Loading sessions...</span>
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

    if (sessions.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-muted-foreground">No sessions have been scheduled for this event yet.</p>
            </div>
        );
    }

    // Format date for display
    const formatSessionTime = (dateString: string) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatSessionDate = (dateString: string) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Helper function to construct full image URL
    const getAvatarUrl = (avatarPath: string | undefined) => {
        if (!avatarPath) return null;
        // If it's already a full URL, return as is
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
            return avatarPath;
        }
        // Otherwise, construct the full URL with the backend base URL
        return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
                <Card key={session.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold line-clamp-2">{session.name}</h3>
                            <Badge variant="outline" className="text-xs">
                                {formatSessionTime(session.start_date_time)}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Session Details */}
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                <span>{formatSessionDate(session.start_date_time)}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                <span>
                                    {formatSessionTime(session.start_date_time)} - {formatSessionTime(session.end_date_time)}
                                </span>
                            </div>
                            <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                <span>
                                    {session.location 
                                        ? typeof session.location === 'string' 
                                            ? session.location
                                            : (() => {
                                                const loc = session.location as any;
                                                return `${loc.venue || ''}${loc.city ? `, ${loc.city}` : ''}${loc.country?.name ? `, ${loc.country.name}` : ''}`.trim().replace(/^,\s*/, '') || 'TBD';
                                              })()
                                        : 'TBD'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Speaker Information */}
                        {session.speaker_details && (
                            <div className="bg-muted p-3 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        {session.speaker_details.avatar && getAvatarUrl(session.speaker_details.avatar) && (
                                            <AvatarImage
                                                src={getAvatarUrl(session.speaker_details.avatar)!}
                                                alt={session.speaker_details.full_name}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <AvatarFallback className="text-sm">
                                            {session.speaker_details.full_name
                                                .split(' ')
                                                .map(n => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{session.speaker_details.full_name}</h4>
                                        {session.speaker_details.organization && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {session.speaker_details.organization}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            {session.speaker_details && (
                                <Link href={`/speakers/${session.speaker_details.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <User className="h-4 w-4 mr-2" />
                                        View Speaker Profile
                                    </Button>
                                </Link>
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Star className="h-4 w-4 mr-1" />
                                    Rate
                                </Button>
                                {session.speaker_details && (
                                    <Link href={`/events/${eventId}/speakers/${session.speaker_details.id}/feedback`}>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <MessageSquare className="h-4 w-4 mr-1" />
                                            Feedback
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
