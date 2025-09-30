"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, Search, MapPin, Briefcase, Loader2 } from "lucide-react"
import { speakerApi, type Speaker } from "@/lib/api/speakerApi"

// Type definitions will use Speaker from speakersApi

export function SpeakersDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    // Helper function to get avatar URL (already full URLs from API)
  const getAvatarUrl = (avatarPath: string | null) => {
    return avatarPath || "/placeholder.svg"
  }

  // Filter speakers based on search query
  const filteredSpeakers = speakers.filter((speaker) =>
    (speaker.speaker_name || `Speaker ${speaker.id}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
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
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Speakers Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map((speaker) => (
            <Card key={speaker.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-200">
                  <img
                    src={getAvatarUrl(speaker.avatar || null)}
                    alt={speaker.speaker_name || `Speaker ${speaker.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg?height=200&width=200'
                    }}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{speaker.speaker_name || `Speaker ${speaker.id}`}</CardTitle>
                  <CardDescription className="text-sm">
                    {speaker.organization || 'Independent Speaker'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  {speaker.country && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                      {speaker.country}
                    </div>
                  )}

                  {speaker.short_bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {speaker.short_bio}
                    </p>
                  )}

                  {speaker.skill_tag && speaker.skill_tag.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {speaker.skill_tag.slice(0, 4).map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30 text-xs"
                          >
                            {skill.name}
                          </Badge>
                        ))}
                        {speaker.skill_tag.length > 4 && (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200 text-xs"
                          >
                            +{speaker.skill_tag.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/speakers/${speaker.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                  >
                    View Profile
                  </Button>
                </Link>
                <Link href={`/speakers/${speaker.id}/request`} className="flex-1">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Request Speaker
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && filteredSpeakers.length === 0 && speakers.length > 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No speakers found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && speakers.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No speakers available</h3>
          <p className="text-muted-foreground mt-1">Check back later for speaker profiles</p>
        </div>
      )}
    </div>
  )
}
