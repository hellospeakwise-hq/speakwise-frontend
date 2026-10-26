import type React from "react"
import Script from "next/script"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { Web3Provider } from "@/components/providers/web3-provider"
import { IdleTimeoutModal } from "@/components/idle-timeout-modal"
import { DisableConsole } from "@/components/disable-console"
import { CookieConsent } from "@/components/cookie-consent"
import { SponsorBanner } from "@/components/sponsor-banner"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { cn } from "@/lib/utils"
import "./globals.css"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

export const metadata = {
  metadataBase: new URL("https://speakwise.live"),
  title: {
    default: "SpeakWise | Speaker Profiles & Talk Feedback",
    template: "%s | SpeakWise",
  },
  manifest: "/manifest.json",
  description: "Build your speaker profile, showcase talks, and collect anonymous audience feedback. SpeakWise helps speakers and event organizers grow.",
  icons: {
    icon: "/logo-black.png",
  },
  keywords: [
    "speaker portfolio",
    "github for speakers",
    "showcase talks",
    "conference talks",
    "speaker feedback",
    "anonymous feedback",
    "speaking portfolio",
    "event management",
    "conference speakers",
    "presentation feedback",
    "public speaking",
    "talk showcase",
    "speaker profile",
    "event organizers"
  ],
  authors: [{ name: "SpeakWise" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://speakwise.live",
    title: "SpeakWise | Speaker Profiles & Talk Feedback",
    description: "Build your speaker profile, showcase talks, and collect anonymous audience feedback. SpeakWise helps speakers and event organizers grow.",
    siteName: "SpeakWise",
    images: [
      {
        url: "/speakwise-intro.png",
        alt: "SpeakWise — the future of speaker management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakWise | Speaker Profiles & Talk Feedback",
    description: "Build your speaker profile, showcase talks, and collect anonymous audience feedback. SpeakWise helps speakers and event organizers grow.",
    images: [
      {
        url: "/speakwise-intro.png",
        alt: "SpeakWise — the future of speaker management",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="SpeakWise" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SpeakWise" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />

        {/* Polyfill crypto.randomUUID for non-secure LAN HTTP on mobile browsers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  if (!window.crypto) { window.crypto = {}; }
                  if (!window.crypto.randomUUID) {
                    window.crypto.randomUUID = function() {
                      try {
                        var arr = new Uint8Array(1);
                        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function(c) {
                          return (c ^ (window.crypto.getRandomValues(arr)[0] & (15 >> (c / 4)))).toString(16);
                        });
                      } catch (e) {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                          var r = (Math.random() * 16) | 0;
                          var v = c === 'x' ? r : (r & 0x3) | 0x8;
                          return v.toString(16);
                        });
                      }
                    };
                  }
                  if (typeof globalThis !== 'undefined' && globalThis.crypto && !globalThis.crypto.randomUUID) {
                    globalThis.crypto.randomUUID = window.crypto.randomUUID;
                  }
                }
              })();
            `,
          }}
        />

        {/* Mastodon Verification */}
        <link rel="me" href="https://mastodon.social/@speakwise" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
        suppressHydrationWarning
      >
        <DisableConsole />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3Provider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Toaster />
                <SponsorBanner />
                <MainNav />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <CookieConsent />
              <PWAInstallPrompt />
              <IdleTimeoutModal />
            </AuthProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
