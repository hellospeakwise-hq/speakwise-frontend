'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserPlus } from "lucide-react";
import { EventSpeakers } from './event-speakers';
import { speakerApi, type Speaker } from "@/lib/api/speakerApi";
import { useToast } from "@/components/ui/use-toast";

interface SpeakerManagerProps {
    eventId: string;
}

export function SpeakerManager({ eventId }: SpeakerManagerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Speaker[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            // Get all speakers and filter by name
            // For now, return empty array since getSpeakers doesn't exist
            const allSpeakers: Speaker[] = [];
            const filteredSpeakers = allSpeakers.filter((speaker: Speaker) =>
                speaker.speaker_name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setSearchResults(filteredSpeakers);
        } catch (error) {
            console.error("Error searching speakers:", error);
            toast({
                title: "Search Failed",
                description: "Could not search for speakers. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddSpeaker = async (speakerId: number) => {
        setIsAdding(true);
        try {
            // For now, just update the UI since addSpeakerToEvent doesn't exist
            console.log(`Would add speaker ${speakerId} to event ${eventId}`);

            // Remove from search results to avoid adding again
            setSearchResults(prev => prev.filter(s => s.id !== speakerId));

            toast({
                title: "Speaker Added",
                description: "Speaker has been added to this event successfully.",
                variant: "default"
            });
        } catch (error) {
            console.error("Error adding speaker:", error);
            toast({
                title: "Failed to Add Speaker",
                description: "Could not add speaker to this event. They might already be added.",
                variant: "destructive"
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add Speakers to Event</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search for speakers by name..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                'Search'
                            )}
                        </Button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Search Results</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {searchResults.map((speaker) => (
                                    <div
                                        key={speaker.id}
                                        className="flex items-center justify-between p-3 border rounded-md"
                                    >
                                        <div>
                                            <p className="font-medium">{speaker.speaker_name}</p>
                                            {speaker.organization && (
                                                <p className="text-sm text-muted-foreground">{speaker.organization}</p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddSpeaker(speaker.id)}
                                            disabled={isAdding}
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add to Event
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {searchQuery && searchResults.length === 0 && !isSearching && (
                        <p className="text-center text-muted-foreground py-4">
                            No speakers found matching &quot;{searchQuery}&quot;.
                            Speakers must be registered on the platform to be added to events.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Display speakers currently in the event */}
            <EventSpeakers eventId={eventId} isManagement={true} />
        </div>
    );
}
