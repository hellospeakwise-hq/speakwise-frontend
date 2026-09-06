const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/api`

export interface Blog {
  id: string
  title: string
  short_description: string
  full_description: string
  image: string | null
  created_by: string | null
  created_by_name: string | null
  published_date: string | null
  status: "draft" | "published" | "archived"
}

function resolveImage(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}${path}`
}

export async function listBlogs(): Promise<Blog[]> {
  const res = await fetch(`${API_BASE}/blogs/`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const data = await res.json()
  const blogs: Blog[] = Array.isArray(data) ? data : (data?.results ?? [])
  return blogs
    .filter((b) => b.status === "published")
    .map((b) => ({ ...b, image: resolveImage(b.image) }))
}

export async function getBlog(id: string): Promise<Blog | null> {
  const res = await fetch(`${API_BASE}/blogs/${id}/`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const blog: Blog = await res.json()
  return { ...blog, image: resolveImage(blog.image) }
}
