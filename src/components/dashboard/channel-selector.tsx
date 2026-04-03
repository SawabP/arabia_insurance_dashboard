'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { MessageSquare, Mail, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const channels = [
    { id: 'all', label: 'All Channels', icon: Layers },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'web', label: 'Email', icon: Mail },
];

interface ChannelSelectorProps {
    onNavigate?: (href: string) => void;
}

export function ChannelSelector({ onNavigate }: ChannelSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentChannel = searchParams.get('channel') || 'all';

    const handleChannelChange = useCallback((channelId: string) => {
        const params = new URLSearchParams(searchParams);
        if (channelId === 'all') {
            params.delete('channel');
        } else {
            params.set('channel', channelId);
        }
        const href = `?${params.toString()}`;
        if (onNavigate) {
            onNavigate(href);
            return;
        }
        router.push(href);
    }, [onNavigate, router, searchParams]);

    return (
        <div className="flex bg-muted/50 p-1 rounded-lg border">
            {channels.map((channel) => {
                const Icon = channel.icon;
                const isActive = currentChannel === channel.id;

                return (
                    <button
                        key={channel.id}
                        onClick={() => handleChannelChange(channel.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all rounded-md",
                            isActive
                                ? "bg-white dark:bg-slate-900 shadow-sm text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                        {channel.label}
                    </button>
                );
            })}
        </div>
    );
}
