'use server';

import { backendRequest } from '@/lib/backend-api';
import type { AgentPulseResponse, CorrelationsResponse, DailyTimelineResponse } from '@/lib/grades-types';

function formatDate(date?: Date): string | undefined {
    if (!date || Number.isNaN(date.getTime())) return undefined;
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export async function getAgentPulse(startDate?: Date, endDate?: Date) {
    return backendRequest<AgentPulseResponse>('/api/v1/grading/dashboard/agent-pulse', {
        searchParams: { start_date: formatDate(startDate), end_date: formatDate(endDate) },
    });
}

export async function getCorrelations(startDate?: Date, endDate?: Date) {
    return backendRequest<CorrelationsResponse>('/api/v1/grading/dashboard/correlations', {
        searchParams: { start_date: formatDate(startDate), end_date: formatDate(endDate) },
    });
}

export async function getDailyTimeline(targetDate?: Date, limit: number = 10) {
    return backendRequest<DailyTimelineResponse>('/api/v1/grading/dashboard/daily-timeline', {
        searchParams: { target_date: formatDate(targetDate), worst_performers_limit: limit },
    });
}

// ── Grading Metrics endpoints ──

import type {
    ScoreTrendResponse,
    OutcomeTrendResponse,
    IntentDistributionResponse,
    IntentTrendResponse,
} from '@/lib/metrics-types';

export async function getScoreTrends(startDate?: Date, endDate?: Date) {
    return backendRequest<ScoreTrendResponse>('/api/v1/grading/metrics/score-trends', {
        searchParams: { start_date: formatDate(startDate), end_date: formatDate(endDate) },
    });
}

export async function getOutcomeTrends(startDate?: Date, endDate?: Date) {
    return backendRequest<OutcomeTrendResponse>('/api/v1/grading/metrics/outcome-trends', {
        searchParams: { start_date: formatDate(startDate), end_date: formatDate(endDate) },
    });
}

export async function getMetricsIntentDistribution(startDate?: Date, endDate?: Date) {
    return backendRequest<IntentDistributionResponse>('/api/v1/grading/metrics/intents/distribution', {
        searchParams: { start_date: formatDate(startDate), end_date: formatDate(endDate) },
    });
}

export async function getMetricsIntentTrend(startDate?: Date, endDate?: Date, intentCodes?: string[]) {
    return backendRequest<IntentTrendResponse>('/api/v1/grading/metrics/intents/trend', {
        searchParams: {
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            intent_codes: intentCodes?.length ? intentCodes : undefined,
        },
    });
}
