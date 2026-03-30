'use client';

import { Check, Minus, X } from 'lucide-react';
import { SectionLabel } from '@/components/ai-performance/section-label';
import { heatColor, frustrationColor } from '@/components/ai-performance/grade-colors';
import type { MonitoringGradePanel, MonitoringGradePanelSection } from '@/lib/monitoring-types';
import { invertTenPointScore } from '@/lib/score-formatters';
import { cn } from '@/lib/utils';

type MetricKind = 'score' | 'boolean' | 'string';

interface MetricDefinition {
    id: string;
    label: string;
    kind: MetricKind;
    directKey: string;
    reasoningKey: string;
}

interface NormalizedMetric {
    id: string;
    label: string;
    kind: MetricKind;
    value: number | boolean | string | null;
    reasoning: string | null;
}

const AI_METRICS: MetricDefinition[] = [
    { id: 'relevancy', label: 'Relevancy', kind: 'score', directKey: 'relevancy_score', reasoningKey: 'relevancy_reasoning' },
    { id: 'accuracy', label: 'Accuracy', kind: 'score', directKey: 'accuracy_score', reasoningKey: 'accuracy_reasoning' },
    { id: 'completeness', label: 'Completeness', kind: 'score', directKey: 'completeness_score', reasoningKey: 'completeness_reasoning' },
    { id: 'clarity', label: 'Clarity', kind: 'score', directKey: 'clarity_score', reasoningKey: 'clarity_reasoning' },
    { id: 'tone', label: 'Tone', kind: 'score', directKey: 'tone_score', reasoningKey: 'tone_reasoning' },
];

const HEALTH_METRICS: MetricDefinition[] = [
    { id: 'resolution', label: 'Resolution', kind: 'boolean', directKey: 'resolution', reasoningKey: 'resolution_reasoning' },
    { id: 'repetition', label: 'Repetition', kind: 'score', directKey: 'repetition_score', reasoningKey: 'repetition_reasoning' },
    { id: 'loop_detected', label: 'Loop Detected', kind: 'boolean', directKey: 'loop_detected', reasoningKey: 'loop_detected_reasoning' },
];

const USER_SIGNAL_METRICS: MetricDefinition[] = [
    { id: 'satisfaction', label: 'Satisfaction', kind: 'score', directKey: 'satisfaction_score', reasoningKey: 'satisfaction_reasoning' },
    { id: 'frustration', label: 'Frustration', kind: 'score', directKey: 'frustration_score', reasoningKey: 'frustration_reasoning' },
    { id: 'user_relevancy', label: 'Genuine Interaction', kind: 'boolean', directKey: 'user_relevancy', reasoningKey: 'user_relevancy_reasoning' },
];

const ESCALATION_METRICS: MetricDefinition[] = [
    { id: 'escalation_occurred', label: 'Escalated', kind: 'boolean', directKey: 'escalation_occurred', reasoningKey: 'escalation_occurred_reasoning' },
    { id: 'escalation_type', label: 'Type', kind: 'string', directKey: 'escalation_type', reasoningKey: 'escalation_type_reasoning' },
];

const INTENT_METRICS: MetricDefinition[] = [
    { id: 'intent_label', label: 'Primary Intent', kind: 'string', directKey: 'intent_label', reasoningKey: 'intent_reasoning' },
    { id: 'intent_category', label: 'Category', kind: 'string', directKey: 'intent_category', reasoningKey: 'intent_reasoning' },
    { id: 'intent_code', label: 'Code', kind: 'string', directKey: 'intent_code', reasoningKey: 'intent_reasoning' },
];

function asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return null;
}

function asBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') return value;
    return null;
}

function asString(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value;
    return null;
}

function isMetricObject(value: unknown): value is { score?: unknown; value?: unknown; reasoning?: unknown } {
    return typeof value === 'object' && value !== null;
}

function normalizeMetric(section: MonitoringGradePanelSection, definition: MetricDefinition): NormalizedMetric | null {
    const objectValue = section[definition.id];
    const fallbackValue = section[definition.directKey];
    const fallbackReasoning = section[definition.reasoningKey];

    let value: number | boolean | string | null = null;
    let reasoning = asString(fallbackReasoning);

    if (isMetricObject(objectValue)) {
        value =
            definition.kind === 'score'
                ? asNumber(objectValue.score ?? objectValue.value)
                : definition.kind === 'boolean'
                    ? asBoolean(objectValue.value ?? objectValue.score)
                    : asString(objectValue.value ?? objectValue.score);
        reasoning = asString(objectValue.reasoning) ?? reasoning;
    }

    if (value === null) {
        value =
            definition.kind === 'score'
                ? asNumber(fallbackValue)
                : definition.kind === 'boolean'
                    ? asBoolean(fallbackValue)
                    : asString(fallbackValue);
    }

    if (value === null && !reasoning) {
        return null;
    }

    return {
        id: definition.id,
        label: definition.label,
        kind: definition.kind,
        value,
        reasoning,
    };
}

function normalizeSection(section: MonitoringGradePanelSection, definitions: MetricDefinition[]) {
    return definitions
        .map((definition) => normalizeMetric(section, definition))
        .filter((metric): metric is NormalizedMetric => metric !== null);
}

