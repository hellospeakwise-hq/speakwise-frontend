import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export function SpeakerFeedback() {
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
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
        <CardDescription>Anonymous feedback from your recent speaking engagements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {feedback.map((item) => (
            <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.event}</h3>
                  <p className="text-sm text-orange-500">{item.session}</p>
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
                      className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/40"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
