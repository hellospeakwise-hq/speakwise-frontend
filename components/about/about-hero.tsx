import { Github, TrendingUp, Globe } from "lucide-react"

export function AboutHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-orange-50 via-background to-background dark:from-orange-950/20 dark:via-background dark:to-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-900/20 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400">
            <Github className="h-4 w-4" />
            <span>The GitHub for Speakers</span>
          </div>
          <div className="space-y-4 max-w-[800px]">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Building the Global<br />
              <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                Reputation Layer
              </span><br />
              for Public Speaking
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto">
              We're creating a transparent, data-driven ecosystem where speakers grow through structured feedback 
              and organizers discover talent based on real performance, not just social proof.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">100+</div>
              <div className="text-sm text-muted-foreground">Active Speakers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">10K+</div>
              <div className="text-sm text-muted-foreground">Feedback Points</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">15+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
