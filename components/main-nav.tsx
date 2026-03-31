"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useMemo, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { userApi } from "@/lib/api/userApi"
import { OrganizationBadge } from "@/components/organization-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/speakers", label: "Speakers" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
]

export function MainNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [speakerId, setSpeakerId] = useState<number | null>(null)
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (isAuthenticated) {
        try {
          const profile = await userApi.getUserProfile()
          const data = profile as any
          const speakerData = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker
          if (speakerData?.id) setSpeakerId(speakerData.id)
        } catch {
          // silent
        }
      }
    }
    if (mounted && isAuthenticated) fetchProfileData()
  }, [mounted, isAuthenticated])

  const dashboardHref = useMemo(() => {
    if (!user?.role?.role) return "/dashboard"
    const map: Record<string, string> = {
      speaker: "/dashboard/speaker",
      organizer: "/dashboard/organizer",
      attendee: "/dashboard/attendee",
    }
    return map[user.role.role] ?? "/dashboard"
  }, [user])

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Account"
    : "Account"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Left — logo + pill nav */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo-white.png"
              alt="SpeakWise"
              width={80}
              height={80}
              className="h-14 w-auto"
            />
          </Link>

          {/* Pill nav — desktop */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-zinc-800/70 px-2 py-1.5">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            {mounted && isAuthenticated && (
              <Link
                href={dashboardHref}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right — CTAs */}
        <div className="hidden md:flex items-center gap-2">
          {mounted && isAuthenticated && <OrganizationBadge />}

          {mounted && isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white">
                  <User className="h-3.5 w-3.5" />
                  {displayName}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <DropdownMenuLabel className="text-zinc-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                {speakerId && (
                  <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800">
                    <Link href="/speakers/me" className="w-full">View Profile</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800">
                  <Link href={dashboardHref} className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800">
                  <Link href="/profile" className="w-full">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-400 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : mounted ? (
            <>
              <Link
                href="/signin"
                className="rounded-full px-5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile — hamburger */}
        <button
          className="md:hidden flex items-center justify-center rounded-full border border-white/10 h-9 w-9 text-zinc-400 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-zinc-950 px-4 py-4">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            {mounted && isAuthenticated && (
              <Link
                href={dashboardHref}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard") ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
            {mounted && isAuthenticated ? (
              <>
                <p className="px-4 text-xs text-zinc-500">Signed in as <span className="text-zinc-300 font-medium">{displayName}</span></p>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-left text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    Settings
                  </button>
                </Link>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false) }}
                  className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : mounted ? (
              <>
                <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:opacity-90 transition-opacity">
                    Get Started
                  </button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  )
}
