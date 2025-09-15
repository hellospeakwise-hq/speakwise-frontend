'use client'

import { use } from "react";
import { SessionManager } from "@/components/events/session-manager";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ManageSessionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ManageSessionsPage({ params }: ManageSessionsPageProps) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.userType !== 'organizer') {
      router.push(`/events/${id}`)
    }
  }, [loading, user, router, id])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  // Redirect if not organizer
  if (user?.userType !== 'organizer') {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage sessions for your event, linking them to speakers.
        </p>
      </div>

      <SessionManager eventId={id} />
    </div>
  );
}
