import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
    return (
        <div className="flex-1 p-4 h-screen">
            <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
                {/* Conversation list sidebar */}
                <div className="w-96 border-r border-border/30 flex flex-col">
                    <div className="p-4 border-b border-border/30 space-y-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 border-b border-border/40">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-border/30 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <Skeleton className={`h-12 rounded-xl ${i % 2 === 0 ? 'w-[60%]' : 'w-[45%]'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
