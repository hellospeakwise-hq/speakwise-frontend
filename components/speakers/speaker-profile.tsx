'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin, Globe, Twitter, Linkedin, Github as GithubIcon,
  Loader2, ExternalLink, Building2, UserPlus, UserMinus,
  Users, Calendar, MessageSquare, Mic, Zap, Award,
  Star, ChevronRight, Sparkles, Link as LinkIcon,
} from 'lucide-react';
import { speakerApi, type Speaker } from '@/lib/api/speakerApi';
import { organizationApi } from '@/lib/api/organizationApi';
import { useAuth } from '@/contexts/auth-context';
import { ExperiencesList } from './experiences-list';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface SpeakerProfileProps {
  id: string;
  initialData?: Speaker | null;
}

// ── Placeholder achievement badges (Web3 will power real ones later) ──────────
const PLACEHOLDER_ACHIEVEMENTS = [
  { emoji: '🎤', label: 'Speaker', color: 'from-orange-500 to-amber-400' },
  { emoji: '⭐', label: 'Rising Star', color: 'from-yellow-500 to-orange-400' },
  { emoji: '🌍', label: 'Global Voice', color: 'from-green-500 to-teal-400' },
  { emoji: '🔥', label: 'Trending', color: 'from-red-500 to-orange-400' },
];

