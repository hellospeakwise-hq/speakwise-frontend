import type React from "react"
import Script from "next/script"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { DisableConsole } from "@/components/disable-console"
import { CookieConsent } from "@/components/cookie-consent"
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
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
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
              <Toaster position="top-center" />
              <MainNav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
