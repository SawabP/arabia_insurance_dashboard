// TypeScript interfaces for the grading dashboard API responses.
// Derived from the backend OpenAPI spec at /api/v1/grading/dashboard/*.

export type InsightSeverity = 'critical' | 'warning' | 'info';
export type EscalationType = 'None' | 'Natural' | 'Failure';

export interface DateWindow {
    start_date: string;
    end_date: string;
}

export interface Freshness {
    latest_successful_run_id: string | null;
    latest_successful_window_end_date: string | null;
    latest_successful_run_finished_at: string | null;
}

// ── Agent Pulse ──

export interface AgentPulseDimensionAverages {
    relevancy: number;
    accuracy: number;
    completeness: number;
    clarity: number;
    tone: number;
}

export interface AgentPulseHealth {
    resolution_rate_pct: number;
    avg_repetition_score: number;
    loop_detected_rate_pct: number;
}

export interface AgentPulseEscalationItem {
    escalation_type: EscalationType;
    count: number;
    share_pct: number;
}

export interface AgentPulseUserSignals {
    avg_satisfaction_score: number;
    avg_frustration_score: number;
    user_relevancy_rate_pct: number;
}

export interface AgentPulseTrendPoint {
    date: string;
    overall_composite_score: number;
    satisfaction_score: number;
    frustration_score: number;
}

export interface AgentPulseIntentTag {
    intent_code: string;
    intent_label: string;
    intent_category: string;
    count: number;
}

export interface AgentPulseAttentionSignal {
    code: string;
    severity: InsightSeverity;
    label: string;
    metric_key: string;
    value: number | null;
    message: string;
}

export interface AgentPulseResponse {
    date_window: DateWindow;
    total_graded_customer_days: number;
    overall_composite_score: number;
    dimension_averages: AgentPulseDimensionAverages;
    health: AgentPulseHealth;
    escalation_breakdown?: AgentPulseEscalationItem[];
    user_signals: AgentPulseUserSignals;
    trend_points?: AgentPulseTrendPoint[];
    top_intents?: AgentPulseIntentTag[];
    attention_signals?: AgentPulseAttentionSignal[];
    freshness: Freshness;
}

// ── Correlations ──

export interface HeatmapCell {
    dimension_key: string;
    dimension_label: string;
    score_bucket: string;
    conversation_count: number;
    avg_satisfaction_score: number;
}

export interface FunnelStep {
    step_key: string;
    label: string;
    count: number;
}

export interface FrustrationBucket {
    bucket_label: string;
    min_score: number;
    max_score: number;
    count: number;
    share_pct: number;
}

export interface StoryCard {
    code: string;
    severity: InsightSeverity;
    title: string;
    metric_key: string;
    metric_value: number | null;
    explanation: string;
}

export interface CorrelationsResponse {
    date_window: DateWindow;
    total_graded_customer_days: number;
    heatmap_cells?: HeatmapCell[];
    failure_funnel?: FunnelStep[];
    frustration_histogram?: FrustrationBucket[];
    story_cards?: StoryCard[];
    freshness: Freshness;
}

// ── Daily Timeline ──

export interface HourlyBucket {
    hour: number;
    conversation_volume: number;
    resolution_rate_pct: number;
}

export interface HourSummary {
    hour: number;
    conversation_volume: number;
    resolution_rate_pct: number;
}

export interface ScatterPoint {
    grade_id: string;
    conversation_key: string;
    satisfaction_score: number;
    frustration_score: number;
    resolution: boolean | null;
    loop_detected: boolean | null;
}

export interface WorstPerformerRow {
    grade_id: string;
    conversation_key: string;
    contact_label: string | null;
    relevancy_score: number;
    accuracy_score: number;
    completeness_score: number;
    clarity_score: number;
    tone_score: number;
    satisfaction_score: number;
    frustration_score: number;
    resolution: boolean | null;
    escalation_type: EscalationType | null;
    intent_code: string | null;
    intent_label: string | null;
    intent_category: string | null;
}

export interface DailyTimelineResponse {
    target_date: string;
    hourly_buckets?: HourlyBucket[];
    best_hour: HourSummary | null;
    worst_hour: HourSummary | null;
    scatter_points?: ScatterPoint[];
    worst_performers?: WorstPerformerRow[];
    freshness: Freshness;
}
