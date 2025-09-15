'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { sessionsAPI, Session } from '@/lib/api/sessionsApi';
import { speakersAPI, Speaker } from '@/lib/api/speakersApi';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface SessionManagerProps {
    eventId: string;
}

export function SessionManager({ eventId }: SessionManagerProps) {
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Form state
    const [sessionData, setSessionData] = useState({
        name: '',
        description: '',
        location: '',
        start_date_time: '',
        end_date_time: '',
        speaker_id: '',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load speakers for this event
                const speakersData = await speakersAPI.getSpeakers();
                setSpeakers(speakersData);

                // Load existing sessions
                const sessionsData = await sessionsAPI.getEventSessions(parseInt(eventId));
                setSessions(sessionsData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            loadData();
        }
    }, [eventId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSessionData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setSessionData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!sessionData.name || !sessionData.start_date_time || !sessionData.speaker_id) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        try {
            setSubmitting(true);

            // Format the data for API
            const formattedData = {
                ...sessionData,
                speaker_id: parseInt(sessionData.speaker_id)
            };

            // Create the session
            const result = await sessionsAPI.createSessionWithSpeaker(parseInt(eventId), formattedData);

            // Success message
            toast({
                title: "Session created",
                description: "The session has been successfully created"
            });

            // Reset form
            setSessionData({
                name: '',
                description: '',
                location: '',
                start_date_time: '',
                end_date_time: '',
                speaker_id: '',
            });

            // Refresh sessions list
            const updatedSessions = await sessionsAPI.getEventSessions(parseInt(eventId));
            setSessions(updatedSessions);
        } catch (err) {
            console.error('Error creating session:', err);
            toast({
                title: "Error",
                description: "Failed to create session",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to delete this session?')) {
            return;
        }

        try {
            await sessionsAPI.deleteSession(sessionId);

            // Remove from state
            setSessions(sessions.filter(session => session.id !== sessionId));

            toast({
                title: "Session deleted",
                description: "The session has been successfully removed"
            });
        } catch (err) {
            console.error('Error deleting session:', err);
            toast({
                title: "Error",
                description: "Failed to delete session",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Session Name*</Label>
                            <Input
                                id="name"
                                name="name"
                                value={sessionData.name}
                                onChange={handleChange}
                                placeholder="Enter session name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={sessionData.description}
                                onChange={handleChange}
                                placeholder="Enter session description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date_time">Start Date & Time*</Label>
                                <Input
                                    id="start_date_time"
                                    name="start_date_time"
                                    type="datetime-local"
                                    value={sessionData.start_date_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date_time">End Date & Time*</Label>
                                <Input
                                    id="end_date_time"
                                    name="end_date_time"
                                    type="datetime-local"
                                    value={sessionData.end_date_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                value={sessionData.location}
                                onChange={handleChange}
                                placeholder="Enter session location"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="speaker_id">Speaker*</Label>
                            <Select
                                value={sessionData.speaker_id}
                                onValueChange={(value) => handleSelectChange('speaker_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a speaker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {speakers.map((speaker) => (
                                        <SelectItem key={speaker.id} value={speaker.id.toString()}>
                                            {speaker.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Session'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No sessions have been created for this event yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <h3 className="font-medium">{session.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {session.speaker_details ? `Speaker: ${session.speaker_details.full_name}` : 'No speaker assigned'}
                                        </p>
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/events/${eventId}/sessions/${session.id}/edit`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteSession(session.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
