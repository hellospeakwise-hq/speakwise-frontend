"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"
import { SpeakersCarousel } from "./speakers-carousel"
import { SpeakerPreviewModal } from "./speaker-preview-modal"

export function SpeakersDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setLoading(true)
        const data = await speakerApi.getSpeakers()
        setSpeakers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch speakers')
        console.error('Error fetching speakers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpeakers()
  }, [])

  const handleSpeakerSelect = (speaker: Speaker) => {
    setSelectedSpeaker(speaker)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedSpeaker(null), 300)
  }

  // Filter speakers based on search query
  const filteredSpeakers = speakers.filter((speaker) =>
    (speaker.speaker_name || `Speaker ${speaker.id}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, expertise, location, or organization..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-muted-foreground">Loading speakers...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800">Error Loading Speakers</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Carousel View */}
      {!loading && !error && (
        <>
          <SpeakersCarousel
            speakers={filteredSpeakers}
            onSpeakerSelect={handleSpeakerSelect}
            filteredCount={filteredSpeakers.length}
          />

          {/* Empty State */}
          {speakers.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No speakers available</h3>
              <p className="text-muted-foreground mt-1">Check back later for speaker profiles</p>
            </div>
          )}

          {/* No Results State */}
          {filteredSpeakers.length === 0 && speakers.length > 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No speakers found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </>
      )}

      {/* Speaker Preview Modal */}
      <SpeakerPreviewModal
        speaker={selectedSpeaker}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
