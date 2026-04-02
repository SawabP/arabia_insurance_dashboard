'use server';

import { backendRequest } from '@/lib/backend-api';
import type { MonitoringListResponse, MonitoringDetailResponse } from '@/lib/monitoring-types';

export interface ListMonitoringParams {
    start_date?: string;
    end_date?: string;
    resolution?: boolean | null;
    escalation_types?: string[];
    frustration_min?: number | null;
    accuracy_max?: number | null;
    intent_codes?: string[];
    sort_by?: string | null;
    sort_direction?: string;
    limit?: number;
    offset?: number;
}

export async function listMonitoringConversations(params: ListMonitoringParams = {}) {
    let sort_direction = params.sort_direction ?? 'desc';
    if (params.sort_by === 'frustration_score') {
        sort_direction = sort_direction === 'asc' ? 'desc' : 'asc';
    }

    const searchParams: Record<string, string | number | boolean | null | undefined | string[]> = {
        start_date: params.start_date,
        end_date: params.end_date,
        sort_by: params.sort_by ?? undefined,
        sort_direction: sort_direction,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
    };

    if (params.resolution !== undefined && params.resolution !== null) {
        searchParams.resolution = params.resolution;
    }
    if (params.frustration_min !== undefined && params.frustration_min !== null) {
        searchParams.frustration_min = params.frustration_min;
    }
    if (params.accuracy_max !== undefined && params.accuracy_max !== null) {
        searchParams.accuracy_max = params.accuracy_max;
    }
    if (params.escalation_types?.length) {
        searchParams.escalation_types = params.escalation_types;
    }
    if (params.intent_codes?.length) {
        searchParams.intent_codes = params.intent_codes;
    }

    return backendRequest<MonitoringListResponse>('/api/v1/monitoring/conversations', { searchParams });
}

export async function getMonitoringDetail(gradeId: string) {
    return backendRequest<MonitoringDetailResponse>(`/api/v1/monitoring/conversations/${gradeId}`);
}
