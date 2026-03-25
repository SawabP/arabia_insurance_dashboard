'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionLabel } from '@/components/ai-performance/section-label';
import { heatColor, ESCALATION_COLORS } from '@/components/ai-performance/grade-colors';
import type { MonitoringGradePanel, GradePanelField } from '@/lib/monitoring-types';

// ---------------------------------------------------------------------------
// Field name -> human-readable label
// ---------------------------------------------------------------------------
const FIELD_LABELS: Record<string, string> = {
    relevancy_score: 'Relevancy',
    accuracy_score: 'Accuracy',
    completeness_score: 'Completeness',
    clarity_score: 'Clarity',
    tone_score: 'Tone',
    resolution: 'Resolution',
    repetition_score: 'Repetition',
    loop_detected: 'Loop Detected',
    satisfaction_score: 'Satisfaction',
    frustration_score: 'Frustration',
    user_relevancy: 'Genuine Interaction',
    escalation_occurred: 'Escalated',
    escalation_type: 'Type',
    intent_label: 'Intent',
    intent_code: 'Code',
    intent_category: 'Category',
    intent_reasoning: 'Reasoning',
};

// Fallback: convert snake_case to Title Case
function toTitleCase(key: string): string {
    return key
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function fieldLabel(key: string): string {
    return FIELD_LABELS[key] ?? toTitleCase(key);
}

// ---------------------------------------------------------------------------
// Section heading labels
// ---------------------------------------------------------------------------
const SECTION_LABELS: Record<keyof MonitoringGradePanel, string> = {
    ai_performance: 'AI Performance',
    conversation_health: 'Conversation Health',
    user_signals: 'User Signals',
    escalation: 'Escalation',
    intent: 'Intent',
};

const SECTION_ORDER: (keyof MonitoringGradePanel)[] = [
    'ai_performance',
    'conversation_health',
    'user_signals',
    'escalation',
    'intent',
];

// ---------------------------------------------------------------------------
// Score badge
// ---------------------------------------------------------------------------
function ScoreBadge({ score }: { score: number }) {
    const { bg, text } = heatColor(score);
    return (
        <span
            className="inline-block rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums"
            style={{ backgroundColor: bg, color: text }}
        >
            {score.toFixed(1)}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Boolean value display
// ---------------------------------------------------------------------------
function BooleanValue({ value }: { value: boolean }) {
    return value ? (
        <span className="text-xs font-medium" style={{ color: '#1D9E75' }}>
            Yes
        </span>
    ) : (
        <span className="text-xs font-medium" style={{ color: '#E24B4A' }}>
            No
        </span>
    );
}

// ---------------------------------------------------------------------------
// String value badge (escalation_type uses ESCALATION_COLORS)
// ---------------------------------------------------------------------------
function StringBadge({ fieldKey, value }: { fieldKey: string; value: string }) {
    const isEscalationType = fieldKey === 'escalation_type';
    const bgColor = isEscalationType
        ? (ESCALATION_COLORS[value] ?? '#B4B2A9')
        : '#E5E4DF';
    const textColor = isEscalationType ? '#1A1A1A' : '#444340';

    return (
        <span
            className="inline-block rounded px-1.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {value}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Individual field row
// ---------------------------------------------------------------------------
interface FieldRowProps {
    fieldKey: string;
    field: GradePanelField;
    expanded: boolean;
    onToggle: () => void;
}

function FieldRow({ fieldKey, field, expanded, onToggle }: FieldRowProps) {
    const label = fieldLabel(fieldKey);
    const hasScore = field.score !== undefined && field.score !== null;
    const hasValue = field.value !== undefined && field.value !== null;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                    {hasScore && <ScoreBadge score={field.score as number} />}
                    {!hasScore && hasValue && typeof field.value === 'boolean' && (
                        <BooleanValue value={field.value} />
                    )}
                    {!hasScore && hasValue && typeof field.value === 'string' && (
                        <StringBadge fieldKey={fieldKey} value={field.value} />
                    )}
                </div>
            </div>

            {/* Reasoning */}
            <div className="flex flex-col gap-0.5">
                <p
                    className="text-xs text-muted-foreground leading-relaxed"
                    style={
                        expanded
                            ? undefined
                            : {
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                              }
                    }
                >
                    {field.reasoning}
                </p>
                {field.reasoning && field.reasoning.length > 120 && (
                    <button
                        onClick={onToggle}
                        className="self-start text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                        {expanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface GradePanelProps {
    panel: MonitoringGradePanel;
}

export function GradePanel({ panel }: GradePanelProps) {
    // Map<"sectionKey.fieldKey", boolean>
    const [expanded, setExpanded] = useState<Map<string, boolean>>(new Map());

    function toggleExpanded(compositeKey: string) {
        setExpanded((prev) => {
            const next = new Map(prev);
            next.set(compositeKey, !prev.get(compositeKey));
            return next;
        });
    }

    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex flex-col gap-6">
                    {SECTION_ORDER.map((sectionKey) => {
                        const section = panel[sectionKey];
                        const fieldEntries = Object.entries(section);
                        if (fieldEntries.length === 0) return null;

                        return (
                            <div key={sectionKey}>
                                <SectionLabel>{SECTION_LABELS[sectionKey]}</SectionLabel>
                                <div className="flex flex-col gap-3">
                                    {fieldEntries.map(([fieldKey, field]) => {
                                        const compositeKey = `${sectionKey}.${fieldKey}`;
                                        return (
                                            <FieldRow
                                                key={compositeKey}
                                                fieldKey={fieldKey}
                                                field={field}
                                                expanded={!!expanded.get(compositeKey)}
                                                onToggle={() => toggleExpanded(compositeKey)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
