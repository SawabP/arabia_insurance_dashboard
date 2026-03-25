import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-8 pt-8 pb-4 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>
            <div className="border-b px-4 py-3 flex gap-3">
                <Skeleton className="h-8 w-[130px]" />
                <Skeleton className="h-8 w-[130px]" />
                <Skeleton className="h-8 w-[130px]" />
                <Skeleton className="h-8 w-[130px]" />
            </div>
            <div className="flex flex-1">
                <div className="flex-1 p-4 space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
