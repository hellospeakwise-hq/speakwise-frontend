"use client"

import { useEffect, useState } from "react"
import { Speaker } from "@/lib/api/speakerApi"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MapPin } from "lucide-react"
import Link from "next/link"
import { getAvatarUrl } from "@/lib/utils"

interface SpeakerPreviewModalProps {
    speaker: Speaker | null
    isOpen: boolean
    onClose: () => void
}

export function SpeakerPreviewModal({ speaker, isOpen, onClose }: SpeakerPreviewModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !isOpen || !speaker) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <Card className="w-full max-w-sm bg-white dark:bg-slate-950 pointer-events-auto shadow-xl relative">
                    {/* Close Button */}
                    <div className="absolute right-4 top-4 z-10">
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <CardContent className="pt-6 space-y-4">
                        {/* Avatar */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200">
                                <img
                                    src={getAvatarUrl(speaker.avatar, speaker.speaker_name || speaker.email || `speaker-${speaker.id}`)}
                                    alt={speaker.speaker_name || `Speaker ${speaker.id}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Speaker Info */}
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold">
                                {speaker.speaker_name || `Speaker ${speaker.id}`}
                            </h3>
                            <p className="text-sm text-orange-600 font-medium">
                                {speaker.organization || 'Independent Speaker'}
                            </p>
                        </div>

                        {/* Location */}
                        {speaker.country && (
                            <div className="flex items-center justify-center text-sm text-muted-foreground gap-1">
                                <MapPin className="h-4 w-4 text-orange-500" />
                                {speaker.country}
                            </div>
                        )}

                        {/* Bio */}
                        {speaker.short_bio && (
                            <p className="text-sm text-muted-foreground text-center">
                                {speaker.short_bio}
                            </p>
                        )}

                        {/* Skills */}
                        {speaker.skill_tag && speaker.skill_tag.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center uppercase">
                                    Expertise
                                </h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {speaker.skill_tag.slice(0, 5).map((skill) => (
                                        <Badge
                                            key={skill.id}
                                            variant="outline"
                                            className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30 text-xs"
                                        >
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Link href={`/speakers/${speaker.id}`} className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full hover:bg-gray-100 dark:hover:bg-slate-800"
                                >
                                    View Profile
                                </Button>
                            </Link>
                            <Link href={`/speakers/${speaker.id}/request`} className="flex-1">
                                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                                    Request Speaker
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
