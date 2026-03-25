import { listMonitoringConversations } from '@/app/actions/monitoring';
import { MonitoringShell } from '@/components/monitoring/monitoring-shell';

interface PageProps {
    searchParams: {
        startDate?: string;
        endDate?: string;
    };
}

export const dynamic = 'force-dynamic';

function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatHeaderDate(value?: string | null): string | null {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
}

export default async function MonitoringPage({ searchParams }: PageProps) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Cap end_date to yesterday -- backend requires end_date <= previous GST day
    const rawEnd = searchParams.endDate ? new Date(searchParams.endDate) : yesterday;
    rawEnd.setHours(0, 0, 0, 0);
    const endDateObj = rawEnd > yesterday ? yesterday : rawEnd;

    const startDate = searchParams.startDate ?? formatDate(sevenDaysAgo);
    const endDate = formatDate(endDateObj);

    const initialData = await listMonitoringConversations({
        start_date: startDate,
        end_date: endDate,
        sort_direction: 'desc',
        limit: 50,
        offset: 0,
    });

    const freshnessDate = formatHeaderDate(initialData.freshness.latest_successful_window_end_date);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#FAFAFA]">
            <div className="px-10 pt-8">
                <div className="space-y-3">
                    <h1 className="text-[2.25rem] font-extrabold tracking-[-0.04em] text-[#1A1917]">
                        Conversations Monitoring
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#8B8796]">
                        {freshnessDate && (
                            <>
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
                                <span>Data through {freshnessDate}</span>
                                <span className="h-3 w-px bg-[#E8E5DF]" />
                            </>
                        )}
                        <span>{initialData.total.toLocaleString()} conversations</span>
                    </div>
                </div>
            </div>
            <MonitoringShell
                initialData={initialData}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />
        </div>
    );
}
