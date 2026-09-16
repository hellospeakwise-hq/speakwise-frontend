"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"

interface RecentFeedbackProps {
  limit?: number
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'Unknown date'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return 'Unknown date'
  }
}

function highScoreBadges(f: Feedback): string[] {
  const out: string[] = []
  if (f.engagement >= 8) out.push("Engagement")
  if (f.clarity >= 8) out.push("Clarity")
  if (f.content_depth >= 8) out.push("Content")
  if (f.speaker_knowledge >= 8) out.push("Knowledge")
  if (f.practical_relevance >= 8) out.push("Practical")
  return out.length > 0 ? out : ["General"]
}

export function RecentFeedback({ limit }: RecentFeedbackProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    feedbackAPI
      .getCurrentSpeakerFeedback()
      .then(setFeedback)
      .catch((err) => console.error('Error fetching recent feedback:', err))
      .finally(() => setLoading(false))
  }, [])

  const displayFeedback = limit ? feedback.slice(0, limit) : feedback

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Anonymous feedback from your presentations</CardDescription>
        </div>
        {limit && feedback.length > 0 && (
          <div className="flex gap-2">
            <Link href="/dashboard/speaker/feedback">
              <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
                View All
              </Button>
            </Link>
            <Link href="/dashboard/speaker/feedback-by-talks">
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600 dark:text-orange-400 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
              >
                By Presentation
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse text-sm text-muted-foreground py-4">Loading feedback…</div>
        ) : (
          <div className="space-y-6">
            {displayFeedback.length > 0 ? (
              displayFeedback.map((item) => (
                <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* Presentation context */}
                      {item.experience ? (
                        <p className="text-sm font-medium truncate">{item.experience.topic}</p>
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground">Unknown presentation</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {item.experience && (
                          <span className="text-xs text-muted-foreground">
                            {item.experience.event_name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </span>
                        {item.is_anonymous && (
                          <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                        )}
                      </div>
                    </div>
                    {/* Overall rating */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{item.overall_rating}/10</span>
                    </div>
                  </div>

                  {/* Criteria grid */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                      { label: 'Engagement', value: item.engagement },
                      { label: 'Clarity', value: item.clarity },
                      { label: 'Content', value: item.content_depth },
                      { label: 'Knowledge', value: item.speaker_knowledge },
                      { label: 'Practical', value: item.practical_relevance },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="text-sm font-semibold">{value}/10</p>
                      </div>
                    ))}
                  </div>

                  {/* Comment */}
                  {item.comments && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                        Comments:
                      </span>
                      <p className="text-sm text-muted-foreground italic">"{item.comments}"</p>
                    </div>
                  )}

                  {/* High-score badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {highScoreBadges(item).map((badge) => (
                      <Badge
                        key={badge}
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your presentation QR code with your audience to start collecting feedback.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
