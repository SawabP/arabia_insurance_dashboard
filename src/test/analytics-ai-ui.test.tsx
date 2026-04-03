import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/page';
import { AgentPulse } from '@/components/ai-performance/agent-pulse';
import { Correlations } from '@/components/ai-performance/correlations';
import { MiniPerf } from '@/components/ai-performance/mini-perf';
import { TrendsTab } from '@/components/ai-performance/trends-tab';
import { GradePanel } from '@/components/monitoring/grade-panel';

vi.mock('@/app/actions/dashboard', () => ({
    getDashboardStats: vi.fn(async () => ({
        totalChats: 1200,
        activeUsers: 340,
        escalationRate: 15,
        resolutionRate: 85,
        leadConversionRate: 24,
        totalLeads: 82,
        inbound: 700,
        outbound: 500,
        avgMessagesPerCustomer: 4.7,
    })),
    getChatVolumeData: vi.fn(async () => []),
    getRecentInteractions: vi.fn(async () => []),
    getPeakActivityData: vi.fn(async () => []),
    getKpiTrends: vi.fn(async () => []),
    getLeadTrends: vi.fn(async () => []),
}));

vi.mock('@/components/dashboard/overview-charts', () => ({
    OverviewCharts: () => <div data-testid="overview-charts" />,
}));

vi.mock('@/components/dashboard/date-range-picker', () => ({
    DateRangePicker: () => <div data-testid="date-range-picker" />,
}));

vi.mock('@/components/dashboard/recent-interactions', () => ({
    RecentInteractions: () => <div data-testid="recent-interactions" />,
}));

vi.mock('@/components/dashboard/sparkline', () => ({
    Sparkline: () => <div data-testid="sparkline" />,
}));

vi.mock('@/components/ui/info-tooltip', () => ({
    InfoTooltip: () => <span data-testid="info-tooltip" />,
}));

vi.mock('@/components/dashboard/channel-selector', () => ({
    ChannelSelector: () => <div data-testid="channel-selector" />,
}));

vi.mock('@/components/dashboard/dashboard-page-shell', () => ({
    DashboardPageShell: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-page-shell">{children}</div>,
}));

vi.mock('@/components/ai-performance/score-ring', () => ({
    ScoreRing: () => <div data-testid="score-ring" />,
}));

vi.mock('@/components/ai-performance/dimension-bars', () => ({
    DimensionBars: () => <div data-testid="dimension-bars" />,
}));

vi.mock('@/components/ai-performance/section-label', () => ({
    SectionLabel: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ai-performance/score-trends-chart', () => ({
    ScoreTrendsChart: () => <div data-testid="score-trends-chart" />,
}));

vi.mock('@/components/ai-performance/intent-distribution', () => ({
    IntentDistribution: () => <div data-testid="intent-distribution" />,
}));

vi.mock('@/components/ai-performance/outcome-trends-chart', () => ({
    OutcomeTrendsChart: () => <div data-testid="outcome-trends-chart" />,
}));

vi.mock('@/components/ai-performance/intent-trends-chart', () => ({
    IntentTrendsChart: () => <div data-testid="intent-trends-chart" />,
}));

describe('analytics page layout', () => {
    it('uses a four-column KPI grid and renames resolution rate to automated handling rate', async () => {
        const { container } = render(await DashboardPage({ searchParams: {} }));

        expect(screen.getByText('AUTOMATED HANDLING RATE')).toBeInTheDocument();

        const kpiGrid = container.querySelector('div.grid.gap-4');
        expect(kpiGrid).toBeTruthy();
        expect(kpiGrid?.className).toContain('xl:grid-cols-4');
    });
});

describe('AI performance repetition display', () => {
    it('shows 10 minus repetition on the conversation health card', () => {
        render(
            <AgentPulse
                data={{
                    date_window: { start_date: '2026-03-01', end_date: '2026-03-30' },
                    total_graded_customer_days: 1,
                    overall_composite_score: 8.2,
                    dimension_averages: {
                        relevancy: 8,
                        accuracy: 8,
                        completeness: 8,
                        clarity: 8,
                        tone: 8,
                    },
                    health: {
                        resolution_rate_pct: 84,
                        avg_repetition_score: 2.1,
                        loop_detected_rate_pct: 9,
                    },
                    user_signals: {
                        avg_satisfaction_score: 8.1,
                        avg_frustration_score: 2.2,
                        user_relevancy_rate_pct: 92,
                    },
                    freshness: {
                        latest_successful_run_id: 'run-1',
                        latest_successful_window_end_date: '2026-03-30',
                        latest_successful_run_finished_at: '2026-03-30T00:00:00Z',
                    },
                }}
                scoreTrends={{ date_window: { start_date: '2026-03-01', end_date: '2026-03-30' }, points: [] }}
                intentDistribution={{ date_window: { start_date: '2026-03-01', end_date: '2026-03-30' }, total_graded_customer_days: 1, items: [] }}
            />,
        );

        expect(screen.getByText('7.9')).toBeInTheDocument();
    });

    it('shows 10 minus repetition in the monitoring grade panel', () => {
        render(
            <GradePanel
                panel={{
                    ai_performance: {},
                    conversation_health: {
                        repetition_score: 2.5,
                        repetition_reasoning: 'Repeated itself twice.',
                    },
                    user_signals: {},
                    escalation: {},
                    intent: {},
                }}
            />,
        );

        expect(screen.getByText('7.5/10')).toBeInTheDocument();
    });
});

