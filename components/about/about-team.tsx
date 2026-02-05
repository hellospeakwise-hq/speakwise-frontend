"use client"

import { useState, useEffect } from "react"
import { Github, Linkedin, Twitter, Instagram } from "lucide-react"
import { fetchTeamMembers, TeamMember } from "@/lib/api/teamApi"

export function AboutTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true)
        const members = await fetchTeamMembers()
        setTeamMembers(members)
      } catch (err) {
        console.error('Failed to fetch team members:', err)
        setError('Failed to load team members')
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamMembers()
  }, [])

  if (isLoading) {
    return (
      <section className="container px-4 py-8 md:py-12 lg:py-24 border-t">
        <div className="flex justify-center">
          <div className="text-lg">Loading team members...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container px-4 py-8 md:py-12 lg:py-24 border-t">
        <div className="flex justify-center">
          <div className="text-lg text-destructive">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="container px-4 py-8 md:py-12 lg:py-24 border-t">
      <div className="mx-auto max-w-[58rem] space-y-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Meet Our Team</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            The passionate people behind SpeakWise who are dedicated to improving the conference experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="rounded-lg border bg-background p-8 flex flex-col items-center text-center space-y-4 min-w-[280px]">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                <img
                  src={member.avatar_url || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-sm font-medium text-muted-foreground">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-2">{member.short_bio}</p>
              </div>
              <div className="flex space-x-3">
                {member.social_links?.map((link, index) => {
                  // Add safety checks for link and link.name
                  if (!link || !link.name || !link.link) return null
                  
                  const platform = link.name.toLowerCase()
                  let Icon = null
                  let label = link.name

                  switch (platform) {
                    case 'twitter':
                      Icon = Twitter
                      label = 'Twitter'
                      break
                    case 'linkedin':
                      Icon = Linkedin
                      label = 'LinkedIn'
                      break
                    case 'github':
                      Icon = Github
                      label = 'GitHub'
                      break
                    case 'instagram':
                      Icon = Instagram
                      label = 'Instagram'
                      break
                    default:
                      return null
                  }

                  return Icon ? (
                    <a
                      key={index}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{label}</span>
                    </a>
                  ) : null
                })}
              </div>
            </div>
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
