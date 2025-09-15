import { Card, CardContent } from "@/components/ui/card"
import { LogIn, Search, MapPin, Calendar, MessageSquare, BarChart } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <LogIn className="h-10 w-10 text-orange-500" />,
      title: "1. Log in to SpeakWise",
      description: "Create an account or sign in to access the platform's features.",
    },
    {
      icon: <Search className="h-10 w-10 text-orange-500" />,
      title: "2. Visit All Events",
      description: "Browse through our comprehensive list of tech conferences and events.",
    },
    {
      icon: <MapPin className="h-10 w-10 text-orange-500" />,
      title: "3. Choose Region & Country",
      description: "Filter events by geographic location to find those relevant to you.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-orange-500" />,
      title: "4. Select an Event",
      description: "Choose the specific event you attended to see all speakers and sessions.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-orange-500" />,
      title: "5. Provide Speaker Feedback",
      description: "Rate speakers on multiple criteria and leave constructive comments.",
    },
    {
      icon: <BarChart className="h-10 w-10 text-orange-500" />,
      title: "6. Track Your Contributions",
      description: "View your feedback history and the impact you've made on speakers' development.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How SpeakWise Works</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Our platform connects conference attendees, speakers, and organizers in a seamless feedback loop
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="border-orange-100 dark:border-orange-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20 shrink-0">{step.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-center">The Feedback Process</h3>

          <div className="bg-orange-50 dark:bg-orange-900/5 rounded-xl p-6 md:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-xl font-bold mb-4">Comprehensive Speaker Evaluation</h4>
                <p className="text-muted-foreground mb-4">
                  Our feedback form is designed to provide speakers with actionable insights across multiple dimensions
                  of their presentation:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-medium">Engagement</span>
                      <p className="text-sm text-muted-foreground">How well the speaker maintained audience interest</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-medium">Clarity</span>
                      <p className="text-sm text-muted-foreground">How clear and understandable the presentation was</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <span className="font-medium">Content Depth</span>
                      <p className="text-sm text-muted-foreground">The depth and quality of the material covered</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <span className="font-medium">Speaker Knowledge</span>
                      <p className="text-sm text-muted-foreground">
                        How knowledgeable the speaker seemed about the topic
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      5
                    </span>
                    <div>
                      <span className="font-medium">Practical Relevance</span>
                      <p className="text-sm text-muted-foreground">
                        How applicable the content is to real-world scenarios
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-19%20at%205.32.54%E2%80%AFAM-bbMViGFTstMjHd6mcHuOBn54w1FSvE.png"
                  alt="SpeakWise feedback form showing ratings for engagement, clarity, content depth, speaker knowledge, and practical relevance"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="max-w-[800px] mx-auto text-center mt-12">
            <h4 className="text-xl font-bold mb-4">Verified Feedback You Can Trust</h4>
            <p className="text-muted-foreground">
              SpeakWise ensures all feedback comes from actual event attendees through our verification system.
              Organizers upload attendee lists, and users must verify their attendance before providing feedback. This
              creates a trusted ecosystem where speakers can be confident that the feedback they receive is legitimate
              and valuable.
            </p>
          </div>

          <div className="max-w-[800px] mx-auto text-center mt-12">
            <h4 className="text-xl font-bold mb-4">Gift Speaker Feature - Coming Soon</h4>
            <p className="text-muted-foreground">
              Soon, SpeakWise will introduce the ability to send gifts to speakers you appreciate. This feature will
              allow attendees to show their gratitude for exceptional presentations by sending speakers digital gift
              cards, donations to charities of their choice, or other tokens of appreciation. It's another way we're
              working to create meaningful connections between speakers and their audiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
