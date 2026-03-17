'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { AgentPulseResponse } from '@/lib/grades-types';
import { GRADE_COLORS, ESCALATION_COLORS, SEVERITY_STYLES } from './grade-colors';
import { ScoreRing } from './score-ring';
import { DimensionBars } from './dimension-bars';
import { SectionLabel } from './section-label';

const TOOLTIP_STYLE = {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

function r1(v: number) { return +v.toFixed(1); }

export function AgentPulse({ data }: { data: AgentPulseResponse }) {
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

            {/* Trend chart */}
            {data.trend_points && data.trend_points.length > 0 && (
                <div>
                    <SectionLabel>Performance trend</SectionLabel>
                    <div className="flex gap-4 mb-2 text-[11px] text-muted-foreground">
                        {[
                            { color: GRADE_COLORS.green, label: 'Satisfaction' },
                            { color: GRADE_COLORS.red, label: 'Frustration' },
                            { color: GRADE_COLORS.blue, label: 'Overall perf' },
                        ].map((l) => (
                            <span key={l.label} className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                                {l.label}
                            </span>
                        ))}
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trend_points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    stroke="currentColor" opacity={0.5} fontSize={11}
                                    tickLine={false} axisLine={false}
                                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    domain={[0, 10]} stroke="currentColor" opacity={0.5}
                                    fontSize={11} tickLine={false} axisLine={false}
                                />
                                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                                <Line type="monotone" dataKey="satisfaction_score" name="Satisfaction" stroke={GRADE_COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="frustration_score" name="Frustration" stroke={GRADE_COLORS.red} strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="overall_composite_score" name="Overall" stroke={GRADE_COLORS.blue} strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Top intents */}
            {data.top_intents && data.top_intents.length > 0 && (
                <div>
                    <SectionLabel>Top intents</SectionLabel>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
                        {data.top_intents.map((t) => (
                            <div key={t.intent_code} className="bg-muted/50 rounded-lg p-3 text-center">
                                <div className="text-lg font-medium leading-tight">{t.count}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">{t.intent_label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
