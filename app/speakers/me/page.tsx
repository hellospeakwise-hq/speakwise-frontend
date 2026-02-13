'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { userApi } from '@/lib/api/userApi';
import { speakerApi, Speaker } from '@/lib/api/speakerApi';
import { SpeakerProfile } from '@/components/speakers/speaker-profile';

export default function MySpeakerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [speakerData, setSpeakerData] = useState<Speaker | null>(null);
  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!isAuthenticated) {
        router.push('/signin?redirect=/speakers/me');
        return;
      }

      try {
        setLoading(true);
        // Use /api/users/me/ to get authenticated user's profile
        const profile = await userApi.getUserProfile();
        const data = profile as any;
        const speaker = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker;
        
        if (speaker?.id) {
          setSpeakerId(speaker.id.toString());
          
          // Also fetch skills from the new skills endpoint
          let userSkills = speaker.skill_tags || [];
          try {
            const skills = await speakerApi.getSkills();
            if (skills && skills.length > 0) {
              userSkills = skills;
            }
          } catch (err) {
            console.log('Could not fetch skills from /speakers/skills/', err);
          }
          
          // Transform to Speaker type
          setSpeakerData({
            id: speaker.id,
            speaker_name: speaker.speaker_name || `${data?.user?.first_name || ''} ${data?.user?.last_name || ''}`.trim() || 'Speaker',
            organization: speaker.organization || '',
            short_bio: speaker.short_bio || '',
            long_bio: speaker.long_bio || '',
            country: speaker.country || '',
            avatar: speaker.avatar || '',
            user_account: speaker.user_account || '',
            username: data?.user?.username,
            slug: speaker.slug,
            social_links: speaker.social_links || [],
            skill_tags: userSkills,
          });
        } else {
          setError('No speaker profile found. Please complete your profile setup.');
        }
      } catch (err) {
        console.error('Error fetching own profile:', err);
        setError('Failed to load your speaker profile.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchMyProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-muted-foreground">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Link
          href="/speakers"
          className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Speakers
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error}</p>
          <Link href="/profile" className="mt-4 inline-block text-orange-500 hover:underline">
            Go to Profile Settings
          </Link>
        </div>
      </div>
    );
  }

  if (!speakerId || !speakerData) {
    return null;
  }

  return (
    <div className="container py-10">
      <Link
        href="/speakers"
        className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Speakers
      </Link>
      <SpeakerProfile id={speakerId} initialData={speakerData} />
    </div>
  );
}
