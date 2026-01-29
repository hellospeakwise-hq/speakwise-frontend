import { LogIn, Search, MapPin, Calendar, MessageSquare, BarChart } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <LogIn className="h-10 w-10" />,
      title: "1. Log in to SpeakWise",
      description: "Create an account or sign in to access the platform's features.",
    },
    {
      icon: <Search className="h-10 w-10" />,
      title: "2. Visit All Events",
      description: "Browse through our comprehensive list of tech conferences and events.",
    },
    {
      icon: <MapPin className="h-10 w-10" />,
      title: "3. Choose Region & Country",
      description: "Filter events by geographic location to find those relevant to you.",
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "4. Select an Event",
      description: "Choose the specific event you attended to see all speakers and sessions.",
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "5. Provide Speaker Feedback",
      description: "Rate speakers on multiple criteria and leave constructive comments.",
    },
    {
      icon: <BarChart className="h-10 w-10" />,
      title: "6. Track Your Contributions",
      description: "View your feedback history and the impact you've made on speakers' development.",
    },
  ]

  return (
    <section className="container px-4 space-y-6 py-8 md:py-12 lg:py-24 border-t">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          How SpeakWise Works
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our platform connects conference attendees, speakers, and organizers in a seamless feedback loop
        </p>
      </div>

      <div className="mx-auto grid justify-center gap-6 md:max-w-[64rem]">
        {steps.map((step, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">{step.icon}</div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-xl">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8 mt-12">
        <h3 className="text-2xl font-bold text-center">The Feedback Process</h3>

        <div className="rounded-lg border bg-muted/50 p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-xl font-bold mb-4">Comprehensive Speaker Evaluation</h4>
              <p className="text-muted-foreground mb-4">
                Our feedback form is designed to provide speakers with actionable insights across multiple dimensions
                of their presentation:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="bg-muted text-foreground rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5 text-xs font-medium">
                    1
                  </span>
                  <div>
                    <span className="font-medium">Engagement</span>
                    <p className="text-sm text-muted-foreground">How well the speaker maintained audience interest</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-muted text-foreground rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5 text-xs font-medium">
                    2
                  </span>
                  <div>
                    <span className="font-medium">Clarity</span>
                    <p className="text-sm text-muted-foreground">How clear and understandable the presentation was</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-muted text-foreground rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5 text-xs font-medium">
                    3
                  </span>
                  <div>
                    <span className="font-medium">Content Depth</span>
                    <p className="text-sm text-muted-foreground">The depth and quality of the material covered</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-muted text-foreground rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5 text-xs font-medium">
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
                  <span className="bg-muted text-foreground rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0 mt-0.5 text-xs font-medium">
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

            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900/20 to-orange-900/30 dark:from-slate-950 dark:via-purple-950/40 dark:to-orange-950/50">
              {/* Stars Background */}
              <div className="absolute inset-0">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      opacity: Math.random() * 0.7 + 0.3
                    }}
                  ></div>
                ))}
              </div>
              
              {/* 3D Rocket */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative transform hover:scale-110 transition-transform duration-500">
                  {/* Rocket Body */}
                  <div className="relative z-10">
                    {/* Rocket Tip */}
                    <div className="w-0 h-0 mx-auto border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[40px] border-b-red-500"></div>
                    
                    {/* Main Body */}
                    <div className="w-[60px] h-[120px] bg-gradient-to-r from-gray-300 via-white to-gray-300 dark:from-gray-600 dark:via-gray-400 dark:to-gray-600 relative shadow-2xl">
                      {/* Window */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 border-4 border-gray-400"></div>
                      
                      {/* Details */}
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-10 h-1 bg-orange-500"></div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-10 h-1 bg-orange-500"></div>
                    </div>
                    
                    {/* Wings */}
                    <div className="absolute bottom-0 -left-6 w-0 h-0 border-t-[40px] border-t-red-600 border-r-[24px] border-r-transparent"></div>
                    <div className="absolute bottom-0 -right-6 w-0 h-0 border-t-[40px] border-t-red-600 border-l-[24px] border-l-transparent"></div>
                  </div>
                  
                  {/* Fire/Exhaust */}
                  <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-16 z-0">
                    {/* Main Flame */}
                    <div className="relative animate-bounce">
                      <div className="w-0 h-0 mx-auto border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-t-[60px] border-t-orange-500 animate-pulse"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[50px] border-t-yellow-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[40px] border-t-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    
                    {/* Smoke/Trail */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
                      <div className="w-6 h-6 rounded-full bg-gray-400 animate-ping"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-500 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-10 h-10 rounded-full bg-gray-600 animate-ping" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                  </div>
                  
                  {/* Growth Metrics - Floating */}
                  <div className="absolute -right-20 top-10 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border animate-pulse">
                    <div className="text-2xl font-bold text-green-500">↑ 156%</div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                  
                  <div className="absolute -left-24 top-32 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <div className="text-2xl font-bold text-orange-500">4.8★</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/30 rounded-full blur-3xl"></div>
            </div>
          </div>

          <div className="max-w-[800px] mx-auto text-center mt-12 border-t pt-8">
            <h4 className="text-xl font-bold mb-4">Verified Feedback You Can Trust</h4>
            <p className="text-muted-foreground">
              SpeakWise ensures all feedback comes from actual event attendees through our verification system.
              Organizers upload attendee lists, and users must verify their attendance before providing feedback. This
              creates a trusted ecosystem where speakers can be confident that the feedback they receive is legitimate
              and valuable.
            </p>
          </div>

          <div className="max-w-[800px] mx-auto text-center mt-12 border-t pt-8">
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
