'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, X } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'

interface Country {
  id: number
  name: string
  code: string
}

interface CountryFilterProps {
  selectedCountries: number[]
  onCountryChange: (countries: number[]) => void
}

export function CountryFilter({ selectedCountries, onCountryChange }: CountryFilterProps) {
  const { countries } = useEvents()

  const handleCountryToggle = (countryId: number) => {
    if (selectedCountries.includes(countryId)) {
      onCountryChange(selectedCountries.filter(id => id !== countryId))
    } else {
      onCountryChange([...selectedCountries, countryId])
    }
  }

  const handleRemoveCountry = (countryId: number) => {
    onCountryChange(selectedCountries.filter(id => id !== countryId))
  }

  const clearAllCountries = () => {
    onCountryChange([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter by Country</h3>
        {selectedCountries.length > 0 && (
          <Button 
            onClick={clearAllCountries} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between w-full">
            Select Countries
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <DropdownMenuItem
              key={country.id}
              onClick={() => handleCountryToggle(country.id)}
              className="flex items-center justify-between"
            >
              <span>{country.name}</span>
              {selectedCountries.includes(country.id) && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((countryId) => {
            const country = countries.find(c => c.id === countryId)
            return country ? (
              <Badge key={countryId} variant="secondary" className="flex items-center gap-1">
                {country.name}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleRemoveCountry(countryId)}
                />
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
