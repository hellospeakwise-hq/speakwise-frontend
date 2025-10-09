import { Users, Mic, Building } from "lucide-react"
import { Check } from "lucide-react"

export function UserTypesSection() {
  const userTypes = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "For Attendees",
      description: "Provide anonymous feedback on speakers for sessions you attended, with verified participation.",
      features: [
        "Discover events by region and country",
        "Select speakers and sessions to review",
        "Submit anonymous ratings and comments",
        "Verified attendance ensures quality feedback",
      ],
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "For Speakers",
      description:
        "Build a public profile showcasing speaking engagements, track performance metrics, and gain visibility.",
      features: [
        "Create a professional speaker portfolio",
        "Track feedback and performance metrics",
        "Analyze trends and improvements over time",
        "Increase visibility for future speaking opportunities",
      ],
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: "For Organizers",
      description: "Streamline event feedback collection and speaker performance evaluation for better events.",
      features: [
        "Create and manage events with detailed information",
        "Upload attendance lists for verification",
        "View aggregated feedback for speakers",
        "Export reports for internal use",
      ],
    },
  ]

  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-white dark:bg-black">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center space-y-3 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-gray-900 dark:text-white">
              Who SpeakWise Is For
            </h2>
            <p className="max-w-[900px] text-base text-gray-600 dark:text-gray-400">
              Our platform serves the needs of all conference stakeholders
            </p>
          </div>
        </div>

        {/* User Type Cards */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
          {userTypes.map((userType, index) => (
            <div
              key={index}
              className="group relative flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6 transition-all duration-300 hover:border-orange-500/50"
            >
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 text-white mb-5 mx-auto">
                {userType.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
                {userType.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-5 leading-relaxed">
                {userType.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2.5 flex-1">
                {userType.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-4 w-4 text-orange-500 mr-2.5 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