function MetricValue({ metric }: { metric: NormalizedMetric }) {
    if (metric.kind === 'score' && typeof metric.value === 'number') {
        const displayValue = metric.id === 'repetition' ? invertTenPointScore(metric.value) : metric.value;
        const colorFn = metric.id === 'frustration' ? frustrationColor : heatColor;
        const colors = colorFn(displayValue);
        return (
            <span
                className="inline-flex rounded-md px-2 py-1 text-[12px] font-bold"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                {displayValue}/10
            </span>
        );
    }

    if (metric.kind === 'boolean') {
        if (metric.value === true) {
            return (
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1D9E75]">
                    <Check className="h-4 w-4" />
                    Yes
                </span>
            );
        }

        if (metric.value === false) {
            return (
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#E24B4A]">
                    <X className="h-4 w-4" />
                    No
                </span>
            );
        }

        return <Minus className="h-4 w-4 text-[#9C9889]" />;
    }

    if (typeof metric.value === 'string' && metric.value.trim()) {
        const tone =
            metric.value === 'Failure'
                ? 'text-[#D85A30]'
                : metric.value === 'Natural'
                    ? 'text-[#0F766E]'
                    : 'text-[#1A1917]';

        return <span className={cn('text-[12px] font-semibold', tone)}>{metric.value}</span>;
    }

    return <span className="text-[12px] font-medium text-[#9C9889]">Not available</span>;
}

function ReasoningCallout({ label, text }: { label: string; text: string }) {
    return (
        <div className="rounded-xl border border-[#F0EDE8] bg-[#FAFAF8] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9889]">{label}</p>
            <p className="mt-2 text-[13px] leading-6 text-[#1A1917]">{text}</p>
        </div>
    );
}

function MetricList({ metrics }: { metrics: NormalizedMetric[] }) {
    if (metrics.length === 0) return null;

    return (
        <div className="divide-y divide-[#F0EDE8]">
            {metrics.map((metric) => (
                <div key={metric.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-[#6B6960]">{metric.label}</span>
                        <MetricValue metric={metric} />
                    </div>
                    {metric.reasoning && (
                        <p className="mt-2 text-[12px] leading-5 text-[#8B8796]">{metric.reasoning}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

interface GradePanelProps {
    panel: MonitoringGradePanel;
}

export function GradePanel({ panel }: GradePanelProps) {
    const aiMetrics = normalizeSection(panel.ai_performance ?? {}, AI_METRICS);
    const conversationHealth = normalizeSection(panel.conversation_health ?? {}, HEALTH_METRICS);
    const userSignals = normalizeSection(panel.user_signals ?? {}, USER_SIGNAL_METRICS);
    const escalation = normalizeSection(panel.escalation ?? {}, ESCALATION_METRICS);
    const intent = normalizeSection(panel.intent ?? {}, INTENT_METRICS);
    const intentFacts = intent.map((metric) => ({ ...metric, reasoning: null }));

    const aiReasoningMetric = [...aiMetrics]
        .filter((metric) => metric.reasoning)
        .sort((left, right) => {
            const leftValue = typeof left.value === 'number' ? left.value : Number.POSITIVE_INFINITY;
            const rightValue = typeof right.value === 'number' ? right.value : Number.POSITIVE_INFINITY;
            return leftValue - rightValue;
        })[0];

    const intentReasoning = intent.find((metric) => metric.reasoning)?.reasoning ?? null;

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <SectionLabel>AI Performance</SectionLabel>
                <div className="flex flex-wrap gap-2">
                    {aiMetrics.map((metric) => {
                        const value = typeof metric.value === 'number' ? metric.value : null;
                        const colors = value !== null ? heatColor(value) : { bg: '#F7F5F2', text: '#9C9889' };

                        return (
                            <div
                                key={metric.id}
                                className="min-w-[5.4rem] rounded-xl px-3 py-3 text-center"
                                style={{ backgroundColor: colors.bg }}
                            >
                                <div className="text-[1.3rem] font-extrabold leading-none" style={{ color: colors.text }}>
                                    {value ?? '-'}
                                </div>
                                <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#6B6960]">
                                    {metric.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {aiReasoningMetric?.reasoning && (
                    <ReasoningCallout label={`${aiReasoningMetric.label} reasoning`} text={aiReasoningMetric.reasoning} />
                )}
            </section>

            <section className="space-y-3">
                <SectionLabel>Conversation Health</SectionLabel>
                <MetricList metrics={conversationHealth} />
            </section>

            <section className="space-y-3">
                <SectionLabel>User Signals</SectionLabel>
                <MetricList metrics={userSignals} />
            </section>

            <section className="space-y-3">
                <SectionLabel>Escalation Details</SectionLabel>
                <MetricList metrics={escalation} />
            </section>

            <section className="space-y-3">
                <SectionLabel>Intent Classification</SectionLabel>
                <MetricList metrics={intentFacts.filter((metric) => metric.id !== 'intent_code' || metric.value !== null)} />
                {intentReasoning && <ReasoningCallout label="Intent reasoning" text={intentReasoning} />}
            </section>
        </div>
    );
}
