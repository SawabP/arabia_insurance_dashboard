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

    return (
        <MonitoringShell
            initialData={initialData}
            initialStartDate={startDate}
            initialEndDate={endDate}
        />
    );
}
