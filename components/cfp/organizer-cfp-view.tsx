'use client'

import { useState } from 'react'
import { FileText, PlayCircle } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CFPSubmissionsList } from './cfp-submissions-list'
import { CFPReviewMode } from './cfp-review-mode'

interface OrganizerCFPViewProps {
    events: { id: string; slug: string; title?: string; name?: string }[]
}

export function OrganizerCFPView({ events }: OrganizerCFPViewProps) {
    const [selectedSlug, setSelectedSlug] = useState<string>(
        events.length === 1 ? events[0].slug : ''
    )
    const [reviewMode, setReviewMode] = useState(false)

    const selectedEvent = events.find(e => e.slug === selectedSlug)
    const selectedName = selectedEvent?.title || selectedEvent?.name || selectedEvent?.slug

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <FileText className="h-9 w-9 opacity-25" />
                <p className="font-medium text-foreground text-sm">No events yet</p>
                <p className="text-sm">Create an event first to receive CFP submissions.</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-5">
                {/* Header + event selector + actions */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">CFP Submissions</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {selectedName
                                ? `Reviewing proposals for ${selectedName}`
                                : 'Select an event to review proposals'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {selectedSlug && (
                            <Button
                                size="sm"
                                onClick={() => setReviewMode(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 h-8"
                            >
                                <PlayCircle className="h-3.5 w-3.5" />
                                Start review
                            </Button>
                        )}
                        <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                            <SelectTrigger className="w-52 h-8 text-sm">
                                <SelectValue placeholder="Choose event…" />
                            </SelectTrigger>
                            <SelectContent align="end">
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
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                        <FileText className="h-9 w-9 opacity-25" />
                        <p className="text-sm">Select an event above to view its CFP submissions.</p>
                    </div>
                )}
            </div>

            {reviewMode && selectedSlug && (
                <CFPReviewMode
                    eventSlug={selectedSlug}
                    onClose={() => setReviewMode(false)}
                />
            )}
        </>
    )
}
