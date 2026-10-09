'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, QrCode, MessageSquare, TrendingUp, Star, Users, BarChart3, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { AnimatedText } from "@/components/ui/animated-text"

const floatingProfiles = [
  { name: "Julius Boakye", role: "Software Engineer", img: "/Julius.png", pos: "top-[14%] left-[6%]" },
  { name: "Ezra Yendau", role: "CTO/Backend Engineer", img: "/ezra.jpg", pos: "top-[28%] right-[7%]" },
  { name: "Johana A.", role: "Backend Engineer", img: "/joe.jpeg", pos: "bottom-[22%] left-[4%]" },
  { name: "Seth K.", role: "Backend Engineer", img: "/seth.jpeg", pos: "bottom-[30%] right-[5%]" },
]

const communityMembers = [
  { name: "Julius Boakye", role: "Software Engineer", img: "/julinew.jpg" },
  { name: "Ezra Yendau", role: "CTO/Backend Engineer", img: "/ezra.jpg" },
  { name: "Johana O. Amoateng", role: "Software Engineering", img: "/joe.jpeg" },
  { name: "Seth Mensah", role: "Software Eng.", img: "/seth.jpeg" },
  { name: "Juliana Lawson", role: "Leadership", img: "/Juliana.jpg" },
  { name: "Fred Pekyi", role: "Frontend Engineering", img: "/fred.jpeg" },
]

const steps = [
  {
    n: "01",
    title: "Build your speaker profile",
    desc: "Your topics, past talks, and speaking history all in one place. Not a LinkedIn post an actual verified record that compounds with every talk you give.",
  },
  {
    n: "02",
    title: "Add your QR code to your slides",
    desc: "Generate a unique QR code for your talk. Drop it on your final slide. Attendees scan it and leave structured feedback in under 60 seconds — while your voice is still fresh in their heads.",
  },
  {
    n: "03",
    title: "Get instant, honest feedback",
    desc: "Ratings flow in anonymously and in real time. No waiting for a survey email nobody opens. You see what the room actually thought — clarity, delivery, relevance — broken down by category.",
  },
  {
    n: "04",
    title: "Shape and grow over time",
    desc: "Your aggregated scores, feedback trends, and topic strength build a performance record. See what's improving, what needs work, and watch your reputation compound with every stage you take.",
  },
]

const qrSteps = [
  {
    icon: QrCode,
    step: "1",
    title: "Add the QR to your last slide",
    desc: "Generate your unique event QR code in seconds. Paste it on your closing slide. That's it.",
  },
  {
    icon: MessageSquare,
    step: "2",
    title: "Attendees scan and respond",
    desc: "While the applause is still going, the room pulls out their phones. Structured, anonymous feedback done in under a minute. No account needed.",
  },
  {
    icon: TrendingUp,
    step: "3",
    title: "Your data shapes your growth",
    desc: "Delivery scores, content clarity, audience engagement all tracked and trended across every talk you give.",
  },
]

