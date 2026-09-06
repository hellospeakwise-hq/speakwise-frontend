import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CalendarDays, ChevronLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { getBlog, listBlogs } from "@/lib/api/blogApi"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlog(slug)
  if (!post) return { title: "Post Not Found" }
  return {
    title: `${post.title} - SpeakWise Blog`,
    description: post.short_description || post.title,
    openGraph: post.image
      ? { images: [{ url: post.image }] }
      : undefined,
  }
}

export async function generateStaticParams() {
  try {
    const posts = await listBlogs()
    return posts.map((p) => ({ slug: p.id }))
  } catch {
    return []
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlog(slug)

  if (!post) notFound()

  return (
    <article className="container relative max-w-3xl py-6 lg:py-10">
      <Link
        href="/blog"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-[-200px] top-14 hidden xl:inline-flex"
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        See all posts
      </Link>

      <div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {post.published_date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.published_date}>
                Published on {formatDate(post.published_date)}
              </time>
            </span>
          )}
        </div>

        <h1 className="mt-3 font-heading text-4xl leading-tight lg:text-5xl">
          {post.title}
        </h1>

        {post.created_by_name && (
          <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{post.created_by_name}</span>
          </div>
        )}
      </div>

      {post.image && (
        <div className="relative my-8 aspect-video overflow-hidden rounded-md border bg-muted">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {post.short_description && (
        <p className="mb-8 text-lg text-muted-foreground leading-relaxed border-l-2 border-border pl-4">
          {post.short_description}
        </p>
      )}

      <div
        className="prose prose-gray dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.full_description }}
      />

      <hr className="mt-12" />
      <div className="flex justify-center py-6 lg:py-10">
        <Link href="/blog" className={cn(buttonVariants({ variant: "ghost" }))}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          See all posts
        </Link>
      </div>
    </article>
  )
}
