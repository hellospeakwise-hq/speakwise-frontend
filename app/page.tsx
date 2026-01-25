'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ArrowRight, TrendingUp, Users, Shield, Zap, BarChart3, Target } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { AnimatedText } from "@/components/ui/animated-text"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])
  return (
    <>
      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-background -z-10" />
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 px-4 text-center relative">
          <Link
            href="`"
            className="inline-flex items-center gap-2 rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium hover:bg-muted/80 transition-colors"
            target="_blank"
          >
            <Icons.gitHub className="h-4 w-4" />
            <span>The GitHub for Speakers</span>
          </Link>
          <AnimatedText
            staticText="Turn Speaking Into"
            animatedWords={[
              "Measurable Growth",
              "Real Impact",
              "Proven Success",
              "Career Momentum",
              "Your Superpower",
            ]}
            interval={2500}
          />
          <p className="max-w-[42rem] px-4 leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Analytics-driven feedback for speakers. Data-backed discovery for organizers.
            Build your speaking reputation with real performance data, not just social proof.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {hasMounted && isAuthenticated ? (
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg", className: "gap-2" }))}>
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/signup" className={cn(buttonVariants({ size: "lg", className: "gap-2" }))}>
                Start Growing <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="#how-it-works"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              See How It Works
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img src="/Julius.png" alt="Speaker" className="h-8 w-8 rounded-full object-cover border-2 border-background" />
                <img src="/ezi.jpeg" alt="Speaker" className="h-8 w-8 rounded-full object-cover border-2 border-background" />
                <img src="/joe.jpeg" alt="Speaker" className="h-8 w-8 rounded-full object-cover border-2 border-background" />
                <img src="/seth.jpeg" alt="Speaker" className="h-8 w-8 rounded-full object-cover border-2 border-background" />
              </div>
              <span className="whitespace-nowrap">50+ speakers</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="whitespace-nowrap">10K+ feedback points</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="container px-4 py-8 md:py-12 lg:py-24 border-t">
        <div className="mx-auto max-w-[58rem] space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              The Problem
            </h2>
            <p className="text-xl text-muted-foreground max-w-[46rem] mx-auto">
              Public speaking careers are built on word-of-mouth and social media presence,
              <span className="font-semibold text-foreground"> not real performance data</span>.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Icons.user className="h-5 w-5" />
                For Speakers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>Rarely receive structured feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>No way to track improvement over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>Building reputation relies on social media followers</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Icons.users className="h-5 w-5" />
                For Organizers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>Rely on reputation and guesswork</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>No objective way to compare speakers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>Risk booking low-quality speakers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solution - How It Works */}
      <section id="how-it-works" className="container px-4 space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            How SpeakWise Works
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            A standardized feedback and analytics layer that creates transparency for the entire speaking ecosystem.
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-8 md:max-w-[64rem]">
          {/* Step 1 */}
          <div className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-xl">Anonymous, Verified Feedback</h3>
                <p className="text-muted-foreground">
                  After each talk, attendees submit structured, anonymous feedback. Simple, fast, and frictionless
                  ensuring honest insights speakers can actually use.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">Delivery</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">Content Quality</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">Engagement</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">Actionability</span>
                </div>
              </div>
              <Shield className="h-16 w-16 text-orange-500 dark:text-white/70" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-xl">Speaker Analytics & Growth Tracking</h3>
                <p className="text-muted-foreground">
                  Speakers get aggregated analytics showing performance trends, strengths, and areas for improvement.
                  Track your growth over time  like GitHub contributions, but for speaking.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">4.8/5</div>
                    <div className="text-xs text-muted-foreground">Avg Rating</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">24</div>
                    <div className="text-xs text-muted-foreground">Total Talks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">↑ 23%</div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                </div>
              </div>
              <BarChart3 className="h-16 w-16 text-orange-500 dark:text-white/70" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-xl">Data-Driven Speaker Discovery</h3>
                <p className="text-muted-foreground">
                  Organizers search and discover speakers based on real performance data, topic expertise,
                  and audience feedback  not just follower counts. Make confident, data-backed booking decisions.
                </p>
                <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Filter by topic, rating, experience, and location</span>
                </div>
              </div>
              <Users className="h-16 w-16 text-orange-500 dark:text-white/70" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="container px-4 space-y-6 py-8 md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Why SpeakWise Wins
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Built for the modern speaking ecosystem with network effects and analytics at the core.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2 hover:border-orange-300 transition-colors">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Zap className="h-12 w-12 text-orange-500" />
              <div className="space-y-2">
                <h3 className="font-bold">Network Effects</h3>
                <p className="text-sm text-muted-foreground">
                  More talks = better data. More speakers = more value for organizers. The platform gets smarter over time.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2 hover:border-orange-300 transition-colors">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.barChart className="h-12 w-12 text-orange-500" />
              <div className="space-y-2">
                <h3 className="font-bold">Analytics-First</h3>
                <p className="text-sm text-muted-foreground">
                  Not just surveys  deep performance insights, trend analysis, and actionable growth metrics.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2 hover:border-orange-300 transition-colors">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.users className="h-12 w-12 text-orange-500" />
              <div className="space-y-2">
                <h3 className="font-bold">Built for Communities</h3>
                <p className="text-sm text-muted-foreground">
                  Designed for conferences, meetups, and tech communities  not just individual speakers.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2 hover:border-orange-300 transition-colors">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.user className="h-12 w-12 text-orange-500" />
              <div className="space-y-2">
                <h3 className="font-bold">Public Portfolios</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your speaking track record with data-backed profiles that prove your impact.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2 hover:border-orange-300 transition-colors">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.messageSquare className="h-12 w-12 text-orange-500" />
              <div className="space-y-2">
                <h3 className="font-bold">Structured Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Move beyond "great talk!" to specific, actionable insights that drive real improvement.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2 hover:border-orange-300 transition-colors">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.laptop className="h-12 w-12 text-orange-500" />
              <div className="space-y-2">
                <h3 className="font-bold">Multi-Role Support</h3>
                <p className="text-sm text-muted-foreground">
                  Seamlessly switch between speaker, organizer, and attendee roles as your career evolves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section id="user-types" className="container px-4 py-8 md:py-12 lg:py-24 bg-slate-50 dark:bg-transparent">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            For Everyone in the Ecosystem
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Speakers, organizers, and attendees all benefit from transparent, data-driven speaking evaluations.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3 w-full">
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-8 hover:border-orange-300 transition-colors">
              <Icons.mic className="h-12 w-12 text-orange-500" />
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold">Speakers</h3>
                <p className="text-sm text-muted-foreground">
                  Get honest feedback, track your growth over time, and build a data-backed reputation that gets you booked.
                </p>
                <Link href="/signup" className="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1">
                  Start as Speaker <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-8 hover:border-orange-300 transition-colors">
              <Icons.users className="h-12 w-12 text-orange-500" />
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold">Organizers</h3>
                <p className="text-sm text-muted-foreground">
                  Discover speakers with proven track records, compare performance data, and book with confidence.
                </p>
                <Link href="/signup" className="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1">
                  Start as Organizer <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-8 hover:border-orange-300 transition-colors">
              <Icons.user className="h-12 w-12 text-orange-500" />
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold">Attendees</h3>
                <p className="text-sm text-muted-foreground">
                  Share honest, anonymous feedback that helps speakers improve and makes future events better.
                </p>
                <Link href="/events" className="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1">
                  Give Feedback <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision/CTA */}
      <section className="container px-4 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
            The Future of Public Speaking
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Our vision: Become the global standard for evaluating, growing, and discovering public speakers
            creating a transparent, merit-based speaking ecosystem worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg", className: "gap-2" }))}>
              Join SpeakWise <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Learn Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
