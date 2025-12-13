'use client';

import { useState, useEffect } from 'react';
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, MessageSquare, Globe, Twitter, Linkedin, Github, Loader2, Mail, ExternalLink, Building2, Award } from "lucide-react"
import { speakerApi, type Speaker } from '@/lib/api/speakerApi';
import { organizationApi } from '@/lib/api/organizationApi';
import { useAuth } from '@/contexts/auth-context';
import { ExperiencesList } from './experiences-list';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface SpeakerProfileProps {
  id: string
}

export function SpeakerProfile({ id }: SpeakerProfileProps) {
  const { isAuthenticated } = useAuth();
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApprovedOrg, setHasApprovedOrg] = useState(false);

  useEffect(() => {
    const checkOrganizations = async () => {
      if (!isAuthenticated) {
        setHasApprovedOrg(false);
        return;
      }

      try {
        const orgs = await organizationApi.getUserOrganizations();
        const approved = orgs.some(org => org.is_active === true);
        setHasApprovedOrg(approved);
      } catch (error) {
        console.error('Error checking organizations:', error);
        setHasApprovedOrg(false);
      }
    };

    checkOrganizations();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadSpeaker = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await speakerApi.getSpeakerById(id);
        setSpeaker(data);
      } catch (err) {
        console.error('Error fetching speaker:', err);
        setError('Failed to load speaker profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSpeaker();
    }
  }, [id]);

  // Helper function to construct full image URL
  const getAvatarUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return null;
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    // Otherwise, construct the full URL with the backend base URL
    return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-muted-foreground">Loading speaker profile...</span>
      </div>
    );
  }

  if (error || !speaker) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || 'Speaker not found'}</p>
        <Button asChild className="mt-4">
          <Link href="/speakers">Back to Speakers</Link>
        </Button>
      </div>
    );
  }

  // Extract social media links
  const getSocialLinks = (speaker: Speaker) => ({
    twitter: speaker.social_links?.find((link) => link.name.toLowerCase().includes('twitter'))?.link,
    linkedin: speaker.social_links?.find((link) => link.name.toLowerCase().includes('linkedin'))?.link,
    github: speaker.social_links?.find((link) => link.name.toLowerCase().includes('github'))?.link,
    website: speaker.social_links?.find((link) =>
      !link.name.toLowerCase().includes('twitter') &&
      !link.name.toLowerCase().includes('linkedin') &&
      !link.name.toLowerCase().includes('github')
    )?.link,
  })  // For now, use placeholder data for features not yet implemented in backend
  const placeholderStats = {
    averageRating: 4.8,
    totalReviews: 12,
    totalEvents: 5,
    countries: 3,
  };

  const socials = speaker ? getSocialLinks(speaker) : { twitter: null, linkedin: null, github: null, website: null };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage
                    src={getAvatarUrl(speaker.avatar) || undefined}
                    alt={speaker.speaker_name || "Speaker"}
                    onError={(e) => {
                      console.error('Avatar failed to load:', speaker.avatar);
                    }}
                  />
                  <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                    {(speaker.speaker_name || `Speaker ${speaker.id}`).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{speaker.speaker_name || `Speaker ${speaker.id}`}</h2>
                <p className="text-muted-foreground">{speaker.organization || 'Independent Speaker'}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {speaker.country || 'Location not specified'}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-medium">{placeholderStats.averageRating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{placeholderStats.totalReviews} reviews</span>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  {socials.twitter && (
                    <a
                      href={socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="sr-only">Twitter</span>
                    </a>
                  )}
                  {socials.linkedin && (
                    <a
                      href={socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  )}
                  {socials.github && (
                    <a
                      href={socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  )}
                  {socials.website && (
                    <a
                      href={socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="sr-only">Website</span>
                    </a>
                  )}
                </div>

                <div className="w-full mt-6 space-y-2">
                  {isAuthenticated ? (
                    hasApprovedOrg ? (
                      <Link href={`/speakers/${id}/request`}>
                        <Button className="w-full">
                          Request as Speaker
                        </Button>
                      </Link>
                    ) : (
                      <div className="relative">
                        <Button className="w-full" disabled>
                          Request as Speaker
                        </Button>
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <Building2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>
                              You need an approved organization to request speakers.
                              <Link href="/organizations" className="text-orange-500 hover:underline ml-1">
                                Create or view your organizations
                              </Link>
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <Link href="/signin">
                        <Button className="w-full">Sign in to Request Speaker</Button>
                      </Link>
                    </div>
                  )}
                  <div className="relative">
                    <Button variant="outline" className="w-full" disabled>
                      Gift Speaker
                    </Button>
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {speaker.skill_tag && speaker.skill_tag.length > 0 ? (
                  speaker.skill_tag.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills specified yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Speaking Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-bold">{placeholderStats.averageRating}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-primary mr-1" />
                    <span className="font-bold">{placeholderStats.totalReviews}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Events</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-1" />
                    <span className="font-bold">{placeholderStats.totalEvents}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Countries</p>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-primary mr-1" />
                    <span className="font-bold">{placeholderStats.countries}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {speaker.speaker_name || `Speaker ${speaker.id}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {speaker.short_bio || 'No bio available yet.'}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="bio">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bio">Biography</TabsTrigger>
              <TabsTrigger value="experiences">Speaking Experience</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="bio" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Background</CardTitle>
                  <CardDescription>
                    Learn more about {(speaker.speaker_name || `Speaker ${speaker.id}`).split(" ")[0]}&apos;s experience and expertise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(speaker as any).long_bio ? (
                      <div>
                        <h4 className="font-medium mb-2">Detailed Bio</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {(speaker as any).long_bio}
                        </p>
                      </div>
                    ) : speaker.short_bio ? (
                      <div>
                        <h4 className="font-medium mb-2">Bio</h4>
                        <p className="text-sm text-muted-foreground">
                          {speaker.short_bio}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No biography available yet. This speaker profile is still being updated.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="experiences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Conference Talks & Presentations
                  </CardTitle>
                  <CardDescription>
                    Past speaking engagements and conference presentations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExperiencesList speakerId={parseInt(id)} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="contact" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Get in Touch</CardTitle>
                  <CardDescription>
                    Connect with {(speaker.speaker_name || `Speaker ${speaker.id}`).split(" ")[0]} through their professional networks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(speaker as any).social_links && (speaker as any).social_links.length > 0 ? (
                      (speaker as any).social_links.map((link: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <ExternalLink className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">{link.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {link.link}
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit
                            </a>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No social links available yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
