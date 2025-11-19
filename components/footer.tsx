import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="font-bold text-lg">
            <span className="text-foreground">Speak</span>
            <span className="text-muted-foreground">Wise</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for speakers, organizers, and attendees.{" "}
            <Link
              href="/about"
              className="font-medium underline underline-offset-4"
            >
              Learn more
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/hellospeakwise-hq/speakwise-frontend"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  )
}
