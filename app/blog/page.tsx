import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { CalendarDays, User, FileText } from "lucide-react"
import { listBlogs } from "@/lib/api/blogApi"

export const metadata: Metadata = {
  title: "Blog - SpeakWise",
  description: "Latest news, updates, and insights from the SpeakWise team.",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function BlogPage() {
  const posts = await listBlogs()

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

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-30" />
          <p className="font-medium text-foreground text-sm">No posts yet</p>
          <p className="text-sm">Check back soon for updates from the SpeakWise team.</p>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article key={post.id} className="group relative flex flex-col space-y-2">
              <div className="relative aspect-video overflow-hidden rounded-md border bg-muted">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold leading-snug group-hover:text-foreground/70 transition-colors">
                {post.title}
              </h2>

              {post.short_description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.short_description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                {post.published_date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <time dateTime={post.published_date}>
                      {formatDate(post.published_date)}
                    </time>
                  </span>
                )}
                {post.created_by_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {post.created_by_name}
                  </span>
                )}
              </div>

              <Link href={`/blog/${post.id}`} className="absolute inset-0">
                <span className="sr-only">Read {post.title}</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