export function SpeakerProfile({ id, initialData }: SpeakerProfileProps) {
  const { isAuthenticated, user } = useAuth();
  const [speaker, setSpeaker] = useState<Speaker | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [hasApprovedOrg, setHasApprovedOrg] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'talks' | 'contact'>('overview');

  // Stats
  const [totalTalks, setTotalTalks] = useState(0);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // ── Load speaker data ───────────────────────────────────────────────────────
  useEffect(() => {
    const checkOrganizations = async () => {
      if (!isAuthenticated) { setHasApprovedOrg(false); return; }
      try {
        const orgs = await organizationApi.getUserOrganizations();
        setHasApprovedOrg(orgs.some((o) => o.is_active === true));
      } catch { setHasApprovedOrg(false); }
    };
    checkOrganizations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (initialData) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await speakerApi.getSpeakerByIdOrUsername(id);
        setSpeaker(data);
        setFollowersCount(data.followers_count ?? 0);
      } catch {
        setError('Failed to load speaker profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, initialData]);

  // ── Follow status ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!speaker) return;
    const slug = speaker.slug || id;
    setFollowersCount(speaker.followers_count ?? 0);
    if (!isAuthenticated) return;
    speakerApi.getFollowStatus(slug)
      .then((s) => { setIsFollowing(s.is_following); setFollowersCount(s.followers_count); })
      .catch(() => {});
  }, [speaker, isAuthenticated, id]);

  const handleFollow = useCallback(async () => {
    if (!speaker) return;
    const slug = speaker.slug || id;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await speakerApi.unfollowSpeaker(slug);
        setIsFollowing(false);
        setFollowersCount(res.followers_count);
      } else {
        const res = await speakerApi.followSpeaker(slug);
        setIsFollowing(true);
        setFollowersCount(res.followers_count);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  }, [speaker, id, isFollowing]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;
    return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Social links helpers
  const getSocial = (platform: string) =>
    speaker?.social_links?.find((l) => l.name.toLowerCase().includes(platform))?.link;

  const otherLinks = speaker?.social_links?.filter((l) =>
    !['twitter', 'linkedin', 'github'].some((p) => l.name.toLowerCase().includes(p))
  ) ?? [];

  // ── Loading & error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-zinc-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !speaker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">{error || 'Speaker not found'}</p>
          <Link href="/speakers">
            <Button variant="outline">← Back to Speakers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const speakerName = speaker.speaker_name || `Speaker ${speaker.id}`;
  const isOwnProfile = speaker.user_account === user?.id;
  const twitter  = getSocial('twitter');
  const linkedin = getSocial('linkedin');
  const github   = getSocial('github');

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Back nav ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/speakers"
            className="inline-flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to Speakers
          </Link>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ════════════════════════════════════════════════════════════════════
              LEFT SIDEBAR
          ════════════════════════════════════════════════════════════════════ */}
          <aside className="w-full md:w-[296px] flex-shrink-0 space-y-5">

            {/* Avatar & name */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative">
                <Avatar className="w-[296px] h-[296px] md:w-full md:h-auto aspect-square rounded-full border-2 border-[#30363d] shadow-2xl">
                  <AvatarImage src={getAvatarUrl(speaker.avatar)} alt={speakerName} className="object-cover" />
                  <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-orange-500 to-amber-400 text-white rounded-full">
                    {getInitials(speakerName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-green-500 border-2 border-[#0d1117]" title="Active" />
              </div>

              {/* Name block */}
              <div className="w-full md:text-left text-center">
                <h1 className="text-2xl font-bold text-[#e6edf3] leading-tight">{speakerName}</h1>
                {speaker.slug && (
                  <p className="text-lg text-[#8b949e] font-normal mt-0.5">@{speaker.slug}</p>
                )}
                {speaker.organization && (
                  <p className="text-sm text-[#8b949e] mt-1">{speaker.organization}</p>
                )}
              </div>
            </div>

            {/* Follow / Request buttons */}
            <div className="space-y-2 w-full">
              {!isOwnProfile && (
                isAuthenticated ? (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`w-full h-8 text-sm font-medium rounded-md transition-all gap-1.5 ${
                      isFollowing
                        ? 'bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:bg-[#292e36] hover:border-red-500 hover:text-red-400'
                        : 'bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:bg-[#292e36] hover:border-[#8b949e]'
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isFollowing ? (
                      <UserMinus className="h-3.5 w-3.5" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                    {followLoading ? 'Updating…' : isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                ) : (
                  <Link href="/signin" className="block">
                    <Button className="w-full h-8 text-sm font-medium rounded-md bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:bg-[#292e36] gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Follow
                    </Button>
                  </Link>
                )
              )}

              {/* Sponsor / Gift (Web3 teaser) */}
              <Button
                disabled
                className="w-full h-8 text-sm font-medium rounded-md bg-[#21262d] border border-[#30363d] text-[#8b949e] gap-1.5 cursor-not-allowed relative overflow-hidden"
              >
                <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-orange-400">Support on-chain</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">Soon</span>
              </Button>

              {/* Request as speaker */}
              {isAuthenticated && (
                hasApprovedOrg ? (
                  <Link href={`/speakers/${id}/request`}>
                    <Button className="w-full h-8 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white border-0 gap-1.5">
                      <Mic className="h-3.5 w-3.5" />
                      Request as Speaker
                    </Button>
                  </Link>
                ) : (
                  <div className="relative group">
                    <Button disabled className="w-full h-8 text-sm font-medium rounded-md bg-[#21262d] border border-[#30363d] text-[#8b949e] gap-1.5 cursor-not-allowed">
                      <Mic className="h-3.5 w-3.5" />
                      Request as Speaker
                    </Button>
                    <div className="absolute left-0 right-0 mt-1.5 p-2.5 bg-[#161b22] border border-[#30363d] rounded-md text-xs text-[#8b949e] hidden group-hover:block z-10">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        You need an approved org.{' '}
                        <Link href="/organizations" className="text-orange-400 hover:underline">Create one →</Link>
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Bio */}
            {speaker.short_bio && (
              <p className="text-sm text-[#e6edf3] leading-relaxed">{speaker.short_bio}</p>
            )}

            {/* Followers / Following stats */}
            <div className="flex items-center gap-4 text-sm">
              <button className="flex items-center gap-1.5 text-[#e6edf3] hover:text-orange-400 transition-colors">
                <Users className="h-4 w-4 text-[#8b949e]" />
                <span className="font-bold">{followersCount}</span>
                <span className="text-[#8b949e]">followers</span>
              </button>
              <span className="text-[#30363d]">·</span>
              <button className="flex items-center gap-1.5 text-[#e6edf3] hover:text-orange-400 transition-colors">
                <span className="font-bold">0</span>
                <span className="text-[#8b949e]">following</span>
              </button>
            </div>

            {/* Meta info */}
            <div className="space-y-2 text-sm text-[#8b949e]">
              {speaker.organization && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span>{speaker.organization}</span>
                </div>
              )}
              {speaker.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{speaker.country}</span>
                </div>
              )}
              {otherLinks[0] && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <a href={otherLinks[0].link} target="_blank" rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline truncate">
                    {otherLinks[0].link.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {twitter && (
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 flex-shrink-0" />
                  <a href={twitter} target="_blank" rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline">
                    @{twitter.split('/').pop()}
                  </a>
                </div>
              )}
              {linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 flex-shrink-0" />
                  <a href={linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
              {github && (
                <div className="flex items-center gap-2">
                  <GithubIcon className="h-4 w-4 flex-shrink-0" />
                  <a href={github} target="_blank" rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline">
                    {github.split('/').pop()}
                  </a>
                </div>
              )}
            </div>

            {/* Skill Tags */}
            {speaker.skill_tags && speaker.skill_tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {speaker.skill_tags.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1f2937] border border-[#30363d] text-[#8b949e] hover:border-orange-500 hover:text-orange-400 transition-colors cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Achievements (GitHub-style badges) ──────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Achievements</p>
                <span className="text-[10px] text-orange-400 border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Web3 Soon
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDER_ACHIEVEMENTS.map((a) => (
                  <div
                    key={a.label}
                    title={a.label}
                    className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center text-lg shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                  >
                    {a.emoji}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#161b22] border border-[#30363d] text-[10px] text-[#e6edf3] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      {a.label}
                    </div>
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#30363d] flex items-center justify-center text-[#8b949e] hover:border-orange-500 transition-colors cursor-pointer" title="More coming with Web3">
                  <span className="text-xs font-bold">+</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8b949e] leading-snug">
                Earn on-chain badges for speaking milestones — coming soon with Web3.
              </p>
            </div>
          </aside>

          {/* ════════════════════════════════════════════════════════════════════
              RIGHT MAIN CONTENT
          ════════════════════════════════════════════════════════════════════ */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: 'Followers', value: followersCount, color: 'text-orange-400' },
                { icon: Mic, label: 'Talks', value: totalTalks, color: 'text-blue-400' },
                { icon: Star, label: 'Rating', value: '—', color: 'text-yellow-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    {label}
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── Tab bar ─────────────────────────────────────────────────── */}
            <div className="border-b border-[#30363d] flex gap-0 overflow-x-auto">
              {(['overview', 'talks', 'contact'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-orange-500 text-[#e6edf3]'
                      : 'border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e]'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' : tab === 'talks' ? 'Speaking History' : 'Contact'}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* README-style About card */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-[#30363d] px-4 py-2.5 bg-[#161b22]">
                    <GithubIcon className="h-4 w-4 text-[#8b949e]" />
                    <span className="text-sm text-[#8b949e]">
                      <span className="text-[#e6edf3] font-medium">{speaker.slug || speakerName}</span>
                      {' '}/{' '}
                      <span className="text-[#e6edf3] font-medium">README.md</span>
                    </span>
                  </div>
                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-bold">
                      Hey, I'm {speakerName.split(' ')[0]} 👋
                    </h2>
                    {(speaker as any).long_bio ? (
                      <p className="text-[#8b949e] leading-relaxed whitespace-pre-wrap text-sm">
                        {(speaker as any).long_bio}
                      </p>
                    ) : speaker.short_bio ? (
                      <p className="text-[#8b949e] leading-relaxed text-sm">{speaker.short_bio}</p>
                    ) : (
                      <p className="text-[#8b949e] italic text-sm">This speaker hasn't written a bio yet.</p>
                    )}

                    {/* Quick info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        speaker.organization && { icon: Building2, text: speaker.organization },
                        speaker.country && { icon: MapPin, text: speaker.country },
                      ].filter(Boolean).map((item: any, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-[#8b949e]">
                          <item.icon className="h-4 w-4 text-orange-400 flex-shrink-0" />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills section */}
                {speaker.skill_tags && speaker.skill_tags.length > 0 && (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
                      <Award className="h-4 w-4 text-orange-400" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {speaker.skill_tags.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-sm hover:border-orange-500 transition-colors group"
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500 group-hover:bg-orange-400 transition-colors" />
                          <span className="text-[#e6edf3]">{skill.name}</span>
                          {skill.duration && (
                            <span className="text-[#8b949e] text-xs">· {skill.duration}yr{skill.duration > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Web3 Earnings teaser */}
                <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/20 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#e6edf3]">
                        Web3 Earnings — Coming Soon 🚀
                      </h3>
                      <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
                        Speakers on SpeakWise will soon be able to earn crypto tokens for every talk they give,
                        unlock on-chain achievement badges, and receive on-chain tips from event organizers.
                        Like GitHub sponsorships — but on the blockchain.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['🪙 Token Rewards', '🏅 On-chain Badges', '💸 Instant Payouts', '🔗 NFT Certificates'].map((t) => (
                          <span key={t} className="text-[10px] text-orange-400 border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SPEAKING HISTORY TAB ──────────────────────────────────── */}
            {activeTab === 'talks' && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-orange-400" />
                  Conference Talks & Presentations
                </h3>
                <ExperiencesList speakerSlug={id} />
              </div>
            )}

            {/* ── CONTACT TAB ───────────────────────────────────────────── */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                {/* CTA card */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-400" />
                    Connect with {speakerName.split(' ')[0]}
                  </h3>

                  {speaker.social_links && speaker.social_links.length > 0 ? (
                    <div className="space-y-2">
                      {speaker.social_links.map((link, i) => (
                        <a
                          key={i}
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#30363d] rounded-md hover:border-orange-500 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="h-4 w-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#e6edf3]">{link.name}</p>
                              <p className="text-xs text-[#8b949e] truncate max-w-[260px]">{link.link}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#8b949e] group-hover:text-orange-400 transition-colors" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8b949e] italic">No social links added yet.</p>
                  )}
                </div>

                {/* Request to speak block */}
                {isAuthenticated ? (
                  hasApprovedOrg ? (
                    <Link href={`/speakers/${id}/request`}>
                      <div className="bg-[#161b22] border border-orange-500/30 rounded-lg p-5 flex items-center justify-between hover:border-orange-500 transition-colors cursor-pointer group">
                        <div>
                          <p className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
                            <Mic className="h-4 w-4 text-orange-400" />
                            Invite to your event
                          </p>
                          <p className="text-xs text-[#8b949e] mt-1">Send a speaker request from your organization</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      <p className="text-sm text-[#8b949e] flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        You need an approved organization to send a speaker request.{' '}
                        <Link href="/organizations" className="text-orange-400 hover:underline">Create one →</Link>
                      </p>
                    </div>
                  )
                ) : (
                  <Link href="/signin">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between hover:border-orange-500 transition-colors cursor-pointer group">
                      <div>
                        <p className="text-sm font-semibold text-[#e6edf3]">Sign in to invite this speaker</p>
                        <p className="text-xs text-[#8b949e] mt-1">Join SpeakWise to request speakers for your events</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#8b949e] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
