import { getAgentPulse, getCorrelations, getDailyTimeline } from '@/app/actions/grades';
import { AiPerformanceDashboard } from '@/components/ai-performance/ai-performance-dashboard';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';

interface PageProps {
    searchParams: {
        startDate?: string;
        endDate?: string;
    };
}

export const dynamic = 'force-dynamic';

export default async function AiPerformancePage({ searchParams }: PageProps) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const eightDaysAgo = new Date(today);
    eightDaysAgo.setDate(today.getDate() - 8);

    // Backend requires end_date <= previous GST day (yesterday)
    const startDate = searchParams.startDate ? new Date(searchParams.startDate) : eightDaysAgo;
    startDate.setHours(0, 0, 0, 0);

    const endDate = searchParams.endDate ? new Date(searchParams.endDate) : yesterday;
    endDate.setHours(0, 0, 0, 0);

    const [agentPulse, correlations, dailyTimeline] = await Promise.all([
        getAgentPulse(startDate, endDate),
        getCorrelations(startDate, endDate),
        getDailyTimeline(endDate),
    ]);

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">AI Agent Performance</h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex h-2 w-2 rounded-full bg-primary/60" />
                            {agentPulse.total_graded_customer_days} graded conversations
                        </div>
                        {agentPulse.freshness.latest_successful_window_end_date && (
                            <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                Data through {agentPulse.freshness.latest_successful_window_end_date}
                            </div>
                        )}
                    </div>
                </div>
                <DateRangePicker />
            </div>

            <AiPerformanceDashboard
                agentPulse={agentPulse}
                correlations={correlations}
                dailyTimeline={dailyTimeline}
            />
        </div>
    );
}
