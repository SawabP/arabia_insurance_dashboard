import { Skeleton } from '@/components/ui/skeleton';

export function DashboardContentSkeleton() {
    return (
        <div data-testid="dashboard-content-skeleton" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
                        <Skeleton className="h-5 w-5 rounded-lg" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <div className="col-span-2 rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="p-6">
                        <Skeleton className="h-[350px] w-full rounded-lg" />
                    </div>
                </div>

                <div className="col-span-2 rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="p-6">
                        <Skeleton className="h-[350px] w-full rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card">
                <div className="p-4 border-b">
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-4 p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
