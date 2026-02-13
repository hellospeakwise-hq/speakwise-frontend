'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Loader2, User, MessageSquare, Search, X } from "lucide-react";
import { apiClient } from '@/lib/api/base';
import { speakerApi, type Speaker, getSpeakerSlug } from '@/lib/api/speakerApi';
import { getAvatarUrl } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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

interface TalkWithSpeaker extends EventTalk {
    speaker_details?: Speaker;
}

interface EventSessionsProps {
    eventId: string;
}

export function EventSessions({ eventId }: EventSessionsProps) {
    const [talks, setTalks] = useState<TalkWithSpeaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpeakerId, setSelectedSpeakerId] = useState<number | null>(null);
    const [speakerDropdownOpen, setSpeakerDropdownOpen] = useState(false);

    useEffect(() => {
        const loadTalks = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch talks and speakers from the API
                const [talksResponse, speakersResponse] = await Promise.all([
                    apiClient.get<EventTalk[]>('/talks/'),
                    speakerApi.getSpeakers()
                ]);

                const allTalks = talksResponse.data;
                const speakers = speakersResponse;

                // Filter talks for this specific event and add speaker details
                const eventTalks = allTalks
                    .filter(talk => talk.event.toString() === eventId)
                    .map(talk => ({
                        ...talk,
                        speaker_details: speakers.find(speaker => speaker.id === talk.speaker)
                    }));

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

    // Get unique speakers from talks
    const uniqueSpeakers = useMemo(() => {
        const speakerMap = new Map<number, { id: number; name: string; avatar?: string; organization?: string }>();
        talks.forEach(talk => {
            if (!speakerMap.has(talk.speaker)) {
                speakerMap.set(talk.speaker, {
                    id: talk.speaker,
                    name: talk.speaker_name,
                    avatar: talk.speaker_details?.avatar,
                    organization: talk.speaker_details?.organization
                });
            }
        });
        return Array.from(speakerMap.values());
    }, [talks]);

    // Filter talks based on search query and selected speaker
    const filteredTalks = useMemo(() => {
        return talks.filter(talk => {
            const matchesSearch = searchQuery === '' ||
                talk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                talk.speaker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                talk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                talk.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSpeaker = selectedSpeakerId === null || talk.speaker === selectedSpeakerId;

            return matchesSearch && matchesSpeaker;
        });
    }, [talks, searchQuery, selectedSpeakerId]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedSpeakerId(null);
    };

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

    const selectedSpeaker = uniqueSpeakers.find(s => s.id === selectedSpeakerId);

    return (
        <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Text Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search talks, speakers, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Speaker Filter Dropdown */}
                    <Popover open={speakerDropdownOpen} onOpenChange={setSpeakerDropdownOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-[280px] justify-start text-left font-normal"
                            >
                                {selectedSpeaker ? (
                                    <div className="flex items-center gap-2 truncate">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={getAvatarUrl(selectedSpeaker.avatar, selectedSpeaker.name)} alt={selectedSpeaker.name} />
                                            <AvatarFallback className="text-xs">
                                                {selectedSpeaker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{selectedSpeaker.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <User className="h-4 w-4 mr-2" />
                                        Filter by Speaker
                                    </>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search speakers..." />
                                <CommandList>
                                    <CommandEmpty>No speakers found.</CommandEmpty>
                                    <CommandGroup>
                                        {uniqueSpeakers.map((speaker) => (
                                            <CommandItem
                                                key={speaker.id}
                                                value={speaker.name}
                                                onSelect={() => {
                                                    setSelectedSpeakerId(speaker.id);
                                                    setSpeakerDropdownOpen(false);
                                                }}
                                                className="flex items-center gap-3 py-3"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getAvatarUrl(speaker.avatar, speaker.name)} alt={speaker.name} />
                                                    <AvatarFallback>
                                                        {speaker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="font-medium truncate">{speaker.name}</span>
                                                    {speaker.organization && (
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {speaker.organization}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Active Filters Display */}
                {(searchQuery || selectedSpeakerId) && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {searchQuery && (
                            <Badge variant="secondary" className="gap-1">
                                Search: {searchQuery}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                    onClick={() => setSearchQuery('')}
                                />
                            </Badge>
                        )}
                        {selectedSpeaker && (
                            <Badge variant="secondary" className="gap-1">
                                Speaker: {selectedSpeaker.name}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                    onClick={() => setSelectedSpeakerId(null)}
                                />
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-7 text-xs"
                        >
                            Clear all
                        </Button>
                    </div>
                )}

                {/* Results Count */}
                <p className="text-sm text-muted-foreground">
                    Showing {filteredTalks.length} of {talks.length} talk{talks.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Talks Grid */}
            {filteredTalks.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No talks match your search criteria.</p>
                    <Button variant="link" onClick={handleClearFilters} className="mt-2">
                        Clear filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTalks.map((talk) => (
                        <Card key={talk.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold line-clamp-2 flex-1 pr-2">{talk.title}</h3>
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                        {talk.category}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={getAvatarUrl(talk.speaker_details?.avatar, talk.speaker_name)}
                                            alt={talk.speaker_name}
                                        />
                                        <AvatarFallback className="text-sm">
                                            {talk.speaker_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{talk.speaker_name}</span>
                                        {talk.speaker_details?.organization && (
                                            <span className="text-xs text-muted-foreground">
                                                {talk.speaker_details.organization}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">{talk.description}</p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Talk Details */}
                                <div className="flex items-center text-sm">
                                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                    <span>{talk.duration} hour{talk.duration !== 1 ? 's' : ''}</span>
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
                                    <Link href={`/speakers/${talk.speaker_details ? getSpeakerSlug(talk.speaker_details) : talk.speaker}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <User className="h-4 w-4 mr-2" />
                                            View Speaker Profile
                                        </Button>
                                    </Link>

                                    <Link href={`/events/${eventId}/speakers/${talk.speaker_details ? getSpeakerSlug(talk.speaker_details) : talk.speaker}/feedback`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Give Feedback
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
