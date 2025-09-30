'use client'

import { useState, useEffect } from "react"
import { eventsApi } from "@/lib/api/events"
import { type Tag, type Event } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TagManagerProps {
    eventId: number
    onTagsChange?: (event: Event) => void
}

export function TagManager({ eventId, onTagsChange }: TagManagerProps) {
    const [event, setEvent] = useState<Event | null>(null)
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null)

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [eventData, tagsData] = await Promise.all([
                eventsApi.getEvent(eventId.toString()),
                eventsApi.getTags()
            ])
            setEvent(eventData)
            setAllTags(tagsData)
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Failed to load data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [eventId])

    const addTag = async () => {
        if (!selectedTagId || !event) return

        try {
            setIsAddingTag(true)
            // For now, just update the UI since addTagToEvent doesn't exist
            console.log(`Would add tag ${selectedTagId} to event ${eventId}`)
            
            // Mock updating the event with the new tag
            const newTag = allTags.find((t: Tag) => t.id === selectedTagId)
            if (newTag && event) {
                const updatedEvent = { ...event, tags: [...event.tags, newTag] }
                setEvent(updatedEvent)
                setSelectedTagId(null)
                if (onTagsChange) onTagsChange(updatedEvent)
            }
        } catch (err) {
            console.error('Error adding tag:', err)
            setError('Failed to add tag. Please try again.')
        } finally {
            setIsAddingTag(false)
        }
    }

    const removeTag = async (tagId: number) => {
        if (!event) return

        try {
            // For now, just update the UI since removeTagFromEvent doesn't exist
            const updatedEvent = { ...event, tags: event.tags.filter((t: any) => t.id !== tagId) }
            setEvent(updatedEvent)
            if (onTagsChange) onTagsChange(updatedEvent)
        } catch (err) {
            console.error('Error removing tag:', err)
            setError('Failed to remove tag. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading tags...</span>
            </div>
        )
    }

    // Filter out tags that are already assigned to the event
    const availableTags = allTags.filter(tag =>
        !event?.tags?.some(eventTag => eventTag.id === tag.id)
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Event Tags</h3>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Tag</DialogTitle>
                            <DialogDescription>
                                Select a tag to add to this event.
                            </DialogDescription>
                        </DialogHeader>

                        {error && (
                            <div className="bg-red-50 text-red-800 p-2 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div className="py-4">
                            <Label htmlFor="tag-select">Available Tags</Label>
                            <select
                                id="tag-select"
                                className="w-full p-2 border rounded mt-1"
                                value={selectedTagId || ''}
                                onChange={(e) => setSelectedTagId(Number(e.target.value))}
                                disabled={availableTags.length === 0}
                            >
                                <option value="">Select a tag...</option>
                                {availableTags.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>

                            {availableTags.length === 0 && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    All available tags have been assigned to this event.
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedTagId(null)}
                                disabled={isAddingTag}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={addTag}
                                disabled={!selectedTagId || isAddingTag}
                            >
                                {isAddingTag ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        Adding...
                                    </>
                                ) : 'Add Tag'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Display current tags */}
            <div className="flex flex-wrap gap-2">
                {event?.tags && event.tags.length > 0 ? (
                    event.tags.map(tag => (
                        <div
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: `${tag.color}33`, // Add transparency
                                color: tag.color,
                                border: `1px solid ${tag.color}`
                            }}
                        >
                            {tag.name}
                            <button
                                onClick={() => removeTag(tag.id)}
                                className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                                aria-label={`Remove ${tag.name} tag`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No tags assigned to this event.</p>
                )}
            </div>
        </div>
    )
}
