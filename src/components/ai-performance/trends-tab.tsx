'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { OutcomeTrendResponse, IntentDistributionResponse, IntentTrendResponse } from '@/lib/metrics-types';
import { OutcomeTrendsChart } from './outcome-trends-chart';
import { IntentTrendsChart } from './intent-trends-chart';
import { SectionLabel } from './section-label';

interface OutcomeDelta {
    key: string;
    label: string;
    current: number;
    previous: number;
    delta: number;
    hero?: boolean;
    /** true = higher is better (resolution), false = lower is better (loop), null = neutral (handover) */
    higherIsBetter: boolean | null;
}

interface IntentMovement {
    intentCode: string;
    intentLabel: string;
    intentCategory: string;
    currentCount: number;
    previousCount: number;
    changePct: number;
}

function computeOutcomeDeltas(
    current: OutcomeTrendResponse,
    previous: OutcomeTrendResponse,
): OutcomeDelta[] {
    const avg = (points: OutcomeTrendResponse['points'], key: keyof OutcomeTrendResponse['points'][0]) => {
        if (!points || points.length === 0) return 0;
        const vals = points.map((p) => p[key] as number);
        return vals.reduce((s, v) => s + v, 0) / vals.length;
    };

    const metrics: { key: keyof OutcomeTrendResponse['points'][0]; label: string; hero?: boolean; higherIsBetter: boolean | null }[] = [
        { key: 'resolution_rate_pct', label: 'Resolution Rate', hero: true, higherIsBetter: true },
        { key: 'escalation_rate_pct', label: 'Handover', hero: false, higherIsBetter: null },
        { key: 'escalation_failure_rate_pct', label: 'Escalation', hero: false, higherIsBetter: false },
        { key: 'loop_detected_rate_pct', label: 'Loop Detected', hero: false, higherIsBetter: false },
        { key: 'non_genuine_rate_pct', label: 'Non-genuine', hero: false, higherIsBetter: false },
    ];

    return metrics.map((m) => {
        const cur = avg(current.points, m.key);
        const prev = avg(previous.points, m.key);
        return {
            key: m.key,
            label: m.label,
            current: +cur.toFixed(1),
            previous: +prev.toFixed(1),
            delta: +(cur - prev).toFixed(1),
            hero: m.hero,
            higherIsBetter: m.higherIsBetter,
        };
    });
}

function computeIntentMovement(
    current: IntentDistributionResponse,
    previous: IntentDistributionResponse,
): IntentMovement[] {
    const prevMap = new Map(previous.items.map((i) => [i.intent_code, i.count]));

    return current.items
        .map((item) => {
            const prevCount = prevMap.get(item.intent_code) ?? 0;
            const changePct = prevCount > 0
                ? +((item.count - prevCount) / prevCount * 100).toFixed(0)
                : item.count > 0 ? 100 : 0;
            return {
                intentCode: item.intent_code,
                intentLabel: item.intent_label,
                intentCategory: item.intent_category,
                currentCount: item.count,
                previousCount: prevCount,
                changePct,
            };
        })
        .filter((m) => m.changePct !== 0)
        .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
        .slice(0, 5);
}

function DeltaBadge({ delta, higherIsBetter }: { delta: number; higherIsBetter: boolean | null }) {
    if (Math.abs(delta) < 0.1) {
        return <span className="text-[11px] font-semibold text-muted-foreground">--</span>;
    }

    const isPositive = delta > 0;
    let color, bgColor;
    if (higherIsBetter === null) {
        color = 'text-slate-600 dark:text-slate-400';
        bgColor = 'bg-slate-100 dark:bg-slate-800/50';
    } else {
        const isGood = higherIsBetter ? isPositive : !isPositive;
        color = isGood ? 'text-emerald-600' : 'text-red-500';
        bgColor = isGood ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30';
    }
    const sign = isPositive ? '+' : '';

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${color} ${bgColor}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                {isPositive ? (
                    <><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>
                ) : (
                    <><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>
                )}
            </svg>
            {sign}{delta.toFixed(1)}pp
        </span>
    );
}

function MovementBadge({ changePct }: { changePct: number }) {
    const isUp = changePct > 0;
    const color = isUp ? 'text-red-500' : 'text-emerald-600';
    const bgColor = isUp ? 'bg-red-50 dark:bg-red-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30';
    const sign = isUp ? '+' : '';

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${color} ${bgColor}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                {isUp ? (
                    <><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>
                ) : (
                    <><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>
                )}
            </svg>
            {sign}{changePct}%
        </span>
    );
}

export interface TrendsTabProps {
    outcomeTrends: OutcomeTrendResponse;
    outcomeTrendsPrev: OutcomeTrendResponse;
    intentDistribution: IntentDistributionResponse;
    intentDistributionPrev: IntentDistributionResponse;
    intentTrend: IntentTrendResponse;
}

export function TrendsTab({
    outcomeTrends,
    outcomeTrendsPrev,
    intentDistribution,
    intentDistributionPrev,
    intentTrend,
}: TrendsTabProps) {
    const deltas = computeOutcomeDeltas(outcomeTrends, outcomeTrendsPrev);
    const movements = computeIntentMovement(intentDistribution, intentDistributionPrev);
    const heroMetric = deltas.find((d) => d.hero);
    const secondaryMetrics = deltas.filter((d) => !d.hero);

    return (
        <div className="space-y-6">
            {/* Delta cards */}
            <div className="flex gap-3">
                {heroMetric && (
                    <Card className="flex-[1.6] border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    {heroMetric.label}
                                </span>
                                <DeltaBadge delta={heroMetric.delta} higherIsBetter={heroMetric.higherIsBetter} />
                            </div>
                            <div className="text-3xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">
                                {heroMetric.current}%
                            </div>
                            <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 mt-1">
                                vs {heroMetric.previous}% previous period
                            </div>
                        </CardContent>
                    </Card>
                )}
                {secondaryMetrics.map((m) => (
                    <Card key={m.key} className="flex-1">
                        <CardContent className="p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                {m.label}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold tracking-tight">{m.current}%</span>
                                <DeltaBadge delta={m.delta} higherIsBetter={m.higherIsBetter} />
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                vs {m.previous}% prev
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Outcome rate trends chart */}
            <div>
                <SectionLabel>Outcome rate trends</SectionLabel>
                <p className="text-xs text-muted-foreground mb-3">How resolution, handover, and failure rates change over time</p>
                <OutcomeTrendsChart data={outcomeTrends} />
            </div>

            {/* Intent section: stacked bars + movement table side by side */}
            <div className="flex gap-4">
                <div className="flex-[1.4]">
                    <SectionLabel>Daily intent volume</SectionLabel>
                    <p className="text-xs text-muted-foreground mb-3">Conversation count by intent per day</p>
                    <IntentTrendsChart data={intentTrend} />
                </div>
                {movements.length > 0 && (
                    <Card className="w-[300px] flex-shrink-0">
                        <CardContent className="p-0">
                            <div className="px-4 py-3 border-b">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Intent Movement
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">vs previous period</div>
                            </div>
                            {movements.map((m, i) => (
                                <div
                                    key={m.intentCode}
                                    className={`flex items-center justify-between px-4 py-3 ${i < movements.length - 1 ? 'border-b' : ''}`}
                                >
                                    <div>
                                        <div className="text-sm font-semibold">{m.intentLabel}</div>
                                        <div className="text-[10px] text-muted-foreground">{m.intentCategory}</div>
                                    </div>
                                    <MovementBadge changePct={m.changePct} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
