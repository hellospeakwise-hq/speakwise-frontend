import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, Award } from "lucide-react"

export function AboutMission() {
  const values = [
    {
      icon: <MessageSquare className="h-12 w-12 text-orange-500" />,
      title: "Honest Feedback",
      description:
        "We believe in the power of honest, constructive feedback to help speakers improve. Our anonymous system ensures attendees can share their genuine thoughts without hesitation.",
    },
    {
      icon: <Users className="h-12 w-12 text-orange-500" />,
      title: "Community Growth",
      description:
        "SpeakWise is built on the idea that when speakers improve, the entire tech community benefits. Better presentations lead to better knowledge sharing and stronger connections.",
    },
    {
      icon: <Award className="h-12 w-12 text-orange-500" />,
      title: "Continuous Improvement",
      description:
        "We're dedicated to helping speakers track their progress over time, identify areas for growth, and celebrate their improvements through data-driven insights.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50 dark:bg-orange-900/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Mission</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              SpeakWise was founded with a simple mission: to help conference speakers improve through structured,
              anonymous feedback while giving them tools to showcase their expertise.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="bg-white dark:bg-background border-orange-100 dark:border-orange-900/20">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">{value.icon}</div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-[800px] mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">The SpeakWise Story</h3>
          <p className="text-muted-foreground mb-4">
            SpeakWise was born from the experiences of conference speakers who wanted better feedback than the typical
            "great talk!" comments. We recognized that speakers need specific, actionable insights to improve, while
            attendees need a safe way to provide honest feedback.
          </p>
          <p className="text-muted-foreground">
            Launched in 2024, our platform has already helped hundreds of speakers refine their presentation skills and
            thousands of attendees provide meaningful feedback that makes a difference. We're committed to building a
            community where speakers can continuously grow and audiences can enjoy increasingly valuable presentations.
          </p>
        </div>
      </div>
    </section>
  )
}
