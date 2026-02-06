'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, MessageSquare, Bell } from 'lucide-react';

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const router = useRouter();

    const navigate = (href: string) => {
        router.push(href);
    };

    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
            {...props}
        >
            <button
                onClick={() => navigate('/')}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
            >
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                </div>
            </button>
            <button
                onClick={() => navigate('/messages')}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/messages" ? "text-primary" : "text-muted-foreground"
                )}
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                </div>
            </button>
            <button
                onClick={() => navigate('/notifications')}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/notifications" ? "text-primary" : "text-muted-foreground"
                )}
            >
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                </div>
            </button>
        </nav>
    );
}
