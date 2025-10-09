import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="relative w-full py-12 md:py-20 lg:py-24 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-800/20 rounded-full blur-3xl"></div>
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white">
              Ready to Transform Speaker Feedback?
            </h2>
            <p className="max-w-[700px] mx-auto text-base text-white/90 leading-relaxed">
              Join SpeakWise today and be part of a community that values honest feedback and continuous improvement.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-white/90 hover:scale-105 font-semibold px-6 py-5 text-base rounded-lg shadow-xl transition-all duration-300"
              >
                Sign Up Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-6 py-5 text-base rounded-lg transition-all duration-300"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
