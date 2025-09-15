"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Twitter, Instagram } from "lucide-react"
import { teamApi, TeamMember } from "@/lib/api/teamApi"

export function AboutTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true)
        const members = await teamApi.getTeamMembers()
        setTeamMembers(members)
      } catch (err) {
        console.error('Failed to fetch team members:', err)
        setError('Failed to load team members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  if (isLoading) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50 dark:bg-orange-900/5">
        <div className="container px-4 md:px-6">
          <div className="flex justify-center">
            <div className="text-lg">Loading team members...</div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50 dark:bg-orange-900/5">
        <div className="container px-4 md:px-6">
          <div className="flex justify-center">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50 dark:bg-orange-900/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Meet Our Team</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              The passionate people behind SpeakWise who are dedicated to improving the conference experience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="bg-white dark:bg-background border-orange-100 dark:border-orange-900/20">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-100">
                  <img
                    src={member.avatar_url || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">{member.role}</p>
                  <p className="text-muted-foreground mt-2">{member.short_bio}</p>
                </div>
                <div className="flex space-x-3">
                  {member.twitter_url && (
                    <a
                      href={member.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-orange-500"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="sr-only">Twitter</span>
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-orange-500"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  )}
                  {member.github_url && (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-orange-500"
                    >
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  )}
                  {member.instagram_url && (
                    <a
                      href={member.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-orange-500"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="sr-only">Instagram</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {teamMembers.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">No team members found.</p>
          </div>
        )}
      </div>
    </section>
  )
}
