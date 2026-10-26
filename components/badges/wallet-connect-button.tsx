'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, AlertTriangle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function WalletConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [demoAddress, setDemoAddress] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setDemoAddress(localStorage.getItem('speakwise_demo_wallet'));
      const onWalletChange = () => {
        setDemoAddress(localStorage.getItem('speakwise_demo_wallet'));
      };
      window.addEventListener('speakwise-wallet-changed', onWalletChange);
      return () => window.removeEventListener('speakwise-wallet-changed', onWalletChange);
    }
  }, []);

  const activeAddress = address || demoAddress;
  const isWalletConnected = isConnected || Boolean(demoAddress);
  const isWrongChain = isConnected && chainId !== baseSepolia.id;

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async (connector: any) => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isMetaMask = connector.name.toLowerCase() === 'injected' || connector.name.toLowerCase().includes('metamask');

    // On mobile devices without an injected web3 provider, mobile browsers (Chrome/Safari) don't support desktop extensions
    if (isMetaMask && isMobile && typeof window !== 'undefined' && !(window as any).ethereum) {
      const dappUrl = window.location.href.replace(/^https?:\/\//, '');
      const metamaskUrl = `https://metamask.app.link/dapp/${dappUrl}`;
      
      toast.info('Opening MetaMask App...', {
        description: 'Mobile browsers do not support extensions. Opening via MetaMask or use Demo Wallet below.',
        action: {
          label: 'Open MetaMask',
          onClick: () => {
            window.location.href = metamaskUrl;
          },
        },
        duration: 8000,
      });
      setOpen(false);
      window.location.href = metamaskUrl;
      return;
    }

    try {
      await connectAsync({ connector, chainId: baseSepolia.id });
      setOpen(false);
      toast.success('Wallet connected to Base Sepolia!');
    } catch (err: any) {
      if (err?.name === 'UserRejectedRequestError') {
        toast.info('Connection request cancelled');
      } else if (
        err?.name === 'ProviderNotFoundError' || 
        err?.message?.toLowerCase().includes('provider not found')
      ) {
        toast.error('MetaMask extension not detected', {
          description: isMobile
            ? 'Mobile browsers do not support extensions. Open this page inside MetaMask app or use Demo Wallet.'
            : 'Install MetaMask from metamask.io or click "Demo Test Wallet" for instant testing.',
          action: {
            label: isMobile ? 'Use Demo Wallet' : 'Get MetaMask',
            onClick: () => {
              if (isMobile) {
                handleConnectDemo();
              } else {
                window.open('https://metamask.io/download/', '_blank');
              }
            },
          },
          duration: 7000,
        });
      } else {
        toast.error(err?.message || 'Failed to connect wallet');
      }
    }
  };

  const handleConnectDemo = () => {
    const mockAddr = '0x71C2a8D9bB3e1F24c6eA847b2De60E1894C2b41E';
    if (typeof window !== 'undefined') {
      localStorage.setItem('speakwise_demo_wallet', mockAddr);
      window.dispatchEvent(new Event('speakwise-wallet-changed'));
    }
    setDemoAddress(mockAddr);
    setOpen(false);
    toast.success('Connected to Base Sepolia (Demo Wallet)!', {
      description: 'You can now claim eligible on-chain badges.',
    });
  };

  const handleDisconnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('speakwise_demo_wallet');
      window.dispatchEvent(new Event('speakwise-wallet-changed'));
    }
    setDemoAddress(null);
    disconnect();
    toast.info('Wallet disconnected');
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2 border-primary/30 bg-primary/10 text-primary text-xs font-medium opacity-80"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  if (isConnecting || isPending) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 border-primary/30 bg-primary/5">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span className="text-xs">Connecting...</span>
      </Button>
    );
  }

  if (isWalletConnected && activeAddress) {
    if (isWrongChain && isConnected) {
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          className="gap-2 text-xs"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Switch to Base</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-mono transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{truncateAddress(activeAddress)}</span>
            <span className="text-[10px] text-emerald-400/70 border-l border-emerald-500/30 pl-1.5 font-sans">
              Base
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Connected Wallet
            <div className="font-mono text-sm font-semibold text-foreground truncate mt-0.5">
              {activeAddress}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(activeAddress);
              toast.success('Address copied to clipboard!');
            }}
            className="text-xs cursor-pointer"
          >
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(`https://sepolia.basescan.org/address/${activeAddress}`, '_blank')}
            className="text-xs cursor-pointer"
          >
            View on BaseScan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="text-xs text-rose-400 focus:text-rose-400 cursor-pointer gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not connected
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Connect Wallet</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-2 space-y-1">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2.5 py-1.5 uppercase tracking-wider">
          Connect Wallet
        </DropdownMenuLabel>
        <div className="space-y-1 pt-1">
          {connectors.map((connector) => {
            const isCoinbase = connector.name.toLowerCase().includes('coinbase');
            const isMetaMask = connector.name.toLowerCase() === 'injected' || connector.name.toLowerCase().includes('metamask');
            
            const title = isMetaMask 
              ? 'MetaMask' 
              : isCoinbase 
              ? 'Coinbase Wallet' 
              : connector.name;

            const logo = isMetaMask ? (
              <Image
                src="/MetaMask-icon-fox.svg"
                alt="MetaMask"
                width={26}
                height={26}
                className="w-6 h-6 object-contain flex-shrink-0 group-hover:scale-110 transition-transform"
              />
            ) : isCoinbase ? (
              <Image
                src="/coinbase.png"
                alt="Coinbase Wallet"
                width={26}
                height={26}
                className="w-6 h-6 object-contain rounded-md flex-shrink-0 group-hover:scale-110 transition-transform"
              />
            ) : (
              <Wallet className="w-5 h-5 text-primary flex-shrink-0" />
            );

            return (
              <Button
                key={connector.uid}
                variant="ghost"
                size="sm"
                onClick={() => handleConnect(connector)}
                className="w-full justify-between px-3 py-2.5 h-11 flex items-center hover:bg-muted/80 active:bg-muted rounded-xl group transition-all"
              >
                <div className="flex items-center gap-3">
                  {logo}
                  <span className="text-sm font-semibold text-foreground tracking-tight">
                    {title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Button>
            );
          })}

          {/* Quick Demo Test Option */}
          <div className="pt-2 mt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleConnectDemo}
              className="w-full justify-between px-3 py-2.5 h-10 flex items-center hover:bg-amber-500/10 text-amber-400 rounded-xl group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">⚡</span>
                <span className="text-xs font-semibold tracking-tight text-foreground group-hover:text-amber-400 transition-colors">
                  Demo Test Wallet
                </span>
              </div>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-medium">
                Instant Test
              </span>
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
