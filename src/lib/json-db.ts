import { readFile, stat } from 'fs/promises';
import path from 'path';

export interface ChatRecord {
    id: number | string;
    created_at: string;
    direction: string | null;
    customer_phone: string | null;
    message: string | null;
    timestamp: string | null;
    intent: string | null;
    customer_name: string | null;
    message_type: string | null;
    channel: string | null;
    customer_email_address: string | null;
    escalated: string | boolean | number | null;
    session_id: string | null;
}

export interface UsageNotificationRecord {
    id: number | string;
    notification_type: string;
    notified_at: string;
    message: string;
    customer_count?: number;
    slab_number?: number;
    type?: string;
}

type CacheEntry<T> = {
    mtimeMs: number;
    data: T;
};

const chatsPath = path.join(process.cwd(), 'data', 'chats.json');
const notificationsPath = path.join(process.cwd(), 'data', 'usage-notifications.json');

let chatsCache: CacheEntry<ChatRecord[]> | null = null;
let notificationsCache: CacheEntry<UsageNotificationRecord[]> | null = null;
let chatsReadInFlight: Promise<ChatRecord[]> | null = null;
let notificationsReadInFlight: Promise<UsageNotificationRecord[]> | null = null;

function asNullableString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? value : null;
}

function asNullableNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function normalizeChatRecord(raw: unknown): ChatRecord | null {
    if (!raw || typeof raw !== 'object') return null;
    const chat = raw as Record<string, unknown>;

    return {
        id: typeof chat.id === 'number' || typeof chat.id === 'string' ? chat.id : 0,
        created_at: typeof chat.created_at === 'string'
            ? chat.created_at
            : typeof chat.timestamp === 'string'
                ? chat.timestamp
                : '',
        direction: asNullableString(chat.direction)?.toLowerCase() ?? null,
        customer_phone: asNullableString(chat.customer_phone),
        message: typeof chat.message === 'string' ? chat.message : null,
        timestamp: asNullableString(chat.timestamp),
        intent: asNullableString(chat.intent),
        customer_name: asNullableString(chat.customer_name),
        message_type: asNullableString(chat.message_type),
        channel: asNullableString(chat.channel),
        customer_email_address: asNullableString(chat.customer_email_address),
        escalated:
            typeof chat.escalated === 'string' || typeof chat.escalated === 'boolean' || typeof chat.escalated === 'number'
                ? chat.escalated
                : null,
        session_id: asNullableString(chat.session_id),
    };
}

function normalizeNotificationRecord(raw: unknown, index: number): UsageNotificationRecord | null {
    if (!raw || typeof raw !== 'object') return null;
    const notification = raw as Record<string, unknown>;

    const type =
        asNullableString(notification.notification_type) ??
        asNullableString(notification.type) ??
        'System Notification';

    const message =
        asNullableString(notification.message) ??
        type;

    const notifiedAt =
        typeof notification.notified_at === 'string'
            ? notification.notified_at
            : new Date().toISOString();

    return {
        id: typeof notification.id === 'number' || typeof notification.id === 'string' ? notification.id : index + 1,
        notification_type: type,
        notified_at: notifiedAt,
        message,
        customer_count: asNullableNumber(notification.customer_count),
        slab_number: asNullableNumber(notification.slab_number),
        type: asNullableString(notification.type) ?? undefined,
    };
}

async function readJsonArray(filePath: string): Promise<unknown[] | null> {
    try {
        const raw = await readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw) as unknown;

        if (!Array.isArray(parsed)) {
            console.warn(`Expected array JSON in ${filePath}, received ${typeof parsed}.`);
            return [];
        }

        return parsed;
    } catch (error: any) {
        console.error(`Failed reading JSON file ${filePath}:`, error);
        return null;
    }
}

export async function loadChats(): Promise<ChatRecord[]> {
    if (chatsReadInFlight) return chatsReadInFlight;

    chatsReadInFlight = (async () => {
        try {
            const fileStat = await stat(chatsPath);
            if (chatsCache && chatsCache.mtimeMs === fileStat.mtimeMs) {
                return chatsCache.data;
            }

            const data = await readJsonArray(chatsPath);
            if (!data) return [];

            const normalized = data
                .map(normalizeChatRecord)
                .filter((chat): chat is ChatRecord => Boolean(chat));

            chatsCache = {
                mtimeMs: fileStat.mtimeMs,
                data: normalized,
            };

            return normalized;
        } catch (error: any) {
            if (error?.code !== 'ENOENT') {
                console.error(`Failed reading JSON file ${chatsPath}:`, error);
            }
            return [];
        }
    })();

    try {
        return await chatsReadInFlight;
    } finally {
        chatsReadInFlight = null;
    }
}

export async function loadUsageNotifications(): Promise<UsageNotificationRecord[]> {
    if (notificationsReadInFlight) return notificationsReadInFlight;

    notificationsReadInFlight = (async () => {
        try {
            const fileStat = await stat(notificationsPath);
            if (notificationsCache && notificationsCache.mtimeMs === fileStat.mtimeMs) {
                return notificationsCache.data;
            }

            const data = await readJsonArray(notificationsPath);
            if (!data) return [];

            const normalized = data
                .map((notification, index) => normalizeNotificationRecord(notification, index))
                .filter((notification): notification is UsageNotificationRecord => Boolean(notification));

            notificationsCache = {
                mtimeMs: fileStat.mtimeMs,
                data: normalized,
            };

            return normalized;
        } catch (error: any) {
            if (error?.code !== 'ENOENT') {
                console.error(`Failed reading JSON file ${notificationsPath}:`, error);
            }
            return [];
        }
    })();

    try {
        return await notificationsReadInFlight;
    } finally {
        notificationsReadInFlight = null;
    }
}
