import type { Metadata } from "next"
import { MaintenanceContent } from "./maintenance-content"

export const metadata: Metadata = {
  title: "SpeakWise — Under Maintenance",
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return <MaintenanceContent />
}
