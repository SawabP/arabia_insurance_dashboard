'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { AgentPulseResponse } from '@/lib/grades-types';
import type { ScoreTrendResponse } from '@/lib/metrics-types';
import type { IntentDistributionResponse } from '@/lib/metrics-types';
import { GRADE_COLORS, ESCALATION_COLORS, SEVERITY_STYLES } from './grade-colors';
import { ScoreRing } from './score-ring';
import { DimensionBars } from './dimension-bars';
import { SectionLabel } from './section-label';
import { ScoreTrendsChart } from './score-trends-chart';
import { IntentDistribution } from './intent-distribution';

function r1(v: number) { return +v.toFixed(1); }

interface AgentPulseProps {
    data: AgentPulseResponse;
    scoreTrends: ScoreTrendResponse;
    intentDistribution: IntentDistributionResponse;
}

export function AgentPulse({ data, scoreTrends, intentDistribution }: AgentPulseProps) {
    const escalation = data.escalation_breakdown ?? [];
    const totalEsc = escalation.reduce((s, e) => s + e.count, 0);
    const dims = {
        relevancy: r1(data.dimension_averages.relevancy),
        accuracy: r1(data.dimension_averages.accuracy),
        completeness: r1(data.dimension_averages.completeness),
        clarity: r1(data.dimension_averages.clarity),
        tone: r1(data.dimension_averages.tone),
    };

    return (
        <div className="space-y-6">
            {/* Score ring + dimension bars */}
            <Card>
                <CardContent className="p-6 flex gap-6 items-start">
                    <ScoreRing score={+data.overall_composite_score.toFixed(1)} />
                    <div className="flex-1">
                        <SectionLabel>AI performance dimensions</SectionLabel>
                        <DimensionBars dimensions={dims} />
                    </div>
                </CardContent>
            </Card>

            {/* Conversation health */}
            <div>
                <SectionLabel>Conversation health</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Resolved', value: `${r1(data.health.resolution_rate_pct)}%`, cls: 'text-emerald-700 dark:text-emerald-400' },
                        { label: 'Repetition avg', value: r1(data.health.avg_repetition_score), cls: 'text-amber-700 dark:text-amber-400' },
                        { label: 'Loops detected', value: `${r1(data.health.loop_detected_rate_pct)}%`, cls: 'text-red-700 dark:text-red-400' },
                    ].map((c) => (
                        <Card key={c.label}>
                            <CardContent className="p-4">
                                <div className="text-[11px] text-muted-foreground">{c.label}</div>
                                <div className={`text-xl font-medium ${c.cls}`}>{c.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Escalation strip */}
            {escalation.length > 0 && (
                <div>
                    <div className="text-xs text-muted-foreground mb-1">
                        Escalation breakdown (of {totalEsc} conversations)
                    </div>
                    <div className="flex h-2.5 rounded-full overflow-hidden">
                        {escalation.map((e) => (
                            <div
                                key={e.escalation_type}
                                style={{ width: `${e.share_pct}%`, backgroundColor: ESCALATION_COLORS[e.escalation_type] ?? GRADE_COLORS.gray }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-4 mt-1.5 text-[11px] text-muted-foreground">
                        {escalation.map((e) => (
                            <span key={e.escalation_type} className="flex items-center gap-1">
                                <span
                                    className="w-2 h-2 rounded-sm"
                                    style={{ backgroundColor: ESCALATION_COLORS[e.escalation_type] ?? GRADE_COLORS.gray }}
                                />
                                {e.escalation_type} {r1(e.share_pct)}%
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* User signals */}
            <div>
                <SectionLabel>User signals</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                    <Card><CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Satisfaction</div>
                        <div className="text-xl font-medium text-emerald-700 dark:text-emerald-400">
                            {r1(data.user_signals.avg_satisfaction_score)}
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Frustration</div>
                        <div className="text-xl font-medium text-red-700 dark:text-red-400">
                            {r1(data.user_signals.avg_frustration_score)}
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Genuine interactions</div>
                        <div className="text-xl font-medium">
                            {r1(data.user_signals.user_relevancy_rate_pct)}%
                        </div>
                    </CardContent></Card>
                </div>
            </div>

            {/* Per-dimension score trends */}
            <ScoreTrendsChart data={scoreTrends} />

            {/* Categorized intent distribution */}
            <IntentDistribution data={intentDistribution} />

            {/* Attention signals */}
            {data.attention_signals && data.attention_signals.length > 0 && (
                <div>
                    <SectionLabel>Attention signals</SectionLabel>
                    <div className="flex gap-2 flex-wrap">
                        {data.attention_signals.map((s) => {
                            const style = SEVERITY_STYLES[s.severity] ?? SEVERITY_STYLES.info;
                            return (
                                <div key={s.code} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                    {s.message}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
