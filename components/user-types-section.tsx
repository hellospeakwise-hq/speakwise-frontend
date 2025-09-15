import { Users, Mic, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function UserTypesSection() {
  const userTypes = [
    {
      icon: <Users className="h-12 w-12 text-orange-500" />,
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
      icon: <Mic className="h-12 w-12 text-orange-500" />,
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
      icon: <Building className="h-12 w-12 text-orange-500" />,
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
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Who SpeakWise Is For</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform serves the needs of all conference stakeholders
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          {userTypes.map((userType, index) => (
            <Card key={index} className="flex flex-col h-full border-orange-100">
              <CardHeader className="flex flex-col items-center text-center">
                <div className="p-2 rounded-full bg-orange-100 mb-4">{userType.icon}</div>
                <CardTitle className="text-xl">{userType.title}</CardTitle>
                <CardDescription className="text-sm">{userType.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {userType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-orange-500 mr-2 shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
