'use client'

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AnimatedText } from "@/components/ui/animated-text"

const floatingProfiles = [
  { name: "Julius Boakye", role: "Tech & Innovation", img: "/Julius.png", pos: "top-[14%] left-[6%]" },
  { name: "Ezra Yendau", role: "Product Lead", img: "/ezi.jpeg", pos: "top-[28%] right-[7%]" },
  { name: "Johana A.", role: "Engineering", img: "/joe.jpeg", pos: "bottom-[22%] left-[4%]" },
  { name: "Seth K.", role: "Design", img: "/seth.jpeg", pos: "bottom-[30%] right-[5%]" },
]

const communityMembers = [
  { name: "Julius Boakye", role: "Tech & Innovation", img: "/julinew.jpg" },
  { name: "Ezra Yendau", role: "Product Strategy", img: "/ezi.jpeg" },
  { name: "Johana O. Amoateng", role: "Software Engineering", img: "/joe.jpeg" },
  { name: "Seth Mensah", role: "Software Eng.", img: "/seth.jpeg" },
  { name: "Juliana Lawson", role: "Leadership", img: "/Juliana.jpg" },
  { name: "Fred Pekyi", role: "Frontend Engineering", img: "/fred.jpeg" },
]

const steps = [
  {
    n: "01",
    title: "Build your speaker profile",
    desc: "Your topics, past talks, and speaking history all in one place. Not a LinkedIn post. An actual record.",
  },
  {
    n: "02",
    title: "Get on stage",
    desc: "Submit to events or get added by organizers. Every appearance gets verified and logged.",
  },
  {
    n: "03",
    title: "Hear what the room really thinks",
    desc: "Attendees leave structured, anonymous feedback after your talk. Honest. Specific. Useful.",
  },
  {
    n: "04",
    title: "Let the data speak for you",
    desc: "Your aggregated scores and growth trend become your reputation. No follower count required.",
  },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />

        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {floatingProfiles.map((p, i) => (
            <motion.div
              key={p.name}
              className={"absolute flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md " + p.pos}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.7, ease: "easeOut" }}
            >
              <img src={p.img} alt={p.name} className="h-9 w-9 rounded-full object-cover" />
              <div>
                <p className="text-xs font-medium text-white">{p.name}</p>
                <p className="text-[11px] text-zinc-500">{p.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedText
              staticText="Turn Speaking Into"
              animatedWords={["Growth", "Impact", "Success", "Momentum", "Power"]}
              interval={2500}
              className="text-white"
            />
          </motion.div>

          <motion.p
            className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-zinc-400"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            Real feedback from real rooms. Performance data that builds your reputation over time. A place where speaking careers are built on evidence.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {hasMounted && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <div className="flex -space-x-2.5">
              {["/Julius.png", "/ezi.jpeg", "/joe.jpeg", "/seth.jpeg"].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="speaker"
                  className="h-8 w-8 rounded-full border-2 border-zinc-950 object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              50+ speakers already building their reputation
            </p>
          </motion.div>
        </div>
      </section>

      {/* WHAT IS SPEAKWISE */}
      <section className="container px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-2 md:gap-24 md:items-center">
          <div>
            <h2 className="font-heading text-3xl leading-tight sm:text-4xl md:text-5xl">
              The speaking world runs on word-of-mouth.{" "}
              <span className="text-muted-foreground">That&apos;s the problem.</span>
            </h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Speakers rarely hear what their audience actually thought. Organizers book based on follower counts and personal referrals. There&apos;s no honest record of who&apos;s actually good and getting better.
            </p>
            <p>
              SpeakWise is a standardised feedback and analytics layer for the speaking world. Speakers get real data. Organizers get real insight. Everyone stops guessing.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Our story <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY GALLERY */}
      <section className="py-8 md:py-12">
        <div className="container px-4 mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Community</p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl max-w-lg">
            Real speakers. Real data.
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:gap-4">
          {communityMembers.map((m, i) => (
            <motion.div
              key={m.name + i}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            >
              <img
                src={m.img}
                alt={m.name}
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 translate-y-1 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-sm font-semibold text-white">{m.name}</p>
                <p className="text-xs text-zinc-300">{m.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Join the community <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-zinc-950 py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-widest text-zinc-500">How it works</p>
            <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl md:text-5xl max-w-md">
              From first talk to proven speaker
            </h2>

            <div className="mt-16 grid gap-px sm:grid-cols-2 bg-white/5 rounded-2xl overflow-hidden">
              {steps.map((step, i) => (
                <motion.div
                  key={step.n}
                  className="bg-zinc-950 p-8 md:p-10 hover:bg-zinc-900 transition-colors duration-200"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <span className="font-heading text-5xl font-bold text-white/10 leading-none select-none">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOR ORGANIZERS */}
      <section className="container px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-2 md:gap-24 md:items-center">
          <div className="space-y-5 text-muted-foreground leading-relaxed order-2 md:order-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">For organizers</p>
            <p className="text-foreground font-heading text-2xl sm:text-3xl leading-snug">
              You&apos;ve booked a speaker on vibes before. It didn&apos;t always work out.
            </p>
            <p>
              SpeakWise gives you actual performance data. Ratings across multiple events. Feedback trends. Topic expertise verified by audiences not just claimed on a profile.
            </p>
            <p>
              Find the right speaker for your event the way you&apos;d want your next hire evaluated. With evidence.
            </p>
            <Link
              href="/signup?role=organizer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Find speakers <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="order-1 md:order-2 rounded-2xl border bg-muted/30 p-8 space-y-6">
            {[
              { value: "4.8", label: "Average speaker rating across all talks" },
              { value: "10K+", label: "Individual feedback submissions collected" },
              { value: "50+", label: "Active speakers with verified track records" },
            ].map((stat) => (
              <div key={stat.label} className="border-b pb-6 last:border-0 last:pb-0">
                <p className="font-heading text-4xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-zinc-950 py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl text-white sm:text-4xl md:text-5xl">
              Your next speaking opportunity starts with your last talk&apos;s data.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-zinc-400 leading-relaxed">
              Join SpeakWise free. Build your profile. Start collecting real feedback after every talk.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
              >
                Join SpeakWise <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup?role=organizer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
              >
                I&apos;m an organizer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
