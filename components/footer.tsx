import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black">
      <div className="container py-8 md:py-12 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">SpeakWise</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Empowering speakers, attendees, and organizers with valuable feedback and insights.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/speakers" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Speakers
                </Link>
              </li>
              <li>
                <Link href="/organizers" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Organizers
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SpeakWise. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
