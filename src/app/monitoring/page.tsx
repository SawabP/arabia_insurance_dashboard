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

export default async function MonitoringPage({ searchParams }: PageProps) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = searchParams.startDate ?? formatDate(sevenDaysAgo);
    const endDate = searchParams.endDate ?? formatDate(yesterday);

    const initialData = await listMonitoringConversations({
        start_date: startDate,
        end_date: endDate,
        sort_by: 'grade_date',
        sort_direction: 'desc',
        limit: 50,
        offset: 0,
    });

    return (
        <div className="flex flex-col flex-1 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Conversations Monitoring</h2>
                    <p className="text-xs text-muted-foreground font-medium">
                        {initialData.total.toLocaleString()} conversations in selected window
                    </p>
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
