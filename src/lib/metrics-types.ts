// TypeScript interfaces for the grading metrics API responses.
// Derived from the backend OpenAPI spec at /api/v1/grading/metrics/*.

import type { DateWindow, Freshness } from './grades-types';

// GET /api/v1/grading/metrics/score-trends
export interface ScoreTrendPoint {
    date: string;
    relevancy: number;
    accuracy: number;
    completeness: number;
    clarity: number;
    tone: number;
    repetition: number;
    satisfaction: number;
    frustration: number;
}

export interface ScoreTrendResponse {
    date_window: DateWindow;
    points: ScoreTrendPoint[];
}

// GET /api/v1/grading/metrics/outcome-trends
export interface OutcomeTrendPoint {
    date: string;
    resolution_rate_pct: number;
    loop_detected_rate_pct: number;
    non_genuine_rate_pct: number;
    escalation_rate_pct: number;
    escalation_failure_rate_pct: number;
}

export interface OutcomeTrendResponse {
    date_window: DateWindow;
    points: OutcomeTrendPoint[];
}

// GET /api/v1/grading/metrics/intents/distribution
export interface IntentDistributionItem {
    intent_code: string;
    intent_label: string;
    intent_category: string;
    count: number;
    share_pct: number;
}

export interface IntentDistributionResponse {
    date_window: DateWindow;
    total_graded_customer_days: number;
    items: IntentDistributionItem[];
}

// GET /api/v1/grading/metrics/intents/trend
export interface IntentTrendPoint {
    date: string;
    count: number;
}

export interface IntentTrendSeries {
    intent_code: string;
    intent_label: string;
    intent_category: string;
    points: IntentTrendPoint[];
}

export interface IntentTrendResponse {
    date_window: DateWindow;
    series: IntentTrendSeries[];
}
