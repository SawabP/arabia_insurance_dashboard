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
                    <p className="text-sm text-muted-foreground">
                        conversation_grades dashboard
                        {agentPulse.freshness.latest_successful_window_end_date && (
                            <span className="ml-2">
                                -- data through {agentPulse.freshness.latest_successful_window_end_date}
                            </span>
                        )}
                    </p>
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
