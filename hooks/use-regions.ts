'use client'

import { useState, useEffect } from 'react'
import { useEvents } from './use-events'
import { extractRegionsFromEvents, extractCountriesFromEvents, type Region, type Country } from '@/lib/api/events'

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
      const extractedRegions = extractRegionsFromEvents(events)
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
      const extractedCountries = extractCountriesFromEvents(events)
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

  useEffect(() => {
    if (!eventsLoading && events.length > 0) {
      if (regionId) {
        const extractedCountries = extractCountriesFromEvents(events).filter(
          country => country.region.id === regionId
        )
        setCountries(extractedCountries)
      } else {
        setCountries([])
      }
    } else if (!regionId) {
      setCountries([])
    }
  }, [events, eventsLoading, regionId])

  return {
    countries,
    loading: eventsLoading,
    error: eventsError
  }
}
