'use client'

import { useState } from "react"
import { eventsAPI, type Tag } from "@/lib/api/eventsApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface TagCreatorProps {
    onTagCreated?: (tag: Tag) => void
}

export function TagCreator({ onTagCreated }: TagCreatorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tagName, setTagName] = useState('')
    const [tagColor, setTagColor] = useState('#007bff')

    const createTag = async () => {
        if (!tagName.trim()) {
            setError('Tag name is required')
            return
        }

        try {
            setIsCreating(true)
            setError(null)

            // Make an API call to create a new tag
            const response = await fetch(`http://127.0.0.1:8000/api/events/tags/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: tagName.trim(),
                    color: tagColor,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Failed to create tag')
            }

            const newTag = await response.json()

            // Clear form and close dialog
            setTagName('')
            setTagColor('#007bff')
            setIsOpen(false)

            // Notify parent component
            if (onTagCreated) onTagCreated(newTag)
        } catch (err: any) {
            console.error('Error creating tag:', err)
            setError(err.message || 'Failed to create tag. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Tag
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                    <DialogDescription>
                        Create a new tag that can be assigned to events.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 text-red-800 p-2 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="tag-name">Tag Name</Label>
                        <Input
                            id="tag-name"
                            placeholder="Enter tag name"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tag-color">Tag Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tag-color"
                                type="color"
                                value={tagColor}
                                onChange={(e) => setTagColor(e.target.value)}
                                className="w-12 p-1 h-9"
                            />
                            <Input
                                value={tagColor}
                                onChange={(e) => setTagColor(e.target.value)}
                                className="flex-1"
                                placeholder="#000000"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Label>Preview</Label>
                        <div className="mt-1">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    backgroundColor: `${tagColor}33`, // Add transparency
                                    color: tagColor,
                                    border: `1px solid ${tagColor}`
                                }}
                            >
                                {tagName || 'Tag Preview'}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={createTag}
                        disabled={!tagName.trim() || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Creating...
                            </>
                        ) : 'Create Tag'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