const speakerBenefits = [
  {
    icon: Star,
    title: "Know where you actually stand",
    desc: "Stop guessing what the audience thought. Get rated on delivery, clarity, relevance, and energyfrom the people who were in the room.",
  },
  {
    icon: TrendingUp,
    title: "See yourself improve in real time",
    desc: "Your performance score tracks across talks. Compare your last 5 events. Watch specific skills get sharper as you put in the reps.",
  },
  {
    icon: Users,
    title: "A profile that speaks before you do",
    desc: "Send your SpeakWise link to any organizer. They see your verified track record, real ratings, and real feedback not a bio you wrote about yourself.",
  },
  {
    icon: BarChart3,
    title: "Understand your best topics",
    desc: "Some topics land better than others. SpeakWise shows you which subject areas score highest with your audience so you can double down on what works.",
  },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [hasMounted, setHasMounted] = useState(false)
  const prefersReducedMotion = useReducedMotion()

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
              className={"absolute flex items-center gap-2.5 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 " + p.pos}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 + i * 0.15, duration: 0.7, ease: "easeOut" }}
            >
              <Image src={p.img} alt={p.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
              <div>
                <p className="text-xs font-medium text-white">{p.name}</p>
                <p className="text-[11px] text-zinc-500">{p.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
          >
            <AnimatedText
              staticText="Turn Speaking Into"
              animatedWords={["Growth", "Impact", "Success", "Momentum", "Power"]}
              interval={2500}
              className="text-white"
            />
          </motion.div>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-zinc-400"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.15, duration: 0.6 }}
          >
            Add a QR code to your slides. Get instant feedback from every room. Watch your scores improve over time. Build the kind of reputation no bio can fake.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.25, duration: 0.6 }}
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
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.45, duration: 0.6 }}
          >
            <div className="flex -space-x-2.5">
              {["/Julius.png", "/ezi.jpeg", "/joe.jpeg", "/seth.jpeg"].map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-zinc-950 object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              A home for your speaking track record
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
              You finish a talk. The audience claps. You walk off stage. And that&apos;s it no one tells you what landed, what missed, or whether you were good or just politely received.
            </p>
            <p>
              Organizers aren&apos;t doing much better, booking speakers based on follower counts and favors, with no honest record of who&apos;s actually good and getting better.
            </p>
            <p>
              SpeakWise fixes this. Structured feedback from real attendees, performance analytics that compound, and a speaker profile that earns its credibility talk by talk.
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

      {/* QR CODE FLOW SECTION */}
      <section className="bg-zinc-950 py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-zinc-500">How feedback works</p>
              <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl md:text-5xl">
                One QR code at the end of your slides.{" "}
                <span className="text-zinc-500">That&apos;s all it takes.</span>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed max-w-xl">
                No survey emails. No waiting days for results. No feedback forms nobody fills in. Attendees scan while you&apos;re still on stage and you see the data within minutes.
              </p>
            </div>

            <div className="grid gap-px sm:grid-cols-3 bg-white/5 rounded-2xl overflow-hidden">
              {qrSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  className="bg-zinc-950 p-8 md:p-10 hover:bg-zinc-900 transition-colors duration-200"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-heading text-4xl font-bold text-white/10 leading-none select-none">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Attendees don&apos;t need an account.
                </p>
                <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                  They scan, they rate, they&apos;re done. No sign-ups. No friction. Just honest feedback that lands in your dashboard instantly.
                </p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2">
                <Zap className="h-4 w-4 text-zinc-500" />
                <span className="text-xs text-zinc-600">Under 60 seconds</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">For speakers</p>
            <h2 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl max-w-md">
              From first talk to proven speaker
            </h2>

            <div className="mt-16 grid gap-px sm:grid-cols-2 bg-border rounded-2xl overflow-hidden">
              {steps.map((step, i) => (
                <motion.div
                  key={step.n}
                  className="bg-background p-8 md:p-10 hover:bg-muted/30 transition-colors duration-200"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <span className="font-heading text-5xl font-bold text-foreground/10 leading-none select-none">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHAPE AND GROW */}
      <section className="bg-zinc-950 py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Shape and grow</p>
              <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl md:text-5xl">
                Data that helps you get better,{" "}
                <span className="text-zinc-500">not just feel better.</span>
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed max-w-xl">
                SpeakWise doesn&apos;t just collect ratings — it builds a picture of how you perform over time. Where you&apos;re strong. Where you&apos;re improving. What your audiences consistently respond to.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {speakerBenefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:bg-white/[0.06] transition-colors duration-200"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-5">
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY GALLERY */}
      <section className="py-20 md:py-28">
        <div className="container px-4 mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Community</p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl max-w-lg">
            Real speakers. Real data.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground text-[15px] leading-relaxed">
            Every profile on SpeakWise is built on actual talks, actual feedback, and actual performance — not on follower counts or self-written bios.
          </p>
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
              <Image
                src={m.img}
                alt={m.name}
                fill
                sizes="(max-width: 640px) 50vw, 320px"
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

      {/* FOR ORGANIZERS */}
      <section className="container px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-2 md:gap-24 md:items-center">
          <div className="space-y-5 text-muted-foreground leading-relaxed order-2 md:order-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">For organizers</p>
            <p className="text-foreground font-heading text-2xl sm:text-3xl leading-snug">
              Stop booking speakers on vibes. Start booking on evidence.
            </p>
            <p>
              Every speaker on SpeakWise has a verifiable track record — real ratings from real audiences across multiple events. You can see who consistently scores well, which topics they&apos;re strongest on, and how they&apos;ve improved over time.
            </p>
            <p>
              No more cold outreach based on a Twitter bio. No more post-event regret. Find the right speaker for your event the way you&apos;d want your next hire evaluated — with data.
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
              Add your QR code. Collect real feedback. Watch your scores grow. Build a reputation that opens doors — without needing a huge following to back it up.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
              >
                Start collecting feedback <ArrowRight className="h-4 w-4" />
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
