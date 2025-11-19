import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// This would be replaced with actual data fetching from CMS or API
const blogPosts = {
  "introducing-speakwise": {
    title: "Introducing SpeakWise: The Future of Speaker Management",
    date: "2024-01-15",
    author: "SpeakWise Team",
    image: "/placeholder.svg",
    content: `
# Welcome to SpeakWise

We're thrilled to introduce **SpeakWise**, a comprehensive platform designed to revolutionize how speakers, organizers, and attendees connect and collaborate.

## Our Mission

At SpeakWise, we believe that every speaker deserves the tools to manage their engagements effectively, every organizer needs streamlined event management, and every attendee should have access to quality content and the ability to provide meaningful feedback.

## Key Features

### For Speakers
- **Professional Profiles**: Showcase your expertise with comprehensive speaker profiles
- **Feedback Collection**: Gather valuable insights from your audiences
- **Engagement Tracking**: Monitor your speaking career growth with detailed analytics

### For Organizers
- **Event Management**: Streamline conference planning and speaker coordination
- **Speaker Discovery**: Find the perfect speakers for your events
- **Attendee Engagement**: Facilitate connections between speakers and attendees

### For Attendees
- **Event Discovery**: Find talks and conferences that match your interests
- **Feedback Submission**: Share your thoughts and help speakers improve
- **Networking**: Connect with speakers and fellow attendees

## Getting Started

Ready to elevate your speaking career or organize your next event? [Sign up today](/signup) and join the SpeakWise community!
    `,
  },
  "speaker-feedback-best-practices": {
    title: "Best Practices for Collecting Speaker Feedback",
    date: "2024-01-10",
    author: "SpeakWise Team",
    image: "/placeholder.svg",
    content: `
# Best Practices for Collecting Speaker Feedback

Feedback is essential for growth as a speaker. Here's how to collect and utilize feedback effectively.

## Why Feedback Matters

Constructive feedback helps you:
- Identify strengths and areas for improvement
- Understand audience preferences
- Refine your presentation style
- Build confidence

## Effective Feedback Collection

1. **Make it Easy**: Use simple forms with clear questions
2. **Ask Specific Questions**: Focus on actionable areas
3. **Timing is Key**: Collect feedback immediately after your talk
4. **Be Open**: Welcome all types of feedback

## Utilizing Feedback

- Review patterns across multiple talks
- Set specific improvement goals
- Track progress over time
- Celebrate improvements

With SpeakWise, feedback collection and analysis is built right into the platform!
    `,
  },
  "organizing-successful-conferences": {
    title: "5 Tips for Organizing Successful Tech Conferences",
    date: "2024-01-05",
    author: "SpeakWise Team",
    image: "/placeholder.svg",
    content: `
# 5 Tips for Organizing Successful Tech Conferences

Planning a tech conference? Here are our top tips for success.

## 1. Start Early

Begin planning at least 6-12 months in advance. This gives you time to:
- Secure the venue
- Recruit speakers
- Market the event
- Handle logistics

## 2. Curate Quality Speakers

Your speakers make or break the event. Look for:
- Diverse perspectives
- Engaging presenters
- Relevant topics
- Mix of experience levels

## 3. Focus on Attendee Experience

Consider:
- Comfortable venue
- Good food and breaks
- Networking opportunities
- Clear communication

## 4. Embrace Technology

Use platforms like SpeakWise to:
- Manage speaker applications
- Coordinate schedules
- Collect feedback
- Engage attendees

## 5. Gather and Act on Feedback

Post-event feedback is crucial for:
- Understanding what worked
- Identifying improvements
- Planning future events
- Measuring success

Ready to organize your next conference? [Get started with SpeakWise](/signup)!
    `,
  },
}

type BlogPost = {
  title: string
  date: string
  author: string
  image: string
  content: string
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = blogPosts[params.slug as keyof typeof blogPosts]

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.content.slice(0, 160),
  }
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = blogPosts[params.slug as keyof typeof blogPosts] as BlogPost | undefined

  if (!post) {
    notFound()
  }

  return (
    <article className="container relative max-w-3xl py-6 lg:py-10">
      <Link
        href="/blog"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-[-200px] top-14 hidden xl:inline-flex"
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        See all posts
      </Link>
      <div>
        <time
          dateTime={post.date}
          className="block text-sm text-muted-foreground"
        >
          Published on{" "}
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>
        <h1 className="mt-2 inline-block font-heading text-4xl leading-tight lg:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center space-x-2 text-sm">
          <Icons.user className="h-4 w-4" />
          <span className="text-muted-foreground">{post.author}</span>
        </div>
      </div>
      <img
        src={post.image}
        alt={post.title}
        className="my-8 rounded-md border bg-muted transition-colors"
        style={{ aspectRatio: "16/9", objectFit: "cover" }}
      />
      <div className="prose prose-gray dark:prose-invert max-w-none">
        {/* In a real implementation, you would parse markdown here using react-markdown or similar */}
        <div
          dangerouslySetInnerHTML={{
            __html: post.content
              .split("\n")
              .map((line) => {
                if (line.startsWith("# ")) {
                  return `<h1>${line.slice(2)}</h1>`
                } else if (line.startsWith("## ")) {
                  return `<h2>${line.slice(3)}</h2>`
                } else if (line.startsWith("### ")) {
                  return `<h3>${line.slice(4)}</h3>`
                } else if (line.startsWith("- ")) {
                  return `<li>${line.slice(2)}</li>`
                } else if (line.trim() === "") {
                  return "<br />"
                } else {
                  const boldRegex = /\*\*(.*?)\*\*/g
                  return `<p>${line.replace(boldRegex, "<strong>$1</strong>")}</p>`
                }
              })
              .join("\n"),
          }}
        />
      </div>
      <hr className="mt-12" />
      <div className="flex justify-center py-6 lg:py-10">
        <Link href="/blog" className={cn(buttonVariants({ variant: "ghost" }))}>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          See all posts
        </Link>
      </div>
    </article>
  )
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }))
}
