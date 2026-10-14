import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AboutFAQ() {
  const faqs = [
    {
      question: "Do I need an account to give feedback?",
      answer:
        "No. Scan the QR code or open the link a speaker shares for their talk, rate it, and optionally add your name and a comment. To protect speakers from spam and rating manipulation, each device or network can only rate a talk once.",
    },
    {
      question: "Is my feedback anonymous?",
      answer:
        "Your name is optional. Feedback is only visible to the speaker it is about. We keep a one-way hash of your network address purely to limit duplicate submissions; it isn't shown to speakers.",
    },
    {
      question: "As a speaker, how do I get started?",
      answer:
        "Create an account, set up your speaker profile and add your talks. For each talk you can generate a QR code or link to share with your audience, then follow your ratings and trends from your dashboard.",
    },
    {
      question: "Can event organizers see individual feedback?",
      answer:
        "No. Individual feedback is only visible to the speaker who received it.",
    },
    {
      question: "How can I add my event to SpeakWise?",
      answer:
        "Create an organization account. Our team reviews new organizations, and you'll receive an email once yours is approved. After that you can add your events from the organizer dashboard, including a link to your call for proposals if it's open.",
    },
    {
      question: "How do I submit a talk to an event's CFP?",
      answer:
        "SpeakWise doesn't collect proposals itself. When an event has an open call for proposals, the Submit CFP button takes you to the organizer's own submission page.",
    },
    {
      question: "Is there a cost to use SpeakWise?",
      answer:
        "SpeakWise is free for now. This may change in the future, and we'll let users know before anything does.",
    },
  ]

  return (
    <section className="container px-4 py-8 md:py-12 lg:py-24 border-t">
      <div className="mx-auto max-w-[58rem] space-y-8">
        <div className="text-center space-y-4">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Frequently Asked Questions</h2>
          <p className="max-w-[85%] mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Find answers to common questions about how SpeakWise works
          </p>
        </div>

        <div className="max-w-[800px] mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
