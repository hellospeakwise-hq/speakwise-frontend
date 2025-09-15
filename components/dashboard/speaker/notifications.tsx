"use client"

import { useState } from "react"
import { Bell, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "request",
      title: "New Speaking Request",
      description: "You have a new speaking request for DevConf 2025",
      link: "/dashboard/speaker/requests",
      date: "2 hours ago",
    },
    {
      id: "2",
      type: "feedback",
      title: "New Feedback Received",
      description: "You received 5 new feedback submissions from TechConf 2024",
      link: "/dashboard/speaker/feedback",
      date: "1 day ago",
    },
  ])

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          className="bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30"
        >
          <div className="flex items-start justify-between">
            <div className="flex">
              <Bell className="h-4 w-4 text-orange-500 mt-0.5 mr-2" />
              <div>
                <AlertTitle className="text-orange-800 dark:text-orange-300">{notification.title}</AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-400">
                  {notification.description}
                  <div className="mt-2 flex items-center justify-between">
                    <Link href={notification.link}>
                      <Button variant="link" className="p-0 h-auto text-orange-600 dark:text-orange-400">
                        View Details
                      </Button>
                    </Link>
                    <span className="text-xs text-orange-600/70 dark:text-orange-400/70">{notification.date}</span>
                  </div>
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              onClick={() => dismissNotification(notification.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  )
}
