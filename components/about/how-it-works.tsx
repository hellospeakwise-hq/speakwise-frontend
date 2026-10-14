import { QrCode, Star, LineChart, CalendarPlus, Users, Bell } from "lucide-react"

const flows = [
  {
    audience: "Attendees",
    summary: "Give a speaker honest feedback in under a minute. No account needed.",
    steps: [
      {
        icon: <QrCode className="h-5 w-5" />,
        title: "Scan the QR code or open the link",
        description: "Speakers share a QR code or link for each talk, so you land straight on that talk's feedback form.",
      },
      {
        icon: <Star className="h-5 w-5" />,
        title: "Rate the talk",
        description: "Score the talk from 1 to 10 on the criteria below and add an optional comment and name.",
      },
    ],
  },
  {
    audience: "Speakers",
    summary: "Turn every talk into data you can learn from.",
    steps: [
      {
        icon: <Users className="h-5 w-5" />,
        title: "Build your profile",
        description: "Create an account, set up your speaker profile and add your talks and speaking experience.",
      },
      {
        icon: <QrCode className="h-5 w-5" />,
        title: "Share your feedback link",
        description: "Generate a QR code or link for each talk and show it at the end of your session.",
      },
      {
        icon: <LineChart className="h-5 w-5" />,
        title: "Track your growth",
        description: "Follow your ratings and feedback trends over time, talk by talk.",
      },
    ],
  },
  {
    audience: "Organizers",
    summary: "List your events and find speakers.",
    steps: [
      {
        icon: <CalendarPlus className="h-5 w-5" />,
        title: "Register your organization",
        description: "Create an organization account. Our team reviews it, and you get an email once it's approved.",
      },
      {
        icon: <Bell className="h-5 w-5" />,
        title: "Publish events and a CFP link",
        description: "Add your events. If your call for proposals is open, link to where speakers should submit.",
      },
    ],
  },
]

const criteria = [
  { name: "Overall", description: "Your overall impression of the talk" },
  { name: "Engagement", description: "How well the speaker kept the audience's interest" },
  { name: "Clarity", description: "How clear and understandable the presentation was" },
  { name: "Content depth", description: "The depth and quality of the material covered" },
  { name: "Speaker knowledge", description: "How knowledgeable the speaker seemed about the topic" },
  { name: "Practical relevance", description: "How applicable the content is to real-world work" },
]

export function HowItWorks() {
  return (
    <section className="container px-4 space-y-6 py-8 md:py-12 lg:py-24 border-t">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">How SpeakWise Works</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Attendees, speakers and organizers all take part in one feedback loop.
        </p>
      </div>

      <div className="mx-auto grid gap-6 md:max-w-[64rem] md:grid-cols-3">
        {flows.map((flow) => (
          <div key={flow.audience} className="rounded-lg border bg-background p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{flow.audience}</h3>
              <p className="text-sm text-muted-foreground">{flow.summary}</p>
            </div>
            <ol className="space-y-4">
              {flow.steps.map((step) => (
                <li key={step.title} className="flex gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="space-y-8 mt-12">
        <h3 className="text-2xl font-bold text-center">The Feedback Form</h3>

        <div className="mx-auto max-w-[58rem] rounded-lg border bg-muted/50 p-6 md:p-8">
          <p className="text-muted-foreground mb-6">
            Every talk is rated from 1 to 10 on six criteria, so speakers get specific, comparable feedback instead of
            a generic &quot;great talk!&quot;.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {criteria.map((item, index) => (
              <li key={item.name} className="flex items-start gap-3">
                <span className="bg-muted text-foreground rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">
                  {index + 1}
                </span>
                <div>
                  <span className="font-medium">{item.name}</span>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="max-w-[800px] mx-auto text-center border-t pt-8">
          <h4 className="text-xl font-bold mb-4">Keeping Feedback Fair</h4>
          <p className="text-muted-foreground">
            Feedback is private to the speaker. Nobody else can browse individual responses, and names are optional.
            To protect speakers from spam and rating manipulation, each device or network can only rate a talk once.
          </p>
        </div>

        <div className="max-w-[800px] mx-auto text-center border-t pt-8 space-y-4">
          <h4 className="text-xl font-bold">Gift a Speaker: Coming Soon</h4>
          <p className="text-muted-foreground">
            Loved a talk? Soon you&apos;ll be able to say thanks with a gift sent directly to the speaker. Gifts will
            run on-chain on the Stellar network, so they&apos;re sent in XLM, Stellar&apos;s native currency, and go
            straight to the speaker&apos;s own wallet. Transfers settle in seconds and cost a fraction of a cent.
          </p>
          <ul className="text-left text-muted-foreground space-y-2 max-w-[640px] mx-auto">
            <li>
              <span className="font-medium text-foreground">Speakers:</span> add your Stellar (XLM) wallet address
              to your profile to be ready to receive gifts. You stay in control of your own wallet and funds.
            </li>
            <li>
              <span className="font-medium text-foreground">Supporters:</span> you&apos;ll need an XLM wallet to
              send a gift. Gifts are transparent and can be verified on the Stellar network.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            This feature is still in development, and details may change before launch.
          </p>
        </div>
      </div>
    </section>
  )
}
