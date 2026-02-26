import type React from "react"
import Script from "next/script"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"
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
  title: "SpeakWise - GitHub for Speakers | Showcase Your Talks & Get Feedback",
  manifest: "/manifest.json",
  description:
    "The GitHub for speakers. Build your speaking portfolio, showcase your conference talks, and receive anonymous feedback from attendees. The ultimate platform for speakers to grow and event organizers to manage.",
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
    url: "https://speak-wise.live",
    title: "SpeakWise - GitHub for Speakers",
    description:
      "Build your speaking portfolio, showcase your conference talks, and get anonymous feedback from attendees. The GitHub for speakers.",
    siteName: "SpeakWise",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakWise - GitHub for Speakers",
    description:
      "Build your speaking portfolio, showcase your conference talks, and get anonymous feedback from attendees.",
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

        {/* Clear stale SW caches for API/media so uploaded images always load fresh */}
        <Script
          id="sw-cache-cleaner"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('caches' in window) {
                // Delete any SW-cached responses for API or media URLs
                // (fixes stale 403/404 for profile images)
                caches.keys().then(function(cacheNames) {
                  cacheNames.forEach(function(cacheName) {
                    caches.open(cacheName).then(function(cache) {
                      cache.keys().then(function(requests) {
                        requests.forEach(function(request) {
                          if (
                            request.url.includes('apis.speak-wise.live') ||
                            request.url.includes('/media/')
                          ) {
                            cache.delete(request);
                          }
                        });
                      });
                    });
                  });
                });
              }
            `,
          }}
        />

        {/* Chatwoot - Disabled for now */}
        {/* <Script
          id="chatwoot-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d,t) {
                var BASE_URL="https://app.chatwoot.com";
                var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
                g.src=BASE_URL+"/packs/js/sdk.js";
                g.async = true;
                s.parentNode.insertBefore(g,s);
                g.onload=function(){
                  window.chatwootSDK.run({
                    websiteToken: '${process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN}',
                    baseUrl: BASE_URL
                  })
                }
              })(document,"script");
            `,
          }}
        /> */}
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
