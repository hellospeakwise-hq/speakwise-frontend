"use client"

import { useEffect, useState } from "react"
import { Speaker, getSpeakerSlug } from "@/lib/api/speakerApi"
import { Button } from "@/components/ui/button"
import { X, Users, Calendar, BadgeCheck, Plus } from "lucide-react"
import Link from "next/link"
import { getAvatarUrl } from "@/lib/utils"

interface SpeakerPreviewModalProps {
    speaker: Speaker | null
    isOpen: boolean
    onClose: () => void
}

export function SpeakerPreviewModal({ speaker, isOpen, onClose }: Readonly<SpeakerPreviewModalProps>) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!mounted || !isOpen || !speaker) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
                onClick={onClose}
                onKeyDown={(e) => e.key === 'Enter' && onClose()}
                role="button"
                tabIndex={0}
                aria-label="Close modal"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-xs pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200">
                    {/* Card Container */}
                    <div className="relative rounded-3xl overflow-hidden bg-card border shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Large Image Section */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            <img
                                src={getAvatarUrl(speaker.avatar, speaker.speaker_name || `speaker-${speaker.id}`)}
                                alt={speaker.speaker_name || `Speaker ${speaker.id}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient overlay for text readability */}
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Content Section */}
                        <div className="p-4 space-y-3">
                            {/* Name with Verified Badge */}
                            <div className="flex items-center gap-2">
                                <Link 
                                    href={`/speakers/${getSpeakerSlug(speaker)}`}
                                    className="text-lg font-bold hover:text-orange-500 transition-colors truncate"
                                >
                                    {speaker.speaker_name || `Speaker ${speaker.id}`}
                                </Link>
                                <BadgeCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                            </div>

                            {/* Bio/Description */}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {speaker.short_bio || speaker.organization || 'Professional speaker ready to inspire and educate.'}
                            </p>

                            {/* Stats and Follow Row */}
                            <div className="flex items-center justify-between pt-2">
                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium text-foreground">
                                            {speaker.skill_tags?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium text-foreground">
                                            {speaker.experiences?.length || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* View Profile Button */}
                                <Link href={`/speakers/${getSpeakerSlug(speaker)}`}>
                                    <Button 
                                        size="sm" 
                                        className="rounded-full px-4 gap-1 bg-foreground text-background hover:bg-foreground/90"
                                    >
                                        View
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Request Speaker Link */}
                            <div className="pt-1 text-center">
                                <Link 
                                    href={`/speakers/${getSpeakerSlug(speaker)}/request`}
                                    className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                                >
                                    Request This speaker →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
