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
