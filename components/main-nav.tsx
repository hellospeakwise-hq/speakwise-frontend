"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  // Dynamic routes based on authentication state and user role
  const routes = useMemo(() => {
    const baseRoutes = [
      {
        href: "/",
        label: "Home",
        active: pathname === "/",
      },
      {
        href: "/events",
        label: "Events",
        active: pathname === "/events",
      },
      {
        href: "/speakers",
        label: "Speakers",
        active: pathname === "/speakers",
      },
      {
        href: "/blog",
        label: "Blog",
        active: pathname.startsWith("/blog"),
      },
      {
        href: "/about",
        label: "About",
        active: pathname === "/about",
      },
      {
        href: "/contact",
        label: "Contact",
        active: pathname === "/contact",
      },
    ];

    // Add dashboard link based on user role
    if (isAuthenticated && user?.role?.role) {
      let dashboardRoute = "/dashboard";
      
      switch (user.role.role) {
        case "speaker":
          dashboardRoute = "/dashboard/speaker";
          break;
        case "organizer":
          dashboardRoute = "/dashboard/organizer";
          break;
        case "attendee":
          dashboardRoute = "/dashboard/attendee";
          break;
        default:
          dashboardRoute = "/dashboard/attendee";
      }
      
      baseRoutes.splice(3, 0, {
        href: dashboardRoute,
        label: "Dashboard",
        active: pathname.startsWith("/dashboard"),
      });
    }

    return baseRoutes;
  }, [pathname, user, isAuthenticated]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="font-bold text-xl md:text-2xl">
              <span className="text-orange-500">Speak</span>
              <span className="text-foreground">Wise</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-500",
                  route.active ? "text-orange-500" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{user ? `${user.first_name || ''} ${user.last_name || ''}` : 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <div className="md:hidden flex items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden container py-4 border-t">
          <nav className="flex flex-col gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-500 px-2 py-1.5 rounded-md",
                  route.active ? "bg-orange-50 text-orange-500 dark:bg-orange-500/10" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium">
                    Signed in as <span className="font-bold">{user ? `${user.first_name || ''} ${user.last_name || ''}` : 'User'}</span>
                  </div>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
