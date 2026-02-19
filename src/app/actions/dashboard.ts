'use server';

import { ChatRecord, loadChats, loadUsageNotifications } from '@/lib/json-db';

const LEAD_INTENTS = new Set([
    'new get-a-quote form submitted in uae',
    'new contact form submitted',
]);

function isValidDate(date?: Date): date is Date {
    return date instanceof Date && !Number.isNaN(date.getTime());
}

function normalizeChannel(channel?: string | null): string {
    return (channel ?? '').trim().toLowerCase();
}

function normalizeIntent(intent?: string | null): string {
    return (intent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function getTimestamp(value?: string | null): number {
    if (!value) return Number.NaN;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? Number.NaN : timestamp;
}

function getSortableTimestamp(value?: string | null): number {
    const timestamp = getTimestamp(value);
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function toDateKey(value?: string | null): string | null {
    const timestamp = getTimestamp(value);
    if (Number.isNaN(timestamp)) return null;
    return new Date(timestamp).toISOString().slice(0, 10);
}

function getCustomerIdentifier(chat: ChatRecord): string | null {
    return chat.customer_phone ?? chat.customer_email_address ?? chat.session_id ?? null;
}

function isEscalated(value: ChatRecord['escalated']): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === 'yes' || normalized === '1';
    }
    return false;
}

function filterChats(chats: ChatRecord[], startDate?: Date, endDate?: Date, channel: string = 'all'): ChatRecord[] {
    const hasDateFilter = isValidDate(startDate) && isValidDate(endDate);
    const start = hasDateFilter ? startDate.getTime() : Number.NEGATIVE_INFINITY;
    const end = hasDateFilter ? endDate.getTime() : Number.POSITIVE_INFINITY;
    const normalizedChannel = normalizeChannel(channel);

    return chats.filter((chat) => {
        if (normalizedChannel !== 'all') {
            if (normalizeChannel(chat.channel) !== normalizedChannel) {
                return false;
            }
        }

        if (!hasDateFilter) return true;
        const timestamp = getTimestamp(chat.created_at);
        if (Number.isNaN(timestamp)) return false;
        return timestamp >= start && timestamp <= end;
    });
}

export async function getDashboardStats(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const notifications = await loadUsageNotifications();
        const filteredChats = filterChats(chats, startDate, endDate, channel);

        const uniqueCustomers = new Set<string>();
        const escalatedCustomers = new Set<string>();
        let inbound = 0;
        let outbound = 0;

        filteredChats.forEach((chat) => {
            const identifier = getCustomerIdentifier(chat);
            if (identifier) {
                uniqueCustomers.add(identifier);
                if (isEscalated(chat.escalated)) {
                    escalatedCustomers.add(identifier);
                }
            }

            if (chat.direction === 'inbound') inbound += 1;
            if (chat.direction === 'outbound') outbound += 1;
        });

        const totalChats = filteredChats.length;
        const totalUniqueCustomers = uniqueCustomers.size;
        const escalatedCount = escalatedCustomers.size;

        const escalationRate = totalUniqueCustomers > 0
            ? ((escalatedCount / totalUniqueCustomers) * 100).toFixed(1)
            : 0;

        const avgMessagesPerCustomer = totalUniqueCustomers > 0
            ? (totalChats / totalUniqueCustomers).toFixed(1)
            : 0;

        const recentNotifications = Array.from(notifications)
            .sort((a, b) => getSortableTimestamp(b.notified_at) - getSortableTimestamp(a.notified_at))
            .slice(0, 5);

        return {
            totalChats,
            escalationRate,
            activeUsers: totalUniqueCustomers,
            avgMessagesPerCustomer,
            inbound,
            outbound,
            recentNotifications,
        };
    } catch (error: any) {
        console.error('getDashboardStats Error:', error);
        return {
            totalChats: 0,
            escalationRate: 0,
            activeUsers: 0,
            avgMessagesPerCustomer: 0,
            inbound: 0,
            outbound: 0,
            recentNotifications: [],
            error: error?.message ?? 'Unknown error',
        };
    }
}

