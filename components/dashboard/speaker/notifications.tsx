"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  description: string
  link: string
  date: string
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real notifications from API
    const fetchNotifications = async () => {
      try {
        // const response = await fetch('/api/speakers/notifications')
        // const data = await response.json()
        // setNotifications(data)
        
        // For now, showing empty state
        setNotifications([])
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  if (loading || notifications.length === 0) return null

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
