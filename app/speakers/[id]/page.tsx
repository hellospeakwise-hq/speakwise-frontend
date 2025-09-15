import Link from "next/link"
import { use } from "react"
import { SpeakerProfile } from "@/components/speakers/speaker-profile"
import { ChevronLeft } from "lucide-react"

export default function SpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="container py-10">
      <Link
        href="/speakers"
        className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Speakers
      </Link>
      <SpeakerProfile id={id} />
    </div>
  )
}
