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
    date: "2025-12-14",
    author: "SpeakWise Team",
    image: "/speakwise-intro.png",
    content: `
# Welcome to SpeakWise

We're thrilled to introduce SpeakWise, a comprehensive platform designed to revolutionize how speakers, organizers, and attendees connect and collaborate.

## Our Mission

At SpeakWise, we believe that every speaker deserves the tools to manage their engagements effectively, every organizer needs streamlined event management, and every attendee should have access to quality content and the ability to provide meaningful feedback.

## Key Features

### For Speakers
- Professional Profiles: Showcase your expertise with comprehensive speaker profiles
- Feedback Collection: Gather valuable insights from your audiences
- Engagement Tracking: Monitor your speaking career growth with detailed analytics

### For Organizers
- Event Management: Streamline conference planning and speaker coordination
- Speaker Discovery: Find the perfect speakers for your events
- Attendee Engagement: Facilitate connections between speakers and attendees

### For Attendees
- Event Discovery: Find talks and conferences that match your interests
- Feedback Submission: Share your thoughts and help speakers improve
- Networking: Connect with speakers and fellow attendees

## The SpeakWise Difference

Unlike traditional speaker management tools, SpeakWise brings together all three stakeholders in one unified platform. Speakers can build their portfolios, collect feedback, and track their growth. Organizers can discover talent and manage events seamlessly. Attendees can engage with content and speakers they're passionate about.

## Getting Started

Ready to elevate your speaking career or organize your next event? Contact us at hello.speakwise@gmail.com and join the SpeakWise community today!

Thank you for being part of our journey!
    `,
  },
  "speaker-feedback-best-practices": {
    title: "Best Practices for Collecting Speaker Feedback",
    date: "2025-12-14",
    author: "SpeakWise Team",
    image: "/best-practices.png",
    content: `
# Best Practices for Collecting Speaker Feedback

Feedback is essential for growth as a speaker. Here's how to collect and utilize feedback effectively using modern tools and strategies.

## Why Feedback Matters

Constructive feedback helps you:
- Identify strengths and areas for improvement
- Understand audience preferences and expectations
- Refine your presentation style and delivery
- Build confidence and credibility as a speaker
- Track progress over time

## Effective Feedback Collection Strategies

1. Make it Easy: Use simple forms with clear questions so attendees can provide feedback without friction

2. Ask Specific Questions: Focus on actionable areas rather than vague inquiries about overall satisfaction

3. Timing is Key: Collect feedback immediately after your talk when the content is fresh in attendees' minds

4. Be Open: Welcome all types of feedback, both positive and constructive criticism

5. Use Multiple Formats: Consider surveys, open-ended responses, and rating scales

## Utilizing Feedback for Improvement

- Review patterns across multiple talks to identify consistent themes
- Set specific improvement goals based on feedback received
- Track progress over time and celebrate improvements
- Share successes with your network
- Continuously iterate and evolve your presentations

## With SpeakWise

Our platform makes feedback collection and analysis seamless. Attendees can provide feedback instantly, and you get access to detailed analytics and insights to help you grow as a speaker.

Start collecting meaningful feedback today and take your speaking career to the next level!
    `,
  },
  "organizing-successful-conferences": {
    title: "5 Tips for Organizing Successful Tech Conferences",
    date: "2025-12-14",
    author: "SpeakWise Team",
    image: "/5-steps.png",
    content: `
# 5 Tips for Organizing Successful Tech Conferences

Planning a tech conference is a complex but rewarding endeavor. Here are our top five tips for creating an event that attendees will love and remember.

## 1. Start Early

Begin planning at least 6-12 months in advance. This gives you time to:
- Secure the venue and negotiate better rates
- Recruit high-quality speakers
- Market the event effectively
- Handle logistics and unexpected challenges

## 2. Curate Quality Speakers

Your speakers make or break the event. Look for:
- Diverse perspectives and backgrounds
- Engaging presenters with strong communication skills
- Relevant topics aligned with your audience
- Mix of experience levels and speaker types

## 3. Focus on Attendee Experience

Consider the full experience:
- Comfortable and well-equipped venue
- Quality food and beverage options
- Regular breaks and networking opportunities
- Clear signage and communication throughout the event

## 4. Embrace Technology

Use modern platforms like SpeakWise to:
- Manage speaker applications and schedules
- Coordinate logistics and communications
- Collect real-time feedback from attendees
- Engage attendees before, during, and after the event

## 5. Gather and Act on Feedback

Post-event feedback is crucial for growth:
- Understand what worked well and what didn't
- Identify specific improvements for future events
- Measure success against your goals
- Show attendees you value their input

## Conclusion

Successful conferences require thoughtful planning, quality content, and a genuine focus on attendee experience. By following these tips and leveraging modern tools, you'll create an event that resonates with your audience.

Ready to organize your next conference? Contact us at [hello.speakwise@gmail.com] to learn how SpeakWise can help!
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
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug as keyof typeof blogPosts]

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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = blogPosts[slug as keyof typeof blogPosts] as BlogPost | undefined

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
