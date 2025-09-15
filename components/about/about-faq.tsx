import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AboutFAQ() {
  const faqs = [
    {
      question: "How does SpeakWise ensure feedback is from actual attendees?",
      answer:
        "Event organizers upload attendee lists to SpeakWise. When an attendee wants to provide feedback, they must verify their attendance by entering the email address they used for registration. For in-person events, we also offer QR code verification at the venue.",
    },
    {
      question: "Is my feedback truly anonymous?",
      answer:
        "Yes, all feedback is completely anonymous to speakers. While we verify that you attended the event, your identity is never revealed to the speaker. This allows for honest, constructive feedback without concerns about potential awkwardness in future interactions.",
    },
    {
      question: "As a speaker, how do I claim my profile?",
      answer:
        "You can claim your speaker profile by creating an account and verifying your identity. Once verified, you'll have access to all feedback from your past presentations and can customize your public profile with your bio, areas of expertise, and speaking history.",
    },
    {
      question: "Can event organizers see individual feedback?",
      answer:
        "Organizers can see aggregated feedback data and statistics for all speakers at their event, but they cannot see individual feedback submissions. This maintains the anonymity of the feedback while still providing valuable insights for future event planning.",
    },
    {
      question: "How can I add my event to SpeakWise?",
      answer:
        "Event organizers can create an account and submit their event details through our organizer dashboard. Once approved, you can upload your speaker list, attendee information, and event schedule to enable the feedback system.",
    },
    {
      question: "Is there a cost to use SpeakWise?",
      answer:
        "SpeakWise offers both free and premium tiers. Basic feedback functionality is free for all users. Premium features, such as advanced analytics for speakers and comprehensive event management tools for organizers, are available through our subscription plans.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Find answers to common questions about how SpeakWise works
            </p>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
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
