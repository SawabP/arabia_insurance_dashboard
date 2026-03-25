'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrainCircuit, LayoutDashboard, LogOut, Eye } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { logoutAction } from '@/app/auth/actions';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const navigate = (href: string) => {
        router.push(href);
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background/60 backdrop-blur-xl shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
            <div className="flex h-24 items-center px-2">
                <div className="relative h-20 w-full">
                    <Image
                        src="/arabia-logowithoutbg.png"
                        alt="AIVA Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
            <div className="flex-1 space-y-1.5 p-4">
                <button
                    onClick={() => navigate('/')}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                        pathname === "/"
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className={cn("h-4 w-4 transition-colors", pathname === "/" ? "text-primary-foreground" : "group-hover:text-primary")} />
                    Dashboard
                </button>
                <button
                    onClick={() => navigate('/monitoring')}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                        pathname.startsWith("/monitoring")
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Eye className={cn("h-4 w-4 transition-colors", pathname.startsWith("/monitoring") ? "text-primary-foreground" : "group-hover:text-primary")} />
                    Monitoring
                </button>
                <button
                    onClick={() => navigate('/ai-performance')}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                        pathname.startsWith("/ai-performance")
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <BrainCircuit className={cn("h-4 w-4 transition-colors", pathname === "/ai-performance" ? "text-primary-foreground" : "group-hover:text-primary")} />
                    AI Performance
                </button>
            </div>
            <div className="p-4 border-t flex items-center gap-2">
                <form action={logoutAction} className="flex-1">
                    <button
                        type="submit"
                        className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground group"
                        )}
                    >
                        <LogOut className="h-4 w-4 transition-colors group-hover:text-primary" />
                        Sign out
                    </button>
                </form>
                <ThemeToggle />
            </div>
        </div>
    );
}
