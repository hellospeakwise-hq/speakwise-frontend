import { use } from "react"
import { SpeakerProfile } from "@/components/speakers/speaker-profile"

export default function SpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SpeakerProfile id={id} />
}
