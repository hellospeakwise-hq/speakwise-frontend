'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CFPSubmissionsList } from './cfp-submissions-list'

interface OrganizerCFPViewProps {
    events: { id: string; slug: string; title?: string; name?: string }[]
}

export function OrganizerCFPView({ events }: OrganizerCFPViewProps) {
    const [selectedSlug, setSelectedSlug] = useState<string>('')

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <FileText className="h-10 w-10 opacity-30" />
                <p className="font-medium">No events yet</p>
                <p className="text-sm">Create an event first to receive CFP submissions.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-64">
                    <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(e => (
                                <SelectItem key={e.id} value={e.slug}>
                                    {e.title || e.name || e.slug}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedSlug ? (
                <CFPSubmissionsList eventSlug={selectedSlug} />
            ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <FileText className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Select an event to view its CFP submissions</p>
                </div>
            )}
        </div>
    )
}
