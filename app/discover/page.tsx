'use client'

import { Calendar, MapPin, Globe, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Discover Developer Conferences & CFPs
            </h1>
            <p className="text-xl text-muted-foreground">
              Never miss any event and CFP. Coming soon: events across the globe will be listed here.
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto mt-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conferences, topics, locations..." 
                  className="pl-10 h-12"
                  disabled
                />
              </div>
              <Button size="lg" disabled>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Regions</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Asia</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">18+</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Europe</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">32+</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span>North America</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">40+</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span>South America</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">9+</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Online</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">18+</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'Python', 'AI/ML', 'DevOps', 'Cloud', 'Mobile', 'Web3', 'Security'].map((topic) => (
                  <span 
                    key={topic}
                    className="px-3 py-1 bg-muted rounded-full text-xs font-medium cursor-not-allowed opacity-60"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Event Type</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                  <input type="checkbox" disabled className="rounded" />
                  <span>Conferences</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                  <input type="checkbox" disabled className="rounded" />
                  <span>Meetups</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                  <input type="checkbox" disabled className="rounded" />
                  <span>Hackathons</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
                  <input type="checkbox" disabled className="rounded" />
                  <span>Workshops</span>
                </label>
              </div>
            </Card>
          </aside>

          {/* Events List */}
          <main className="lg:col-span-3 space-y-6">
            {/* Coming Soon Message */}
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Coming Soon!</h2>
                <p className="text-muted-foreground">
                  We're building an amazing directory of developer conferences, meetups, and CFPs from around the world. 
                  Stay tuned for updates!
                </p>
                <Button size="lg" className="mt-4" disabled>
                  <Calendar className="mr-2 h-4 w-4" />
                  Notify Me When Live
                </Button>
              </div>
            </Card>

            {/* Preview Cards (Placeholder) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-primary">♥</span>
                Featured Conferences (Preview)
              </h3>
              
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 opacity-50 cursor-not-allowed">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-muted via-muted/80 to-muted/60 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="h-6 w-48 bg-muted rounded mb-2" />
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <div className="h-4 w-24 bg-muted rounded" />
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <div className="h-4 w-32 bg-muted rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-muted rounded-full text-xs">Topic</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-xs">CFP Open</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
