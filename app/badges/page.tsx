import React from 'react';
import { BadgesGallery } from '@/components/badges/badges-gallery';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speaker Badges & Web3 Achievements | SpeakWise',
  description: 'Verifiable on-chain reputation and achievement badges for public speakers on Base.',
};

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <BadgesGallery />
      </div>
    </div>
  );
}
