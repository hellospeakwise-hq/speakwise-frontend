'use client'

import { Calendar, ExternalLink, Video, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { type SpeakerExperience } from "@/lib/api/experiencesApi"
import { format } from "date-fns"

interface ExperienceDetailModalProps {
    experience: SpeakerExperience
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ExperienceDetailModal({ experience, open, onOpenChange }: ExperienceDetailModalProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return dateString
            }
            return format(date, 'MMM dd, yyyy')
        } catch (error) {
            return dateString
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl pr-8">{experience.topic}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Event Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(experience.event_date)} • {experience.event_name}</span>
                    </div>

                    {/* Description with HTML rendering */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">About this Talk</h3>
                        <div
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: experience.description }}
                        />
                    </div>

                    {/* Links */}
                    {(experience.presentation_link || experience.video_recording_link) && (
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="font-semibold">Resources</h3>
                            <div className="flex flex-wrap gap-3">
                                {experience.presentation_link && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={experience.presentation_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            View Slides
                                        </a>
                                    </Button>
                                )}
                                {experience.video_recording_link && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={experience.video_recording_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <Video className="h-4 w-4" />
                                            Watch Talk
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
