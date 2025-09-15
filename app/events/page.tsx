"use client"

import { useState } from "react"
import { RegionFilter } from "@/components/events/region-filter"
import { TagFilter } from "@/components/events/tag-filter"
import { EventsList } from "@/components/events/events-list"

export default function EventsPage() {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<number | null>(null)

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Discover conferences and events from around the world</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          <div className="space-y-6">
            <RegionFilter
              onRegionChange={setSelectedRegion}
              onCountryChange={setSelectedCountry}
            />
            <TagFilter
              onTagChange={setSelectedTag}
            />
          </div>
          <EventsList
            regionFilter={selectedRegion}
            countryFilter={selectedCountry}
            tagFilter={selectedTag}
          />
        </div>
      </div>
    </div>
  )
}
