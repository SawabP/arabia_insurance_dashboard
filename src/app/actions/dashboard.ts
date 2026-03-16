'use server';

import {
    type AnalyticsSummaryResponse,
    type ConversationListResponse,
    type LeadConversionTrendResponse,
    type MessageVolumeTrendResponse,
    type PeakHoursResponse,
    type TopIntentsResponse,
    backendRequest,
} from '@/lib/backend-api';

function formatDateParam(date?: Date) {
    if (!date || Number.isNaN(date.getTime())) {
        return undefined;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildAnalyticsSearchParams(startDate?: Date, endDate?: Date, channel: string = 'all') {
    return {
        start_date: formatDateParam(startDate),
        end_date: formatDateParam(endDate),
        channel,
    };
}

function formatPercentage(value: number) {
    return value.toFixed(1);
}

function createPlaceholderKpiTrends(startDate?: Date, endDate?: Date) {
    if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return [];
    }

    const points = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    const finalDate = new Date(endDate);
    finalDate.setHours(0, 0, 0, 0);

    while (cursor <= finalDate) {
        const date = formatDateParam(cursor);

        if (date) {
            points.push({
                date,
                total: 0,
                active: 0,
                inbound: 0,
                outbound: 0,
                escalated: 0,
            });
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return points;
}

export async function getDashboardStats(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const response = await backendRequest<AnalyticsSummaryResponse>('/api/v1/analytics/summary', {
            searchParams: buildAnalyticsSearchParams(startDate, endDate, channel),
        });

        return {
            totalChats: response.total_messages,
            escalationRate: formatPercentage(response.escalation_rate_pct),
            activeUsers: response.total_customers,
            avgMessagesPerCustomer: response.avg_engagement.toFixed(1),
            inbound: response.inbound_messages,
            outbound: response.outbound_messages,
            resolutionRate: formatPercentage(response.resolution_rate_pct),
            leadConversionRate: formatPercentage(response.lead_conversion_rate_pct),
            totalLeads: response.total_leads,
        };
    } catch (error: any) {
        console.error('getDashboardStats Error:', error);
        return {
            totalChats: 0,
            escalationRate: '0.0',
            activeUsers: 0,
            avgMessagesPerCustomer: '0.0',
            inbound: 0,
            outbound: 0,
            resolutionRate: '0.0',
            leadConversionRate: '0.0',
            totalLeads: 0,
            error: error.message,
        };
    }
}

export async function getPeakActivityData(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const response = await backendRequest<PeakHoursResponse>('/api/v1/analytics/peak-hours', {
            searchParams: buildAnalyticsSearchParams(startDate, endDate, channel),
        });

        return response.points.map((point) => ({
            hour: point.hour,
            count: point.count,
        }));
    } catch (error) {
        console.error('getPeakActivityData Error:', error);
        return [];
    }
}

export async function getKpiTrends(startDate?: Date, endDate?: Date, _channel: string = 'all') {
    return createPlaceholderKpiTrends(startDate, endDate);
}

export async function getLeadTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const response = await backendRequest<LeadConversionTrendResponse>('/api/v1/analytics/lead-conversion-trend', {
            searchParams: buildAnalyticsSearchParams(startDate, endDate, channel),
        });

        return response.points.map((point) => ({
            date: point.date,
            count: point.count,
            rate: point.rate_pct,
        }));
    } catch (error) {
        console.error('getLeadTrends Error:', error);
        return [];
    }
}

export async function getChatVolumeData(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const response = await backendRequest<MessageVolumeTrendResponse>('/api/v1/analytics/message-volume-trend', {
            searchParams: buildAnalyticsSearchParams(startDate, endDate, channel),
        });

        return response.points;
    } catch (error) {
        console.error('getChatVolumeData Error:', error);
        return [];
    }
}

export async function getIntentDistribution(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const response = await backendRequest<TopIntentsResponse>('/api/v1/analytics/top-intents', {
            searchParams: {
                ...buildAnalyticsSearchParams(startDate, endDate, channel),
                limit: 5,
            },
        });

        return response.points.map((point) => ({
            intent: point.intent,
            count: point.count,
            sharePct: point.share_pct,
        }));
    } catch (error) {
        console.error('getIntentDistribution Error:', error);
        return [];
    }
}

export async function getRecentInteractions(channel: string = 'all') {
    try {
        const response = await backendRequest<ConversationListResponse>('/api/v1/conversations', {
            searchParams: {
                channel,
                limit: 5,
                offset: 0,
            },
        });

        return response.items.map((item) => ({
            customer_name: item.contact_name || 'Anonymous',
            identifier: item.conversation_key,
            last_message: item.latest_message || 'No message preview available.',
            last_message_time: item.latest_message_at,
            status: 'active',
        }));
    } catch (error) {
        console.error('getRecentInteractions Error:', error);
        return [];
    }
}
