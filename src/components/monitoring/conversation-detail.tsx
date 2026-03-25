'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MonitoringConversationDetail } from '@/lib/monitoring-types';
import { HighlightBadge } from './highlight-badge';
import { GradePanel } from './grade-panel';
import { TranscriptView } from './transcript-view';
import { ESCALATION_COLORS, GRADE_COLORS } from '@/components/ai-performance/grade-colors';

const TABS = ['AI Grades', 'Transcript', 'History'] as const;

function EscalationBadge({ type }: { type: string | null }) {
    if (!type || type === 'None') return null;
    const color = ESCALATION_COLORS[type] ?? GRADE_COLORS.gray;
    const textClass = type === 'Failure' ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30' : 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30';
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${textClass}`}>
            {type} Escalation
        </span>
    );
}

interface ConversationDetailProps {
    detail: MonitoringConversationDetail;
}

export function ConversationDetail({ detail }: ConversationDetailProps) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="font-semibold text-base">{detail.contact_name ?? 'Anonymous'}</div>
                        <div className="text-[11px] text-muted-foreground">Graded {detail.grade_date} &middot; {detail.message_count} messages</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-[55%]">
                        {detail.intent_label && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                                {detail.intent_label}
                            </span>
                        )}
                        {detail.resolution !== null && (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${detail.resolution ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
                                {detail.resolution ? 'Resolved' : 'Unresolved'}
                            </span>
                        )}
                        <EscalationBadge type={detail.escalation_type} />
                    </div>
                </div>
                {detail.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {detail.highlights.map((h) => (
                            <HighlightBadge key={h.code} code={h.code} label={h.label} />
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                {TABS.map((label, i) => (
                    <button
                        key={label}
                        onClick={() => setActiveTab(i)}
                        className={cn(
                            'px-4 py-2 text-xs font-medium transition-colors',
                            activeTab === i
                                ? 'text-primary border-b-2 border-primary -mb-px'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 0 && (
                    <div className="p-4">
                        <GradePanel panel={detail.grade_panel} />
                    </div>
                )}
                {activeTab === 1 && (
                    <TranscriptView messages={detail.transcript} />
                )}
                {activeTab === 2 && (
                    <div className="p-4 space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Grade History
                        </div>
                        {detail.recent_history.length === 0 && (
                            <p className="text-sm text-muted-foreground">No previous grades.</p>
                        )}
                        {detail.recent_history.map((item) => (
                            <div key={item.grade_id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
                                <span className="font-medium text-muted-foreground w-20 flex-shrink-0">{item.grade_date}</span>
                                <span className={item.resolution ? 'text-emerald-600' : 'text-red-500'}>
                                    {item.resolution === null ? '—' : item.resolution ? 'Resolved' : 'Unresolved'}
                                </span>
                                {item.escalation_type && item.escalation_type !== 'None' && (
                                    <span className={item.escalation_type === 'Failure' ? 'text-red-600' : 'text-teal-600'}>
                                        {item.escalation_type} Esc.
                                    </span>
                                )}
                                <span className="text-muted-foreground">
                                    Frust: {item.frustration_score ?? '—'}
                                </span>
                                <div className="flex flex-wrap gap-1 ml-auto">
                                    {item.highlights.slice(0, 2).map((h) => (
                                        <HighlightBadge key={h.code} code={h.code} label={h.label} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
