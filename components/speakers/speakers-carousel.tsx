"use client"

import { useState } from "react"
import { Speaker } from "@/lib/api/speakerApi"
import { Eye } from "lucide-react"
import { getAvatarUrl } from "@/lib/utils"

interface SpeakersCarouselProps {
    speakers: Speaker[]
    onSpeakerSelect: (speaker: Speaker) => void
    filteredCount?: number
}

export function SpeakersCarousel({ speakers, onSpeakerSelect, filteredCount }: SpeakersCarouselProps) {
    const [hoveredSpeakerId, setHoveredSpeakerId] = useState<number | null>(null)

    const displayedSpeakers = filteredCount !== undefined ? speakers.slice(0, filteredCount) : speakers

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {filteredCount !== undefined ? `${filteredCount} Speaker${filteredCount !== 1 ? 's' : ''} Found` : 'Browse Speakers'}
                </h3>
            </div>

            {/* Grid (Not Carousel) */}
            <div className="flex flex-wrap gap-6 justify-start">
                {displayedSpeakers.map((speaker) => (
                    <button
                        key={speaker.id}
                        onClick={() => onSpeakerSelect(speaker)}
                        onMouseEnter={() => setHoveredSpeakerId(speaker.id)}
                        onMouseLeave={() => setHoveredSpeakerId(null)}
                        className="flex flex-col items-center gap-3 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-transform hover:scale-110"
                    >
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200 hover:border-orange-400 transition-colors relative">
                            <img
                                src={getAvatarUrl(speaker.avatar, speaker.speaker_name || `speaker-${speaker.id}`)}
                                alt={speaker.speaker_name || `Speaker ${speaker.id}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Eye Icon Overlay */}
                            {hoveredSpeakerId === speaker.id && (
                                <div className="absolute inset-0 bg-black/40 opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                                    <Eye className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-medium text-center line-clamp-2 px-1">
                            {speaker.speaker_name || `Speaker ${speaker.id}`}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
