'use client'

import { useState, useEffect } from 'react'
import { useEvents } from './use-events'
import { eventsApi } from '@/lib/api/events'
import { type Country } from '@/lib/types/api'

// Simple region interface since it doesn't exist in api types
interface Region {
  id: number;
  name: string;
}

interface UseRegionsReturn {
  regions: Region[]
  loading: boolean
  error: string | null
}

export function useRegions(): UseRegionsReturn {
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    if (!eventsLoading && events.length > 0) {
      // Temporarily disabled since extractRegionsFromEvents doesn't exist
      const extractedRegions: Region[] = []
      setRegions(extractedRegions)
    }
  }, [events, eventsLoading])

  return {
    regions,
    loading: eventsLoading,
    error: eventsError
  }
}

interface UseCountriesReturn {
  countries: Country[]
  loading: boolean
  error: string | null
}

export function useCountries(): UseCountriesReturn {
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    if (!eventsLoading && events.length > 0) {
      // Temporarily disabled since extractCountriesFromEvents doesn't exist
      const extractedCountries: Country[] = []
      setCountries(extractedCountries)
    }
  }, [events, eventsLoading])

  return {
    countries,
    loading: eventsLoading,
    error: eventsError
  }
}

interface UseCountriesByRegionReturn {
  countries: Country[]
  loading: boolean
  error: string | null
}

export function useCountriesByRegion(regionId: number | null): UseCountriesByRegionReturn {
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!eventsLoading && events.length > 0) {
      if (regionId) {
        // Temporarily disabled since extractCountriesFromEvents doesn't exist
        const extractedCountries: Country[] = []
        // const extractedCountries = extractCountriesFromEvents(events).filter(
        //   (country: any) => country.region.id === regionId
        // )
        setCountries(extractedCountries)
      } else {
        setCountries([])
      }
    } else if (!regionId) {
      setCountries([])
    }
  }, [events, eventsLoading, regionId])

  return { countries, loading, error: eventsError }

  return {
    countries,
    loading: eventsLoading,
    error: eventsError
  }
}
