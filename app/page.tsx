import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { UserTypesSection } from "@/components/user-types-section"
import { CTASection } from "@/components/cta-section"

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-white dark:bg-black">
      <HeroSection />
      <FeaturesSection />
      <UserTypesSection />
      <CTASection />
    </div>
  )
}
