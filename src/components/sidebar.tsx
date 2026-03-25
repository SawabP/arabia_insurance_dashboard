'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrainCircuit, LayoutDashboard, LogOut, Eye, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { logoutAction } from '@/app/auth/actions';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/monitoring', label: 'Monitoring', icon: Eye, exact: false },
    { href: '/ai-performance', label: 'AI Performance', icon: BrainCircuit, exact: false },
] as const;

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string, exact: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <div
            className={cn(
                'flex h-screen flex-col border-r bg-background/60 backdrop-blur-xl shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] transition-all duration-300 ease-in-out flex-shrink-0',
                collapsed ? 'w-[60px]' : 'w-64',
            )}
        >
            {/* Logo + collapse toggle */}
            <div className={cn('flex items-center h-24 px-2', collapsed ? 'justify-center' : 'justify-between')}>
                {!collapsed && (
                    <div className="relative h-20 flex-1">
                        <Image
                            src="/arabia-logowithoutbg.png"
                            alt="AIVA Logo"
                            fill
                            sizes="(max-width: 256px) 100vw"
                            className="object-contain"
                            priority
                        />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    className={cn(
                        'flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        collapsed && 'w-full',
                    )}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed
                        ? <PanelLeftOpen className="h-4 w-4" />
                        : <PanelLeftClose className="h-4 w-4" />
                    }
                </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 space-y-1.5 p-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(href, exact);
                    return (
                        <button
                            key={href}
                            onClick={() => router.push(href)}
                            title={collapsed ? label : undefined}
                            className={cn(
                                'w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                                collapsed ? 'justify-center' : 'gap-3',
                                active
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className={cn('h-4 w-4 flex-shrink-0 transition-colors', active ? 'text-primary-foreground' : 'group-hover:text-primary')} />
                            {!collapsed && <span>{label}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className={cn('border-t p-2 flex items-center', collapsed ? 'flex-col gap-2' : 'gap-2')}>
                <form action={logoutAction} className={collapsed ? 'w-full' : 'flex-1'}>
                    <button
                        type="submit"
                        title={collapsed ? 'Sign out' : undefined}
                        className={cn(
                            'flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground group',
                            collapsed ? 'justify-center' : 'gap-3',
                        )}
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-primary" />
                        {!collapsed && <span>Sign out</span>}
                    </button>
                </form>
                <ThemeToggle />
            </div>
        </div>
    );
}
