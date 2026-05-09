'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CFPSettings } from './cfp-settings'

interface OrganizerCFPSettingsViewProps {
    events: { id: string; slug: string; title?: string; name?: string }[]
}

export function OrganizerCFPSettingsView({ events }: OrganizerCFPSettingsViewProps) {
    const [selectedSlug, setSelectedSlug] = useState<string>('')

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Settings className="h-10 w-10 opacity-30" />
                <p className="font-medium">No events yet</p>
                <p className="text-sm">Create an event first to configure CFP settings.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="w-72">
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

            {selectedSlug ? (
                <CFPSettings eventSlug={selectedSlug} />
            ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Settings className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Select an event to configure its CFP settings</p>
                </div>
            )}
        </div>
    )
}
