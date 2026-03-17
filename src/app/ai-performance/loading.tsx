import { Skeleton } from '@/components/ui/skeleton';

export default function AiPerformanceLoading() {
    return (
        <div className="flex-1 space-y-6 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-[260px] rounded-md" />
            </div>

            {/* Tab bar */}
            <div className="flex gap-0 border-b pb-0">
                <Skeleton className="h-8 w-24 rounded-none" />
                <Skeleton className="h-8 w-24 rounded-none" />
                <Skeleton className="h-8 w-28 rounded-none" />
            </div>

            {/* Score ring + dimension bars */}
            <div className="rounded-xl border bg-card p-6 flex gap-6">
                <Skeleton className="h-[140px] w-[140px] rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3 pt-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-3 w-[100px]" />
                            <Skeleton className="h-1.5 flex-1 rounded-full" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Health cards */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                ))}
            </div>

            {/* Escalation strip */}
            <Skeleton className="h-2.5 w-full rounded-full" />

            {/* User signals */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-6 w-12" />
                    </div>
                ))}
            </div>

            {/* Trend chart */}
            <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
    );
}
