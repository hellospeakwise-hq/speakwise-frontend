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

            {/* Grid Layout - 3 columns on mobile, scales up on larger screens */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                {displayedSpeakers.map((speaker) => (
                    <button
                        key={speaker.id}
                        onClick={() => onSpeakerSelect(speaker)}
                        onMouseEnter={() => setHoveredSpeakerId(speaker.id)}
                        onMouseLeave={() => setHoveredSpeakerId(null)}
                        className="flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg p-2 transition-transform hover:scale-105"
                    >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200 hover:border-orange-400 transition-colors relative flex-shrink-0">
                            <img
                                src={getAvatarUrl(speaker.avatar, speaker.speaker_name || `speaker-${speaker.id}`)}
                                alt={speaker.speaker_name || `Speaker ${speaker.id}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Eye Icon Overlay */}
                            {hoveredSpeakerId === speaker.id && (
                                <div className="absolute inset-0 bg-black/40 opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-center leading-tight w-full max-w-full break-words hyphens-auto line-clamp-2">
                            {speaker.speaker_name || `Speaker ${speaker.id}`}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