export async function getPeakActivityData(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, startDate, endDate, channel);

        const hours = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            count: 0,
        }));

        filteredChats.forEach((chat) => {
            const timestamp = getTimestamp(chat.created_at);
            if (Number.isNaN(timestamp)) return;
            const hour = new Date(timestamp).getUTCHours();
            hours[hour].count += 1;
        });

        return hours;
    } catch (error) {
        console.error('getPeakActivityData Error:', error);
        return [];
    }
}

export async function getMessageTypeDistribution(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, startDate, endDate, channel);
        const counts = new Map<string, number>();

        filteredChats.forEach((chat) => {
            const type = (chat.message_type ?? 'text').trim().toLowerCase() || 'text';
            counts.set(type, (counts.get(type) ?? 0) + 1);
        });

        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({
                name: type.charAt(0).toUpperCase() + type.slice(1),
                value: count,
            }));
    } catch (error) {
        console.error('getMessageTypeDistribution Error:', error);
        return [];
    }
}

export async function getKpiTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, startDate, endDate, channel);

        const daily = new Map<string, {
            total: number;
            inbound: number;
            outbound: number;
            active: Set<string>;
            escalated: Set<string>;
        }>();

        filteredChats.forEach((chat) => {
            const date = toDateKey(chat.created_at);
            if (!date) return;

            if (!daily.has(date)) {
                daily.set(date, {
                    total: 0,
                    inbound: 0,
                    outbound: 0,
                    active: new Set<string>(),
                    escalated: new Set<string>(),
                });
            }

            const day = daily.get(date)!;
            day.total += 1;
            if (chat.direction === 'inbound') day.inbound += 1;
            if (chat.direction === 'outbound') day.outbound += 1;

            const identifier = getCustomerIdentifier(chat);
            if (identifier) {
                day.active.add(identifier);
                if (isEscalated(chat.escalated)) {
                    day.escalated.add(identifier);
                }
            }
        });

        return Array.from(daily.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, stats]) => ({
                date,
                total: stats.total,
                active: stats.active.size,
                inbound: stats.inbound,
                outbound: stats.outbound,
                escalated: stats.escalated.size,
            }));
    } catch (error) {
        console.error('getKpiTrends Error:', error);
        return [];
    }
}

export async function getAIQualityMetrics(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const stats = await getDashboardStats(startDate, endDate, channel);
        const intentDistribution = await getIntentDistribution(startDate, endDate, channel);

        const resolutionRate = (100 - Number(stats.escalationRate)).toFixed(1);

        const totalLeads = intentDistribution
            .filter((item) => LEAD_INTENTS.has(normalizeIntent(item.intent)))
            .reduce((acc, curr) => acc + Number(curr.count || 0), 0);

        const leadConversionRate = stats.activeUsers > 0
            ? ((totalLeads / stats.activeUsers) * 100).toFixed(1)
            : 0;

        const resWeight = Number(resolutionRate) * 0.7;
        const leadWeight = Number(leadConversionRate) * 2.5;
        const qualityScore = Math.min(100, resWeight + leadWeight).toFixed(0);

        return {
            resolutionRate,
            leadConversionRate,
            qualityScore,
            totalLeads,
            status: Number(qualityScore) > 80 ? 'Optimal' : Number(qualityScore) > 60 ? 'Stable' : 'Attention',
        };
    } catch (error) {
        console.error('getAIQualityMetrics Error:', error);
        return { resolutionRate: 0, leadConversionRate: 0, qualityScore: 0, totalLeads: 0, status: 'Unknown' };
    }
}

