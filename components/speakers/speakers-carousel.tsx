"use client"

import { useState, useRef, useEffect } from "react"
import { Speaker } from "@/lib/api/speakerApi"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface SpeakersCarouselProps {
    speakers: Speaker[]
    onSpeakerSelect: (speaker: Speaker) => void
    filteredCount?: number
}

export function SpeakersCarousel({ speakers, onSpeakerSelect, filteredCount }: SpeakersCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const [hoveredSpeakerId, setHoveredSpeakerId] = useState<number | null>(null)

    const checkScroll = () => {
        if (!scrollContainerRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }

    useEffect(() => {
        checkScroll()
        const container = scrollContainerRef.current
        if (container) {
            container.addEventListener('scroll', checkScroll)
            window.addEventListener('resize', checkScroll)
            return () => {
                container.removeEventListener('scroll', checkScroll)
                window.removeEventListener('resize', checkScroll)
            }
        }
    }, [])

    useEffect(() => {
        checkScroll()
    }, [speakers])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return
        const scrollAmount = 120
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    const displayedSpeakers = filteredCount !== undefined ? speakers.slice(0, filteredCount) : speakers

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {filteredCount !== undefined ? `${filteredCount} Speaker${filteredCount !== 1 ? 's' : ''} Found` : 'Browse Speakers'}
                </h3>
            </div>

            <div className="relative group">
                {/* Left Scroll Button */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}

                {/* Carousel Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-4 px-4 md:-mx-6 md:px-6"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {displayedSpeakers.map((speaker) => (
                        <button
                            key={speaker.id}
                            onClick={() => onSpeakerSelect(speaker)}
                            onMouseEnter={() => setHoveredSpeakerId(speaker.id)}
                            onMouseLeave={() => setHoveredSpeakerId(null)}
                            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-transform hover:scale-110 group"
                        >
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200 hover:border-orange-400 transition-colors relative">
                                <img
                                    src={speaker.avatar || '/placeholder.svg'}
                                    alt={speaker.speaker_name || `Speaker ${speaker.id}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg?height=200&width=200'
                                    }}
                                />
                                {/* Eye Icon Overlay */}
                                {hoveredSpeakerId === speaker.id && (
                                    <div className="absolute inset-0 bg-black/40 opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                                        <Eye className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs font-medium text-center mt-2 line-clamp-2 px-1">
                                {speaker.speaker_name || `Speaker ${speaker.id}`}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Right Scroll Button */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
