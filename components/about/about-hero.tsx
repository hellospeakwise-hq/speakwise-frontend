import { Github, TrendingUp, Globe } from "lucide-react"

export function AboutHero() {
  return (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-background -z-10" />
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 px-4 text-center relative">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium hover:bg-muted/80 transition-colors">
          <Github className="h-4 w-4" />
          <span>The GitHub for Speakers</span>
        </div>
        <div className="space-y-4 max-w-[800px]">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Building the Global Reputation Layer for Public Speaking
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto">
            We're creating a transparent, data-driven ecosystem where speakers grow through structured feedback 
            and organizers discover talent based on real performance, not just social proof.
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="whitespace-nowrap">100+ active speakers</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="whitespace-nowrap">10K+ feedback points</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="whitespace-nowrap">15+ countries</span>
          </div>
        </div>
      </div>
    </section>
  )
}
