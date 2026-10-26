'use client';

import React, { useState } from 'react';
import { BadgeDefinition } from '@/lib/contracts/badges';
import { AwardBadgeIcon } from './award-badge-icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  Calendar, 
  Layers, 
  Wallet,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface CredentialModalProps {
  badge: BadgeDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  recipientAddress?: string | null;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.85 6.46a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
    </svg>
  );
}

export function CredentialModal({
  badge,
  isOpen,
  onClose,
  txHash,
  recipientAddress,
}: CredentialModalProps) {
  const [copiedTx, setCopiedTx] = useState(false);

  if (!badge) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const basescanUrl = txHash ? `https://sepolia.basescan.org/tx/${txHash}` : 'https://sepolia.basescan.org';

  const handleShareToTwitter = () => {
    const text = `🏆 Proud to earn the verified "${badge.name}" speaker badge on @SpeakWiseHQ!\n\nSoulbound on-chain proof of speaking impact on @base.\n\nVerify credential:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(basescanUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareToLinkedIn = () => {
    // LinkedIn maps company logos via organizationId (109397287 is SpeakWise on LinkedIn)
    const orgId = "109397287";
    const orgName = "SpeakWise";
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      badge.name + ' - Verified Speaker'
    )}&organizationId=${orgId}&organizationName=${encodeURIComponent(orgName)}&certUrl=${encodeURIComponent(basescanUrl)}&certId=${encodeURIComponent(badge.code)}&issueYear=${currentYear}&issueMonth=${currentMonth}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyTx = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopiedTx(true);
      toast.success('Transaction hash copied to clipboard');
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border/80 shadow-2xl rounded-2xl">
        {/* Subtle Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-primary to-blue-600" />

        <div className="p-6 space-y-6">
          <DialogHeader className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mx-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified On-Chain Soulbound Credential</span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              Milestone Achieved!
            </DialogTitle>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your achievement has been minted to Base Sepolia as a non-transferable speaker credential.
            </p>
          </DialogHeader>

          {/* Center Credential Showcase Card */}
          <div className="relative rounded-2xl border border-border/70 bg-gradient-to-b from-muted/30 to-background p-6 flex flex-col items-center text-center space-y-4 shadow-inner">
            <div className="relative">
              <AwardBadgeIcon 
                tier={badge.tier}
                size={80}
                badgeId={badge.id}
                isLocked={false}
              />


              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[10px] font-bold shadow-md" title="Minted on Base">
                B
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {badge.name}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm line-clamp-2">
                {badge.description}
              </p>
            </div>

            {/* Spec Details Table */}
            <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-left">
              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <Layers className="w-3 h-3" />
                  <span>Tier / Token</span>
                </div>
                <div className="text-xs font-semibold text-foreground capitalize">
                  {badge.tier} Tier #{badge.id}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <Calendar className="w-3 h-3" />
                  <span>Network</span>
                </div>
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0052FF]" />
                  Base Sepolia
                </div>
              </div>

              {recipientAddress && (
                <div className="col-span-2 p-2.5 rounded-lg bg-card/60 border border-border/40 space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    <Wallet className="w-3 h-3" />
                    <span>Recipient Soulbound Wallet</span>
                  </div>
                  <div className="text-xs font-mono text-foreground truncate">
                    {recipientAddress}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Proof & BaseScan Verification Row */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">
              Showcase Your Credential
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                className="w-full text-xs h-9 rounded-xl border-border/80 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 hover:text-[#0A66C2] font-semibold transition-all flex items-center justify-center gap-2"
                onClick={handleShareToLinkedIn}
              >
                <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                <span>Add to LinkedIn</span>
              </Button>

              <Button
                variant="outline"
                className="w-full text-xs h-9 rounded-xl border-border/80 hover:bg-muted font-semibold transition-all flex items-center justify-center gap-2"
                onClick={handleShareToTwitter}
              >
                <XIcon className="w-3.5 h-3.5" />
                <span>Share to X</span>
              </Button>
            </div>

            {/* BaseScan Explorer Link */}
            {txHash && (
              <a
                href={basescanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all text-xs font-medium text-muted-foreground hover:text-foreground group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="truncate font-mono text-[11px]">Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-primary flex-shrink-0 group-hover:underline">
                  <span>BaseScan</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            )}
          </div>

          <Button 
            className="w-full h-9 rounded-xl font-medium"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
