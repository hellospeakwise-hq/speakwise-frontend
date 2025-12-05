'use client'

import { useEffect, useState } from "react"
import { Calendar, ExternalLink, Video, Award } from "lucide-react"
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
    speakerId: number
}

export function ExperiencesList({ speakerId }: ExperiencesListProps) {
    const [experiences, setExperiences] = useState<SpeakerExperience[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedExperience, setSelectedExperience] = useState<SpeakerExperience | null>(null)

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                setLoading(true)
                const data = await experiencesApi.getSpeakerExperiences(speakerId)
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
    }, [speakerId])

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
                <Card key={experience.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-lg">{experience.topic}</CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-2 text-sm">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(experience.event_date)} • {experience.event_name}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Truncated description - strip HTML and limit characters */}
                        <div className="text-sm text-muted-foreground line-clamp-3">
                            <div dangerouslySetInnerHTML={{
                                __html: experience.description.substring(0, 200) + (experience.description.length > 200 ? '...' : '')
                            }} />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedExperience(experience)}
                                className="text-xs h-8"
                            >
                                Read More
                            </Button>

                            {experience.presentation_link && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="text-xs h-8"
                                >
                                    <a
                                        href={experience.presentation_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-1.5 h-3 w-3" />
                                        View Slides
                                    </a>
                                </Button>
                            )}
                            {experience.video_recording_link && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="text-xs h-8"
                                >
                                    <a
                                        href={experience.video_recording_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Video className="mr-1.5 h-3 w-3" />
                                        Watch Talk
                                    </a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Detail Modal */}
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
