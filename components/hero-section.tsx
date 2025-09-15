import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-orange-500 text-white px-3 py-1 text-sm font-medium">
              Launching Soon
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Elevate Speaker Performance with Anonymous Feedback
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              SpeakWise connects conference attendees, speakers, and organizers in a platform that enables anonymous
              feedback, speaker portfolios, and event management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-orange-300/20 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg p-6 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                      <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-orange-500"></div>
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-orange-500"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-orange-500"></div>
                        <div className="h-4 w-2/5 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="h-8 w-1/4 bg-orange-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
