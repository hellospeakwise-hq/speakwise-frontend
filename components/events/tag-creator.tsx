'use client'

// Tags were removed from the Event model in the events-refactor branch.
// This component is kept as a stub to avoid breaking imports.

interface TagCreatorProps {
    onTagCreated?: (tag: { id: number; name: string }) => void
}

export function TagCreator(_props: TagCreatorProps) {
    return null
}
