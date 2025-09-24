'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Tag as TagIcon } from "lucide-react"
import { useEvents } from "@/hooks/use-events"

interface TagFilterProps {
    onTagChange: (tagId: number | null) => void
}

export function TagFilter({ onTagChange }: TagFilterProps) {
    const { tags, loading, error } = useEvents()
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null)

    const handleTagClick = (tagId: number) => {
        const newSelectedId = selectedTagId === tagId ? null : tagId
        setSelectedTagId(newSelectedId)
        onTagChange(newSelectedId)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    Filter by Tag
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : error ? (
                    <div className="text-sm text-red-500">{error}</div>
                ) : tags.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No tags available</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => handleTagClick(tag.id)}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${selectedTagId === tag.id ? 'ring-2 ring-offset-1' : ''
                                    }`}
                                style={{
                                    backgroundColor: selectedTagId === tag.id ? tag.color : `${tag.color}33`,
                                    color: selectedTagId === tag.id ? '#ffffff' : tag.color,
                                    border: `1px solid ${tag.color}`
                                }}
                            >
                                {tag.name}
                            </button>
                        ))}

                        {selectedTagId !== null && (
                            <button
                                onClick={() => {
                                    setSelectedTagId(null)
                                    onTagChange(null)
                                }}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
