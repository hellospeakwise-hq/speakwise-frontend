import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative w-full py-12 md:py-20 lg:py-24 overflow-hidden bg-white dark:bg-black">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-black dark:via-black dark:to-black"></div>
      
      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-orange-200 dark:bg-orange-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-30 animate-blob"></div>
      <div className="absolute top-40 left-10 w-64 h-64 bg-purple-200 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 dark:bg-pink-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="container relative px-4 md:px-6 mx-auto">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Launching Soon
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Elevate Speaker</span>
              <span className="block text-orange-500">Performance with</span>
              <span className="block">Anonymous Feedback</span>
            </h1>
            
            <p className="max-w-[600px] text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              SpeakWise connects conference attendees, speakers, and organizers in a platform that enables anonymous
              feedback, speaker portfolios, and event management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-sm px-6 py-5 shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6 py-5 border-2">
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-2xl font-bold text-orange-500">100+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Speakers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">50+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Events Hosted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">1000+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Feedbacks Shared</div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Hero Image/Illustration Container */}
            <div className="relative w-full max-w-[600px]">
              {/* Floating cards mockup */}
              <div className="relative aspect-square">
                {/* Main card */}
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
                      <div className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                      <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                    </div>
                    
                    {/* Rating stars */}
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-6 w-6 rounded bg-orange-400"></div>
                      ))}
                    </div>
                    
                    {/* Feedback items */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-orange-300"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-full bg-orange-200 dark:bg-orange-800 rounded"></div>
                          <div className="h-3 w-3/4 bg-orange-200 dark:bg-orange-800 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-purple-300"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-full bg-purple-200 dark:bg-purple-800 rounded"></div>
                          <div className="h-3 w-2/3 bg-purple-200 dark:bg-purple-800 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-xl p-4 animate-bounce">
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-xs">Rating</div>
                </div>
                
                {/* Floating badge 2 */}
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl p-4">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs">Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
