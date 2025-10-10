"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, MessageSquare, Users, TrendingUp } from "lucide-react"

export function FeedbackNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard/speaker",
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard overview with recent feedback"
    },
    {
      href: "/dashboard/speaker/feedback",
      label: "All Feedback",
      icon: MessageSquare,
      description: "View all feedback chronologically"
    },
    {
      href: "/dashboard/speaker/feedback-by-talks",
      label: "By Talks",
      icon: Users,
      description: "Feedback organized by speaking sessions"
    }
  ]

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? "bg-orange-600 hover:bg-orange-700 text-white" 
                      : "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}