// TypeScript interfaces for the monitoring API responses.
// Derived from the backend OpenAPI spec at /api/v1/monitoring/*.

import type { DateWindow, Freshness, EscalationType } from './grades-types';

export interface HighlightBadge {
    code: string;
    label: string;
}

// Shared shape for items in the list response
export interface MonitoringConversationSummary {
    grade_id: string;
    grade_date: string;
    conversation_key: string;
    contact_name: string | null;
    latest_message_preview: string | null;
    latest_message_at: string | null;
    message_count: number;
    intent_code: string | null;
    intent_label: string | null;
    intent_category: string | null;
    resolution: boolean | null;
    escalation_type: EscalationType | null;
    frustration_score: number | null;
    accuracy_score: number | null;
    highlights: HighlightBadge[];
}

// GET /api/v1/monitoring/conversations
export interface MonitoringListResponse {
    date_window: DateWindow;
    total: number;
    limit: number;
    offset: number;
    items: MonitoringConversationSummary[];
    freshness: Freshness;
}

// Monitoring grade sections are intentionally permissive because the backend
// returns section objects with loose keys like `relevancy_score` and
// `relevancy_reasoning`.
export type MonitoringGradePanelSection = Record<string, unknown>;

export interface MonitoringGradePanel {
    ai_performance: MonitoringGradePanelSection;
    conversation_health: MonitoringGradePanelSection;
    user_signals: MonitoringGradePanelSection;
    escalation: MonitoringGradePanelSection;
    intent: MonitoringGradePanelSection;
}

export interface TranscriptMessage {
    role: string;
    content: string;
    created_at: string;
}

export interface MonitoringHistoryItem {
    grade_id: string;
    grade_date: string;
    conversation_key: string;
    resolution: boolean | null;
    escalation_type: EscalationType | null;
    frustration_score: number | null;
    accuracy_score: number | null;
    highlights: HighlightBadge[];
}

// GET /api/v1/monitoring/conversations/{grade_id}
export interface MonitoringConversationDetail {
    grade_id: string;
    grade_date: string;
    conversation_key: string;
    contact_name: string | null;
    latest_message_preview: string | null;
    latest_message_at: string | null;
    message_count: number;
    intent_code: string | null;
    intent_label: string | null;
    intent_category: string | null;
    resolution: boolean | null;
    escalation_type: EscalationType | null;
    frustration_score: number | null;
    accuracy_score: number | null;
    highlights: HighlightBadge[];
    grade_panel: MonitoringGradePanel;
    transcript: TranscriptMessage[];
    recent_history: MonitoringHistoryItem[];
}

export interface MonitoringDetailResponse {
    detail: MonitoringConversationDetail;
}

// Filter state used client-side in the monitoring shell
export interface MonitoringFilters {
    start_date: string;
    end_date: string;
    resolution: boolean | null;
    escalation_types: string[];
    frustration_min: number | null;
    accuracy_max: number | null;
    intent_codes: string[];
    highlights_only: boolean;
    sort_by: string | null;
    sort_direction: 'asc' | 'desc';
}