export async function getQualityTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, startDate, endDate, channel);

        const daily = new Map<string, { active: Set<string>; escalated: Set<string> }>();

        filteredChats.forEach((chat) => {
            const date = toDateKey(chat.created_at);
            if (!date) return;

            if (!daily.has(date)) {
                daily.set(date, { active: new Set<string>(), escalated: new Set<string>() });
            }

            const day = daily.get(date)!;
            const identifier = getCustomerIdentifier(chat);
            if (!identifier) return;

            day.active.add(identifier);
            if (isEscalated(chat.escalated)) {
                day.escalated.add(identifier);
            }
        });

        return Array.from(daily.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, stats]) => {
                const activeCount = stats.active.size;
                const escalatedCount = stats.escalated.size;
                const score = activeCount > 0
                    ? (100 - ((escalatedCount / activeCount) * 100)).toFixed(1)
                    : '0.0';

                return {
                    date,
                    score,
                };
            });
    } catch (error) {
        console.error('getQualityTrends Error:', error);
        return [];
    }
}

export async function getLeadTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, startDate, endDate, channel);

        const daily = new Map<string, number>();

        filteredChats.forEach((chat) => {
            if (!LEAD_INTENTS.has(normalizeIntent(chat.intent))) return;

            const date = toDateKey(chat.created_at);
            if (!date) return;

            daily.set(date, (daily.get(date) ?? 0) + 1);
        });

        return Array.from(daily.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({
                date,
                count,
            }));
    } catch (error) {
        console.error('getLeadTrends Error:', error);
        return [];
    }
}

export async function getChatVolumeData(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const hasRange = isValidDate(startDate) && isValidDate(endDate);
        const effectiveEndDate = hasRange ? endDate : new Date();
        const effectiveStartDate = hasRange
            ? startDate
            : new Date(effectiveEndDate.getTime() - (30 * 24 * 60 * 60 * 1000));

        const chats = await loadChats();
        const filteredChats = filterChats(chats, effectiveStartDate, effectiveEndDate, channel);
        const daily = new Map<string, number>();

        filteredChats.forEach((chat) => {
            const date = toDateKey(chat.created_at);
            if (!date) return;
            daily.set(date, (daily.get(date) ?? 0) + 1);
        });

        return Array.from(daily.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, count }));
    } catch (error) {
        console.error('getChatVolumeData Error:', error);
        return [];
    }
}

export async function getIntentDistribution(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, startDate, endDate, channel);
        const counts = new Map<string, number>();

        filteredChats.forEach((chat) => {
            const intent = chat.intent?.trim();
            if (!intent) return;
            counts.set(intent, (counts.get(intent) ?? 0) + 1);
        });

        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([intent, count]) => ({
                intent,
                count,
            }));
    } catch (error) {
        console.error('getIntentDistribution Error:', error);
        return [];
    }
}

export async function getRecentInteractions(channel: string = 'all') {
    try {
        const chats = await loadChats();
        const filteredChats = filterChats(chats, undefined, undefined, channel);
        const latestByIdentifier = new Map<string, ChatRecord>();

        filteredChats.forEach((chat) => {
            const identifier = getCustomerIdentifier(chat);
            if (!identifier) return;

            const existing = latestByIdentifier.get(identifier);
            if (!existing) {
                latestByIdentifier.set(identifier, chat);
                return;
            }

            const existingTimestamp = getSortableTimestamp(existing.created_at);
            const currentTimestamp = getSortableTimestamp(chat.created_at);
            if (currentTimestamp > existingTimestamp) {
                latestByIdentifier.set(identifier, chat);
            }
        });

        return Array.from(latestByIdentifier.entries())
            .map(([identifier, chat]) => ({
                customer_name: chat.customer_name ?? chat.customer_email_address ?? chat.customer_phone ?? 'Anonymous',
                identifier,
                last_message: chat.message ?? '',
                last_message_time: chat.created_at,
            }))
            .sort((a, b) => getSortableTimestamp(b.last_message_time) - getSortableTimestamp(a.last_message_time))
            .slice(0, 5);
    } catch (error) {
        console.error('getRecentInteractions Error:', error);
        return [];
    }
}
