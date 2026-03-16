import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BACKEND_AUTH_COOKIE, buildBackendUrl } from '@/lib/backend-auth';

type SearchParamValue = string | number | boolean | null | undefined;

interface BackendRequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    searchParams?: Record<string, SearchParamValue>;
    body?: unknown;
    headers?: HeadersInit;
    auth?: boolean;
    redirectOnUnauthorized?: boolean;
}

export class BackendApiError extends Error {
    status: number;
    detail: unknown;

    constructor(message: string, status: number, detail?: unknown) {
        super(message);
        this.name = 'BackendApiError';
        this.status = status;
        this.detail = detail;
    }
}

async function parseResponseDetail(response: Response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text || null;
}

function appendSearchParams(url: URL, searchParams?: Record<string, SearchParamValue>) {
    if (!searchParams) {
        return;
    }

    for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }

        url.searchParams.set(key, String(value));
    }
}

export async function backendRequest<T>(path: string, options: BackendRequestOptions = {}) {
    const {
        method = 'GET',
        searchParams,
        body,
        headers,
        auth = true,
        redirectOnUnauthorized = true,
    } = options;

    const requestUrl = new URL(buildBackendUrl(path));
    appendSearchParams(requestUrl, searchParams);

    const requestHeaders = new Headers(headers);
    requestHeaders.set('Accept', 'application/json');

    if (body !== undefined) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    if (auth) {
        const cookieStore = await cookies();
        const token = cookieStore.get(BACKEND_AUTH_COOKIE)?.value;

        if (!token) {
            if (redirectOnUnauthorized) {
                redirect('/auth');
            }

            throw new BackendApiError('Authentication required.', 401);
        }

        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: 'no-store',
    });

    if (response.status === 401) {
        if (auth) {
            const cookieStore = await cookies();
            cookieStore.delete(BACKEND_AUTH_COOKIE);
        }

        if (redirectOnUnauthorized) {
            redirect('/auth');
        }

        throw new BackendApiError('Authentication required.', 401, await parseResponseDetail(response));
    }

    if (!response.ok) {
        throw new BackendApiError(
            `Backend request failed with status ${response.status}.`,
            response.status,
            await parseResponseDetail(response),
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export interface AccountContext {
    id: string;
    email: string;
    full_name: string;
    role: 'super_admin' | 'company_admin' | 'analyst';
    is_active: boolean;
    last_login_at?: string | null;
}

export interface AuthMeResponse {
    account: AccountContext;
}

export interface LoginResponse {
    token: {
        access_token: string;
        token_type: 'bearer';
        expires_in_seconds: number;
    };
    account: AccountContext;
}

export interface AnalyticsSummaryResponse {
    total_messages: number;
    total_customers: number;
    inbound_messages: number;
    outbound_messages: number;
    escalated_customers: number;
    escalation_rate_pct: number;
    resolution_rate_pct: number;
    avg_engagement: number;
    total_leads: number;
    lead_conversion_rate_pct: number;
    ai_quality_score: number;
}

export interface DateCountPoint {
    date: string;
    count: number;
}

export interface MessageVolumeTrendResponse {
    points: DateCountPoint[];
}

export interface IntentCountPoint {
    intent: string;
    count: number;
    share_pct: number;
}

export interface TopIntentsResponse {
    points: IntentCountPoint[];
}

export interface PeakHourPoint {
    hour: number;
    count: number;
}

export interface PeakHoursResponse {
    points: PeakHourPoint[];
}

export interface LeadConversionTrendPoint {
    date: string;
    count: number;
    rate_pct: number;
}

export interface LeadConversionTrendResponse {
    points: LeadConversionTrendPoint[];
}

export interface ConversationSummaryItem {
    conversation_key: string;
    contact_name?: string | null;
    latest_message?: string | null;
    latest_message_type?: string | null;
    latest_message_at: string;
    message_count?: number | null;
    channel?: string | null;
}

export interface ConversationListResponse {
    items: ConversationSummaryItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface ConversationMessageItem {
    id: number;
    created_at: string;
    direction: 'inbound' | 'outbound';
    message?: string | null;
    message_type?: string | null;
    channel?: string | null;
    intent?: string | null;
    escalated?: string | null;
}

export interface ConversationMessagesResponse {
    conversation_key: string;
    contact_name?: string | null;
    messages: ConversationMessageItem[];
}

export async function getCurrentAccount() {
    try {
        const response = await backendRequest<AuthMeResponse>('/api/v1/auth/me', {
            redirectOnUnauthorized: false,
        });

        return response.account;
    } catch (error) {
        if (error instanceof BackendApiError && error.status === 401) {
            return null;
        }

        throw error;
    }
}
