"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, Search, MapPin, Briefcase, Loader2 } from "lucide-react"
import { authenticatedAPI } from "@/lib/api/authenticatedAPI"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// Type definitions
interface SpeakerProfile {
  id: number
  full_name: string
  organization: string
  short_bio: string
  long_bio: string
  country: string
  avatar: string | null
  skill_tags: Array<{
    id: number
    name: string
  }>
  social_links: Array<{
    id: number
    social_name: string
    social_url: string
    is_active: boolean
    display_order: number
  }>
}

export function SpeakersDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setLoading(true)
        // Now requires authentication
        const data = await authenticatedAPI.get('/api/speakers/', true)
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

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return '/placeholder.svg?height=200&width=200'
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath
    }
    return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`
  }

  // Filter speakers based on search query
  const filteredSpeakers = speakers.filter((speaker) =>
    speaker.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.skill_tags.some((skill) => skill.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    speaker.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.organization.toLowerCase().includes(searchQuery.toLowerCase())
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
                    src={getAvatarUrl(speaker.avatar)}
                    alt={speaker.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg?height=200&width=200'
                    }}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{speaker.full_name}</CardTitle>
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

                  {speaker.skill_tags && speaker.skill_tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {speaker.skill_tags.slice(0, 4).map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30 text-xs"
                          >
                            {skill.name}
                          </Badge>
                        ))}
                        {speaker.skill_tags.length > 4 && (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200 text-xs"
                          >
                            +{speaker.skill_tags.length - 4} more
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
