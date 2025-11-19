import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  title: "Blog - SpeakWise",
  description: "Latest news, updates, and insights from the SpeakWise team.",
}

// This is a placeholder for blog posts. In production, you would:
// - Fetch from a CMS (like Contentful, Sanity, or Strapi)
// - Use MDX with Contentlayer
// - Connect to your Django backend blog API
const blogPosts = [
  {
    id: "1",
    slug: "introducing-speakwise",
    title: "Introducing SpeakWise: The Future of Speaker Management",
    excerpt: "We're excited to launch SpeakWise, a comprehensive platform designed to connect speakers, organizers, and attendees.",
    date: "2024-01-15",
    author: "SpeakWise Team",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    slug: "speaker-feedback-best-practices",
    title: "Best Practices for Collecting Speaker Feedback",
    excerpt: "Learn how to effectively gather and utilize feedback to improve your speaking engagements.",
    date: "2024-01-10",
    author: "SpeakWise Team",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    slug: "organizing-successful-conferences",
    title: "5 Tips for Organizing Successful Tech Conferences",
    excerpt: "Essential strategies for event organizers to create memorable and impactful conferences.",
    date: "2024-01-05",
    author: "SpeakWise Team",
    image: "/placeholder.svg",
  },
]

export default function BlogPage() {
  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Latest news, updates, and insights from the SpeakWise team.
          </p>
        </div>
      </div>
      <hr className="my-8" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="group relative flex flex-col space-y-2"
          >
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={450}
              className="rounded-md border bg-muted transition-colors"
            />
            <h2 className="text-2xl font-extrabold">{post.title}</h2>
            <p className="text-muted-foreground">{post.excerpt}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icons.calendar className="h-4 w-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
            <Link href={`/blog/${post.slug}`} className="absolute inset-0">
              <span className="sr-only">View Article</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
