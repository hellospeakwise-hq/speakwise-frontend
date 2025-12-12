import Link from "next/link"
import { Metadata } from "next"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  title: "SpeakWise - Empowering Speakers, Organizers, and Attendees",
  description: "The all-in-one platform for managing speaking engagements, conferences, and feedback.",
}

export default function Home() {
  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Elevate Your Speaking Career with SpeakWise
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Manage speaking engagements, collect feedback, and connect with event organizers
            all in one place. Built for speakers, organizers, and attendees.
          </p>
          <div className="space-x-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Get Started
            </Link>
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            SpeakWise provides everything you need to manage your speaking career,
            organize events, and engage with audiences effectively.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.user className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Speaker Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  Create comprehensive profiles showcasing your expertise, past talks, and availability.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.calendar className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Event Management</h3>
                <p className="text-sm text-muted-foreground">
                  Organize conferences, manage speakers, and coordinate schedules seamlessly.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.messageSquare className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Feedback System</h3>
                <p className="text-sm text-muted-foreground">
                  Collect and analyze attendee feedback to continuously improve your presentations.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.barChart className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Track your performance metrics, audience engagement, and speaking trends.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.users className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Networking</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other speakers, organizers, and industry professionals.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Icons.laptop className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Multi-Role Support</h3>
                <p className="text-sm text-muted-foreground">
                  Seamlessly switch between speaker, organizer, and attendee roles.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto text-center md:max-w-[58rem]">
          <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Built with modern technologies to provide the best experience across all devices.
          </p>
        </div>
      </section>

      <section id="user-types" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Built for Everyone
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Whether you&apos;re a speaker looking to grow your career, an organizer managing events,
            or an attendee seeking great content, SpeakWise has you covered.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
              <Icons.mic className="h-12 w-12" />
              <h3 className="text-xl font-bold">Speakers</h3>
              <p className="text-center text-sm text-muted-foreground">
                Manage your talks, collect feedback, and grow your speaking career.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
              <Icons.users className="h-12 w-12" />
              <h3 className="text-xl font-bold">Organizers</h3>
              <p className="text-center text-sm text-muted-foreground">
                Plan events, manage speakers, and ensure successful conferences.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
              <Icons.user className="h-12 w-12" />
              <h3 className="text-xl font-bold">Attendees</h3>
              <p className="text-center text-sm text-muted-foreground">
                Discover talks, provide feedback, and connect with speakers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
