"use client"

import { useState, useMemo } from "react"
import { CountryFilter } from "@/components/events/country-filter"
import { EventsList } from "@/components/events/events-list"
import { Input } from "@/components/ui/input"
import { Calendar, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Period = "all" | "upcoming" | "past"

export default function EventsPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<Period>("all")
  const [cfpOnly, setCfpOnly] = useState(false)

  const hasActiveFilters = selectedCountries.length > 0 || search.trim() || period !== "all" || cfpOnly

  const clearAll = () => {
    setSelectedCountries([])
    setSearch("")
    setPeriod("all")
    setCfpOnly(false)
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Discover conferences and events from around the world</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* ── Sidebar filters ── */}
          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Event name, location…"
                  className="pl-8 pr-8 h-9 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Time Period</h3>
              <div className="flex flex-col gap-1.5">
                {(["all", "upcoming", "past"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                      period === p
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-muted/40"
                    )}
                  >
                    {p === "all" ? "All Events" : p === "upcoming" ? "Upcoming" : "Past"}
                  </button>
                ))}
              </div>
            </div>

            {/* CFP Open */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Call for Proposals</h3>
              <button
                onClick={() => setCfpOnly(!cfpOnly)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                  cfpOnly
                    ? "bg-amber-500 text-white border-amber-500"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-muted/40"
                )}
              >
                <Calendar className="h-4 w-4" />
                CFP Open Only
              </button>
            </div>

            {/* Country */}
            <CountryFilter
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
            />

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 rounded-lg border border-dashed border-border hover:border-foreground/40"
              >
                <X className="h-3.5 w-3.5" />
                Clear all filters
              </button>
            )}
          </div>

          {/* ── Events list ── */}
          <EventsList
            countryFilter={selectedCountries}
            search={search}
            period={period}
            cfpOnly={cfpOnly}
          />
        </div>
      </div>
    </div>
  )
}
