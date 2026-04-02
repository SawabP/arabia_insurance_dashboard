'use client';

import { useMemo, useState } from 'react';
import { Check, Minus, Minimize2, Maximize2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { MonitoringConversationDetail } from '@/lib/monitoring-types';
import { HighlightBadge } from './highlight-badge';
import { GradePanel } from './grade-panel';
import { TranscriptView } from './transcript-view';

const TABS = ['AI Grades', 'Transcript', 'History'] as const;

function formatDateLabel(value: string) {
    try {
        return format(parseISO(value), 'MMM dd, yyyy');
    } catch {
        return value;
    }
}

function statusBadgeClasses(kind: 'intent' | 'resolved' | 'unresolved' | 'failure' | 'natural') {
    switch (kind) {
        case 'intent':
            return 'bg-[#EFF6FF] text-[#2563EB]';
        case 'resolved':
            return 'bg-[#F0FDF4] text-[#1D9E75]';
        case 'unresolved':
            return 'bg-[#FEF2F2] text-[#E24B4A]';
        case 'failure':
            return 'bg-[#FFF7ED] text-[#D85A30]';
        case 'natural':
            return 'bg-[#ECFDF5] text-[#0F766E]';
    }
}

function resolutionSummary(value: boolean | null) {
    if (value === null) {
        return <Minus className="h-4 w-4 text-[#9C9889]" />;
    }

    return value ? (
        <Check className="h-4 w-4 text-[#1D9E75]" />
    ) : (
        <X className="h-4 w-4 text-[#E24B4A]" />
    );
}

interface ConversationDetailProps {
    detail: MonitoringConversationDetail;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

export function ConversationDetail({ detail, expanded = false, onToggleExpand }: ConversationDetailProps) {
    const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('AI Grades');

    const historyItems = useMemo(() => detail.recent_history.slice(0, 6), [detail.recent_history]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-[#E5E7EB] px-8 pb-4 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#1A1917]">
                            {detail.contact_name ?? 'Anonymous'}
                        </h2>
                        <p className="text-[12px] text-[#8B8796]">
                            Graded {formatDateLabel(detail.grade_date)}
                            {detail.message_count > 0 ? ` · ${detail.message_count} messages` : ''}
                        </p>
                    </div>

                    <div className="flex max-w-full flex-wrap items-start gap-2">
                        {onToggleExpand && (
                            <button
                                type="button"
                                onClick={onToggleExpand}
                                className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#9C9889] transition-colors hover:border-[#D1D5DB] hover:text-[#1A1917]"
                                aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
                            >
                                {expanded
                                    ? <Minimize2 className="h-3.5 w-3.5" />
                                    : <Maximize2 className="h-3.5 w-3.5" />
                                }
                            </button>
                        )}
                        {detail.intent_label && (
                            <span className={cn('rounded-md px-3 py-1 text-[11px] font-semibold', statusBadgeClasses('intent'))}>
                                {detail.intent_label}
                            </span>
                        )}
                        {detail.resolution !== null && (
                            <span
                                className={cn(
                                    'rounded-md px-3 py-1 text-[11px] font-semibold',
                                    statusBadgeClasses(detail.resolution ? 'resolved' : 'unresolved'),
                                )}
                            >
                                {detail.resolution ? 'Resolved' : 'Unresolved'}
                            </span>
                        )}
                        {detail.escalation_type && detail.escalation_type !== 'None' && (
                            <span
                                className={cn(
                                    'rounded-md px-3 py-1 text-[11px] font-semibold',
                                    statusBadgeClasses(detail.escalation_type === 'Failure' ? 'failure' : 'natural'),
                                )}
                            >
                                {detail.escalation_type === 'Failure' ? 'Failure Escalation' : `${detail.escalation_type} Handover`}
                            </span>
                        )}
                    </div>
                </div>

                {detail.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {detail.highlights.map((highlight) => (
                            <HighlightBadge key={highlight.code} code={highlight.code} label={highlight.label} />
                        ))}
                    </div>
                )}

                <div className="mt-4 flex items-center gap-6 border-b border-[#E5E7EB]">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'border-b-2 px-1 pb-3 text-[13px] font-semibold transition-colors',
                                activeTab === tab
                                    ? 'border-[#2563EB] text-[#2563EB]'
                                    : 'border-transparent text-[#6B6960] hover:text-[#1A1917]',
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
                {activeTab === 'AI Grades' && (
                    <div className="h-full overflow-auto px-8 py-6">
                        <GradePanel panel={detail.grade_panel} />
                    </div>
                )}

                {activeTab === 'Transcript' && <TranscriptView messages={detail.transcript} />}

                {activeTab === 'History' && (
                    <div className="h-full overflow-auto px-8 py-6">
                        <div className="space-y-3">
                            {historyItems.length === 0 && (
                                <p className="text-sm text-[#8B8796]">No previous grades are available for this conversation.</p>
                            )}

                            {historyItems.map((item) => (
                                <div key={item.grade_id} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] px-4 py-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="text-[13px] font-semibold text-[#1A1917]">
                                                {formatDateLabel(item.grade_date)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B6960]">
                                                <span className="inline-flex items-center gap-1">
                                                    {resolutionSummary(item.resolution)}
                                                    {item.resolution === null ? 'Unknown' : item.resolution ? 'Resolved' : 'Unresolved'}
                                                </span>
                                                {item.frustration_score !== null && <span>Frustration {item.frustration_score}/10</span>}
                                                {item.accuracy_score !== null && <span>Accuracy {item.accuracy_score}/10</span>}
                                                {item.escalation_type && item.escalation_type !== 'None' && <span>{item.escalation_type === 'Failure' ? 'Failure escalation' : `${item.escalation_type} handover`}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.highlights.length > 0 ? (
                                                item.highlights.map((highlight) => (
                                                    <HighlightBadge key={highlight.code} code={highlight.code} label={highlight.label} />
                                                ))
                                            ) : (
                                                <span className="text-[11px] font-medium text-[#B0AAA0]">No highlights</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
