"use client"

import { useState } from "react"
import { useEvents } from "@/hooks/use-events"

interface RegionFilterProps {
  onRegionChange?: (regionId: number | null) => void
  onCountryChange?: (countryId: number | null) => void
}

export function RegionFilter({ onRegionChange, onCountryChange }: RegionFilterProps) {
  const { countries, loading } = useEvents()
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)

  // Extract unique regions from countries (commented out since region doesn't exist in Country type)
  const regions: any[] = []
  // const regions = Array.from(
  //   new Map(countries.map(country => [country.region?.id, country.region])).values()
  // ).filter(Boolean)

  // Filter countries by selected region
  const filteredCountries: any[] = []
  // const filteredCountries = selectedRegion
  //   ? countries.filter(country => country.region.id === selectedRegion)
  //   : []

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegion(regionId)
    setSelectedCountry(null) // Reset country when region changes
    onRegionChange?.(regionId)
    onCountryChange?.(null)
  }

  const handleCountryChange = (countryId: number | null) => {
    setSelectedCountry(countryId)
    onCountryChange?.(countryId)
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Filter Events</h3>
        <p className="text-sm text-muted-foreground">Filter events by region and country</p>
      </div>
      <div className="p-6 pt-0 space-y-4">
        {/* Region Filter */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="region-select"
          >
            Region
          </label>
          <select
            id="region-select"
            value={selectedRegion || ''}
            onChange={(e) => handleRegionChange(e.target.value ? parseInt(e.target.value) : null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Country Filter */}
        {selectedRegion && (
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="country-select"
            >
              Country
            </label>
            <select
              id="country-select"
              value={selectedCountry || ''}
              onChange={(e) => handleCountryChange(e.target.value ? parseInt(e.target.value) : null)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              <option value="">All Countries</option>
              {filteredCountries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Actions */}
        {(selectedRegion || selectedCountry) && (
          <button
            onClick={() => {
              handleRegionChange(null)
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}