import { MessageSquare, UserCircle, Calendar, Shield, BarChart, Globe } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-orange-500" />,
      title: "Anonymous Feedback",
      description: "Provide honest, anonymous feedback on speakers without fear of identification.",
    },
    {
      icon: <UserCircle className="h-10 w-10 text-orange-500" />,
      title: "Speaker Portfolios",
      description: "Build a public profile showcasing speaking engagements, ratings, and performance.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-orange-500" />,
      title: "Event Management",
      description: "Organize events, upload attendance lists, and collect valuable speaker feedback.",
    },
    {
      icon: <Shield className="h-10 w-10 text-orange-500" />,
      title: "Verified Attendance",
      description: "Ensure feedback comes from actual attendees with our verification system.",
    },
    {
      icon: <BarChart className="h-10 w-10 text-orange-500" />,
      title: "Performance Analytics",
      description: "Track speaker performance metrics and improvement over time.",
    },
    {
      icon: <Globe className="h-10 w-10 text-orange-500" />,
      title: "Regional Events",
      description: "Discover and filter events by region and country from around the world.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50 dark:bg-orange-900/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-orange-500 px-3 py-1 text-sm text-white">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything You Need</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              SpeakWise provides a comprehensive platform for all conference stakeholders
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm bg-white hover:shadow-lg 
                  hover:scale-105 transition-all duration-200 dark:bg-background dark:hover:shadow-2xl dark:hover:shadow-white/20"
            >
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
