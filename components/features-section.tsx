import { MessageSquare, UserCircle, Calendar, Shield, BarChart, Globe } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Anonymous Feedback",
      description: "Provide honest, anonymous feedback on speakers without fear of identification.",
    },
    {
      icon: <UserCircle className="h-6 w-6" />,
      title: "Speaker Portfolios",
      description: "Build a public profile showcasing speaking engagements, ratings, and performance.",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Event Management",
      description: "Organize events, upload attendance lists, and collect valuable speaker feedback.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Attendance",
      description: "Ensure feedback comes from actual attendees with our verification system.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track speaker performance metrics and improvement over time.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Regional Events",
      description: "Discover and filter events by region and country from around the world.",
    },
  ]

  return (
    <section className="relative w-full py-12 md:py-20 lg:py-24 bg-gray-50 dark:bg-black">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-medium text-orange-400">
              <span className="mr-1.5">✨</span> Features
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-gray-900 dark:text-white">
              <span className="block">Everything You Need to</span>
              <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Excel at Speaking</span>
            </h2>
            <p className="max-w-[700px] mx-auto text-base text-gray-600 dark:text-gray-300">
              SpeakWise provides a comprehensive platform for all conference stakeholders
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-start space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500/50 p-6 bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 group-hover:shadow-orange-500/40 transition-all duration-300">
                {feature.icon}
              </div>
              
              {/* Content */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover effect gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
