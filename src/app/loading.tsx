import { Skeleton } from '@/components/ui/skeleton';
import { DashboardContentSkeleton } from '@/components/dashboard/dashboard-content-skeleton';

export default function DashboardLoading() {
    return (
        <div className="flex-1 space-y-6 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-[260px] rounded-md" />
            </div>

            <DashboardContentSkeleton />
        </div>
    );
}
