import { Card, CardContent } from "@/components/ui/card"
import { Target, Lightbulb, Rocket, Database, Network, TrendingUp } from "lucide-react"

export function AboutMission() {
  const values = [
    {
      icon: <Database className="h-12 w-12 text-orange-500" />,
      title: "Data Over Hype",
      description:
        "We believe speaking careers should be built on real performance data, not just social media followers. Every talk generates insights that help speakers improve and organizers make better decisions.",
    },
    {
      icon: <Network className="h-12 w-12 text-orange-500" />,
      title: "Network Effects",
      description:
        "The more talks tracked on SpeakWise, the better our insights become. More speakers mean more value for organizers. More feedback means better growth tools. Everyone wins as the network grows.",
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-orange-500" />,
      title: "Continuous Growth",
      description:
        "Public speaking is a skill that improves with structured feedback. We're dedicated to helping speakers track progress, identify strengths, and grow through data-driven insights — like GitHub contributions for speaking.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-transparent">
      <div className="container px-4 md:px-6">
        {/* The Problem & Why Now */}
        <div className="max-w-[800px] mx-auto mb-16">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 mb-4">
                The Problem
              </div>
              <h2 className="text-3xl font-bold mb-4">Speaking Careers Are Built on Guesswork</h2>
              <p className="text-muted-foreground text-lg">
                Speakers rarely receive structured feedback, making improvement difficult. Organizers rely on reputation 
                and social media presence rather than real performance data. There's no standardized way to measure 
                speaker quality or track growth over time.
              </p>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/20 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 mb-4">
                Why Now
              </div>
              <h2 className="text-3xl font-bold mb-4">The Perfect Time for Transparency</h2>
              <p className="text-muted-foreground text-lg">
                Conferences and community events are growing globally, but speaker evaluation hasn't evolved. 
                As events become more data-driven, there's increasing demand for transparency, measurable impact, 
                and merit-based speaker discovery. The tools finally exist to build this infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What We Believe</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Three core principles guide everything we build at SpeakWise.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <Card key={index} className="bg-white dark:bg-background border-orange-100 dark:border-orange-900/20 hover:border-orange-300 transition-colors">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">{value.icon}</div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Origin Story */}
        <div className="mt-16 max-w-[800px] mx-auto">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-900/20 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 mb-4">
                <Lightbulb className="h-4 w-4" />
                Our Story
              </div>
              <h2 className="text-3xl font-bold mb-4">From Speaker Frustration to Platform Vision</h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                SpeakWise was born from a simple frustration: after giving dozens of conference talks, 
                our founder realized they had almost no concrete data on what was working and what wasn't. 
                The feedback was either generic praise ("great talk!") or completely absent.
              </p>
              <p>
                Meanwhile, event organizers admitted they often booked speakers based on social media followers 
                or word-of-mouth, with no objective way to evaluate speaking quality. This seemed backwards in 
                an increasingly data-driven world.
              </p>
              <p>
                We asked: <strong className="text-foreground">What if speaking had the same kind of reputation system 
                that GitHub provides for developers?</strong> What if every talk generated structured feedback? 
                What if speakers could track their growth over time, and organizers could discover talent based on 
                real performance data?
              </p>
              <p>
                Launched in 2024, SpeakWise is building that future. We're creating the infrastructure for a 
                transparent, merit-based speaking ecosystem where growth is measurable and discovery is data-driven.
              </p>
            </div>

            {/* Vision */}
            <div className="pt-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/20 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                <Rocket className="h-4 w-4" />
                Long-Term Vision
              </div>
              <h3 className="text-2xl font-bold mb-4">The Global Standard for Speaking</h3>
              <p className="text-muted-foreground text-lg">
                Our vision is to become the global standard for evaluating, growing, and discovering public speakers  
                similar to how GitHub represents developers. We're building a transparent reputation layer that 
                rewards merit, enables growth, and creates opportunities based on real performance, not just connections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
