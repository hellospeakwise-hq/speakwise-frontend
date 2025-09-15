import Link from "next/link"
import { Star, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RecentFeedbackProps {
  limit?: number
}

export function RecentFeedback({ limit }: RecentFeedbackProps) {
  // Sample data - in a real app, this would come from an API
  const feedback = [
    {
      id: "1",
      event: "AI Summit 2024",
      session: "Advancements in Generative AI",
      date: "March 15, 2024",
      rating: 5,
      comment:
        "Dr. Johnson's presentation on generative AI was incredibly insightful and accessible. She has a unique ability to explain complex concepts in a way that everyone can understand.",
      categories: ["Content", "Delivery", "Engagement"],
      isNew: true,
    },
    {
      id: "2",
      event: "TechConf 2024",
      session: "Ethical Considerations in AI Development",
      date: "January 11, 2024",
      rating: 4,
      comment:
        "Great presentation on AI ethics. The examples were relevant and thought-provoking. Would have liked more time for Q&A at the end.",
      categories: ["Content", "Examples"],
      isNew: true,
    },
    {
      id: "3",
      event: "Global ML Conference",
      session: "The Future of Neural Networks",
      date: "November 6, 2023",
      rating: 5,
      comment:
        "Sarah's deep knowledge of neural networks and her ability to communicate complex ideas clearly made her session the highlight of the conference for me.",
      categories: ["Knowledge", "Communication", "Engagement"],
      isNew: false,
    },
    {
      id: "4",
      event: "AI in Healthcare Summit",
      session: "AI Applications in Medical Diagnostics",
      date: "September 21, 2023",
      rating: 5,
      comment:
        "The presentation on AI in medical diagnostics was excellent. The case studies were particularly helpful in understanding real-world applications.",
      categories: ["Content", "Case Studies", "Applications"],
      isNew: false,
    },
    {
      id: "5",
      event: "DevConf 2023",
      session: "Building Responsible AI Systems",
      date: "August 16, 2023",
      rating: 4,
      comment:
        "Very informative session on responsible AI. The frameworks presented will be useful in my work. The presentation slides were well-designed and easy to follow.",
      categories: ["Content", "Frameworks", "Visuals"],
      isNew: false,
    },
  ]

  const displayFeedback = limit ? feedback.slice(0, limit) : feedback

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Anonymous feedback from your speaking engagements</CardDescription>
        </div>
        {limit && (
          <Link href="/dashboard/speaker/feedback">
            <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayFeedback.length > 0 ? (
            displayFeedback.map((item) => (
              <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.event}</h3>
                      {item.isNew && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">{item.session}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted stroke-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">{item.comment}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No feedback found</p>
            </div>
          )}
        </div>
      </CardContent>
      {!limit && feedback.length > 0 && (
        <div className="px-6 pb-6 flex justify-center">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Export Feedback Report
          </Button>
        </div>
      )}
    </Card>
  )
}
