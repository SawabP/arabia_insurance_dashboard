'use client';

import { useCallback, useEffect, useState, useTransition, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChannelSelector } from '@/components/dashboard/channel-selector';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { DashboardContentSkeleton } from '@/components/dashboard/dashboard-content-skeleton';

interface DashboardPageShellProps {
    children: ReactNode;
}

export function DashboardPageShell({ children }: DashboardPageShellProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        setIsNavigating(false);
    }, [searchParams]);

    const handleNavigate = useCallback((href: string) => {
        setIsNavigating(true);
        startTransition(() => {
            router.push(href);
        });
    }, [router]);

    return (
        <div className="flex-1 space-y-6 p-8 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">AIVA Control Center</h2>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                            </span>
                            Backend API: Connected
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Authenticated session
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ChannelSelector onNavigate={handleNavigate} />
                    <DateRangePicker onNavigate={handleNavigate} />
                </div>
            </div>

            {isNavigating ? <DashboardContentSkeleton /> : children}
        </div>
    );
}
