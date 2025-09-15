import { AboutHero } from "@/components/about/about-hero"
import { AboutMission } from "@/components/about/about-mission"
import { HowItWorks } from "@/components/about/how-it-works"
import { AboutTeam } from "@/components/about/about-team"
import { AboutFAQ } from "@/components/about/about-faq"
import { CTASection } from "@/components/cta-section"

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center">
      <AboutHero />
      <AboutMission />
      <HowItWorks />
      <AboutTeam />
      <AboutFAQ />
      <CTASection />
    </div>
  )
}
