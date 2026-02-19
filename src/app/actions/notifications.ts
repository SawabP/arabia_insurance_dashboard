'use server';

import { loadUsageNotifications } from '@/lib/json-db';

function getTimestamp(value?: string | null): number {
    if (!value) return Number.NaN;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? Number.NaN : timestamp;
}

function getSortableTimestamp(value?: string | null): number {
    const timestamp = getTimestamp(value);
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export async function getNotifications() {
    try {
        const notifications = await loadUsageNotifications();
        return Array.from(notifications)
            .sort((a, b) => getSortableTimestamp(b.notified_at) - getSortableTimestamp(a.notified_at))
            .slice(0, 100);
    } catch (error) {
        console.error('getNotifications Error:', error);
        return [];
    }
}
