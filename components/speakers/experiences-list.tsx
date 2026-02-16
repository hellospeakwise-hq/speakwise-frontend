'use client'

import { useEffect, useState } from "react"
import { Calendar, ExternalLink, Video, Award, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { experiencesApi, type SpeakerExperience } from "@/lib/api/experiencesApi"
import { format } from "date-fns"
import { ExperienceDetailModal } from "./experience-detail-modal"

interface ExperiencesListProps {
    speakerId?: number
    speakerSlug?: string  // Use slug for public profiles
}

export function ExperiencesList({ speakerId, speakerSlug }: ExperiencesListProps) {
    const [experiences, setExperiences] = useState<SpeakerExperience[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedExperience, setSelectedExperience] = useState<SpeakerExperience | null>(null)

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                setLoading(true)
                // Use slug if provided, otherwise fall back to ID
                const data = speakerSlug 
                    ? await experiencesApi.getSpeakerExperiencesBySlug(speakerSlug)
                    : speakerId 
                    ? await experiencesApi.getSpeakerExperiences(speakerId)
                    : []
                // Sort by date, most recent first
                const sorted = data.sort((a, b) => {
                    const dateA = new Date(a.event_date).getTime()
                    const dateB = new Date(b.event_date).getTime()
                    return dateB - dateA
                })
                setExperiences(sorted)
            } catch (error) {
                console.error('Error fetching experiences:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchExperiences()
    }, [speakerId, speakerSlug])

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

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
            </div>
        )
    }

    if (experiences.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <Award className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-center">
                        No speaking experiences yet
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {experiences.map((experience) => (
                <Card 
                    key={experience.id} 
                    className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedExperience(experience)}
                >
                    <div className="flex flex-col sm:flex-row gap-0">
                        {/* Image placeholder */}
                        <div className="w-full sm:w-64 h-48 sm:h-auto bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center flex-shrink-0">
                            <div className="text-muted-foreground/40">
                                <Award className="w-16 h-16" />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="space-y-3">
                                {/* Header with event name and date */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground/80">{experience.event_name}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{formatDate(experience.event_date)}</span>
                                    </div>
                                </div>
                                
                                {/* Title */}
                                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                    {experience.topic}
                                </h3>
                                
                                {/* Description */}
                                <div
                                    className="text-sm leading-relaxed text-muted-foreground line-clamp-2"
                                    dangerouslySetInnerHTML={{
                                        __html: experience.description.length > 150
                                            ? experience.description.substring(0, 150) + '...'
                                            : experience.description
                                    }}
                                />
                            </div>
                            
                            {/* Footer with tags and arrow */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                <div className="flex flex-wrap gap-2">
                                    {experience.presentation_link && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                            <FileText className="h-3 w-3" />
                                            Slides
                                        </span>
                                    )}
                                    {experience.video_recording_link && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                            <Video className="h-3 w-3" />
                                            Recording
                                        </span>
                                    )}
                                </div>
                                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}

            {/* Experience Detail Modal */}
            {selectedExperience && (
                <ExperienceDetailModal
                    experience={selectedExperience}
                    open={!!selectedExperience}
                    onOpenChange={(open) => !open && setSelectedExperience(null)}
                />
            )}
        </div>
    )
}
