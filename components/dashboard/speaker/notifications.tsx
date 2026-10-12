"use client"

import { useCallback, useState, useEffect } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { speakerApi, type SpeakerNotification } from "@/lib/api/speakerApi"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type NotificationView = "unread" | "read"

export function Notifications({
  pageSize = 5,
  showReadHistory = false,
}: {
  pageSize?: number
  showReadHistory?: boolean
}) {
  const [notifications, setNotifications] = useState<SpeakerNotification[]>([])
  const [view, setView] = useState<NotificationView>("unread")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setNotifications(
        await speakerApi.getNotifications(pageSize, showReadHistory && view === "read"),
      )
    } catch {
      setError("We couldn't load your updates. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [pageSize, showReadHistory, view])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markAsRead = async (notification: SpeakerNotification) => {
    setMarkingRead(notification.id)
    try {
      await speakerApi.markNotificationRead(notification.id)
      setNotifications((current) => current.filter((item) => item.id !== notification.id))
      window.dispatchEvent(new Event("speakwise-notifications-updated"))
    } catch {
      setError("We couldn't update this notification. Please try again.")
    } finally {
      setMarkingRead(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground" aria-live="polite">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your updates
      </div>
    )
  }

  return (
    <section className="space-y-3" aria-label="Updates from speakers you follow">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Updates from speakers you follow</h2>
      </div>
      {showReadHistory && (
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as NotificationView)}
          className="w-full"
        >
          <TabsList aria-label="Filter notifications">
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 px-4 py-3 text-sm" role="alert">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadNotifications()}>
            Try again
          </Button>
        </div>
      )}
      {!error && notifications.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {view === "read"
            ? "Notifications you have read will be kept here."
            : "Follow speakers to see their new talks and upcoming event announcements here."}
        </p>
      )}
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={
                view === "unread"
                  ? "mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                  : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
              }
              aria-label={view === "unread" ? "Unread" : "Read"}
            >
              {view === "read" && <Check className="h-3 w-3" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm">{notification.message}</p>
              <time className="mt-1 block text-xs text-muted-foreground" dateTime={notification.created_at}>
                {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(notification.created_at))}
              </time>
              {notification.link && (
                <Link
                  href={notification.link}
                  className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => void markAsRead(notification)}
                >
                  View update
                </Link>
              )}
            </div>
          </div>
          {view === "unread" ? (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              disabled={markingRead === notification.id}
              onClick={() => void markAsRead(notification)}
              aria-label="Mark notification as read"
            >
              {markingRead === notification.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <span className="shrink-0 self-center text-xs text-muted-foreground">Read</span>
          )}
        </article>
      ))}
    </section>
  )
}
