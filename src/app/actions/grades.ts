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