describe('AI performance correlations layout', () => {
    it('places the funnel and frustration score distribution side by side', () => {
        const { container } = render(
            <Correlations
                data={{
                    date_window: { start_date: '2026-03-01', end_date: '2026-03-30' },
                    total_graded_customer_days: 1,
                    failure_funnel: [
                        { step_key: 'handoff', label: 'Handoff', count: 10 },
                        { step_key: 'failure', label: 'Failure', count: 4 },
                    ],
                    frustration_histogram: [
                        { bucket_label: '0-2', min_score: 0, max_score: 2, count: 3, share_pct: 30 },
                        { bucket_label: '3-5', min_score: 3, max_score: 5, count: 4, share_pct: 40 },
                    ],
                    freshness: {
                        latest_successful_run_id: 'run-1',
                        latest_successful_window_end_date: '2026-03-30',
                        latest_successful_run_finished_at: '2026-03-30T00:00:00Z',
                    },
                }}
            />,
        );

        expect(screen.getByText('Failure escalation funnel')).toBeInTheDocument();
        expect(screen.getByText('Frustration score distribution')).toBeInTheDocument();
        expect(container.querySelector('.lg\\:grid-cols-2')).toBeTruthy();
    });
});

describe('daily timeline perf tooltip', () => {
    it('uses a vertical tooltip with full metric names', () => {
        render(<MiniPerf scores={[1, 2, 3, 4, 5]} />);

        expect(screen.getByText('Relevancy')).toBeInTheDocument();
        expect(screen.getByText('Accuracy')).toBeInTheDocument();
        expect(screen.getByText('Completeness')).toBeInTheDocument();
        expect(screen.getByText('Clarity')).toBeInTheDocument();
        expect(screen.getByText('Tone')).toBeInTheDocument();
        expect(document.querySelector('.space-y-2')).toBeTruthy();
    });

    it('renders the tooltip in a fixed overlay so table overflow does not clip it', async () => {
        render(<MiniPerf scores={[1, 2, 3, 4, 5]} />);

        await waitFor(() => {
            expect(document.querySelector('.fixed.z-\\[60\\]')).toBeTruthy();
        });
    });
});

describe('AI performance trends cards', () => {
    it('renames the failure escalation card to escalation without changing the chart section copy', () => {
        render(
            <TrendsTab
                outcomeTrends={{
                    date_window: { start_date: '2026-03-01', end_date: '2026-03-30' },
                    points: [
                        {
                            date: '2026-03-30',
                            resolution_rate_pct: 82,
                            escalation_rate_pct: 15,
                            escalation_failure_rate_pct: 6,
                            loop_detected_rate_pct: 4,
                            non_genuine_rate_pct: 2,
                        },
                    ],
                }}
                outcomeTrendsPrev={{
                    date_window: { start_date: '2026-02-01', end_date: '2026-02-28' },
                    points: [
                        {
                            date: '2026-02-28',
                            resolution_rate_pct: 80,
                            escalation_rate_pct: 14,
                            escalation_failure_rate_pct: 5,
                            loop_detected_rate_pct: 3,
                            non_genuine_rate_pct: 2,
                        },
                    ],
                }}
                intentDistribution={{
                    date_window: { start_date: '2026-03-01', end_date: '2026-03-30' },
                    total_graded_customer_days: 1,
                    items: [],
                }}
                intentDistributionPrev={{
                    date_window: { start_date: '2026-02-01', end_date: '2026-02-28' },
                    total_graded_customer_days: 1,
                    items: [],
                }}
                intentTrend={{
                    date_window: { start_date: '2026-03-01', end_date: '2026-03-30' },
                    points: [],
                }}
            />,
        );

        expect(screen.getByText('Escalation')).toBeInTheDocument();
        expect(screen.queryByText('Failure Esc.')).not.toBeInTheDocument();
        expect(screen.getByText('How resolution, handover, and failure rates change over time')).toBeInTheDocument();
    });
});
