'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { CorrelationsResponse } from '@/lib/grades-types';
import { heatColor, FUNNEL_COLORS, FRUSTRATION_COLORS, SEVERITY_STYLES } from './grade-colors';
import { SectionLabel } from './section-label';

// Group flat heatmap cells into rows keyed by score_bucket.
function groupHeatmap(cells: CorrelationsResponse['heatmap_cells']) {
    if (!cells || cells.length === 0) return { dims: [] as string[], rows: [] as { label: string; values: { score: number; count: number }[] }[] };
    const dims = Array.from(new Set(cells.map((c) => c.dimension_label)));
    const buckets = Array.from(new Set(cells.map((c) => c.score_bucket)));
    const rows = buckets.map((bucket) => ({
        label: `Scores ${bucket}`,
        values: dims.map((dim) => {
            const cell = cells.find((c) => c.dimension_label === dim && c.score_bucket === bucket);
            return { score: cell?.avg_satisfaction_score ?? 0, count: cell?.conversation_count ?? 0 };
        }),
    }));
    return { dims, rows };
}

export function Correlations({ data }: { data: CorrelationsResponse }) {
    const { dims, rows } = groupHeatmap(data.heatmap_cells);
    const funnel = data.failure_funnel ?? [];
    const maxFunnelCount = funnel.length > 0 ? funnel[0].count : 1;
    const histogram = data.frustration_histogram ?? [];
    const maxHistCount = Math.max(...histogram.map((b) => b.count), 1);
    const storyCards = data.story_cards ?? [];

    return (
        <div className="space-y-7">
            {/* Heatmap */}
            {dims.length > 0 && (
                <div>
                    <SectionLabel>Performance -&gt; outcome heatmap</SectionLabel>
                    <p className="text-xs text-muted-foreground mb-2">Avg user satisfaction when each AI dimension scores in a given range</p>
                    <div className="grid gap-0.5 text-[11px]" style={{ gridTemplateColumns: `90px repeat(${dims.length}, 1fr)` }}>
                        <div />
                        {dims.map((d) => (
                            <div key={d} className="font-medium text-muted-foreground p-1.5 text-center">{d}</div>
                        ))}
                        {rows.map((row) => (
                            <div key={row.label} className="contents">
                                <div className="flex items-center text-muted-foreground pr-2">{row.label}</div>
                                {row.values.map((v, i) => {
                                    const c = heatColor(v.score);
                                    return (
                                        <div
                                            key={i}
                                            className="rounded p-2 text-center text-xs font-medium"
                                            style={{ backgroundColor: c.bg, color: c.text }}
                                            title={`${v.score.toFixed(1)} avg sat (${v.count} convos)`}
                                        >
                                            {v.score.toFixed(1)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Failure funnel */}
            {funnel.length > 0 && (
                <div>
                    <SectionLabel>Failure escalation funnel</SectionLabel>
                    <p className="text-xs text-muted-foreground mb-2">What happens in conversations that end in failure escalation</p>
                    <div className="flex flex-col gap-1">
                        {funnel.map((step, i) => {
                            const pct = Math.max((step.count / maxFunnelCount) * 100, 5);
                            return (
                                <div key={step.step_key} className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground w-[140px] text-right flex-shrink-0">{step.label}</span>
                                    <div
                                        className="h-8 rounded flex items-center px-3 text-xs font-medium text-white transition-all duration-500"
                                        style={{ width: `${pct}%`, backgroundColor: FUNNEL_COLORS[i] ?? FUNNEL_COLORS[FUNNEL_COLORS.length - 1], minWidth: 40 }}
                                    >
                                        {step.count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Frustration histogram */}
            {histogram.length > 0 && (() => {
                const totalHist = histogram.reduce((s, b) => s + b.count, 0);
                return (
                    <Card>
                        <CardContent className="p-5">
                            <SectionLabel>Frustration score distribution</SectionLabel>
                            <p className="text-xs text-muted-foreground mb-4">How conversations cluster by frustration level</p>

                            <div className="flex gap-2 items-end" style={{ height: 140 }}>
                                {histogram.map((b, i) => {
                                    const barH = maxHistCount > 0 ? Math.max(Math.round((b.count / maxHistCount) * 130), 6) : 6;
                                    const sharePct = totalHist > 0 ? ((b.count / totalHist) * 100).toFixed(1) : '0';
                                    const color = FRUSTRATION_COLORS[i] ?? FRUSTRATION_COLORS[FRUSTRATION_COLORS.length - 1];
                                    return (
                                        <div key={b.bucket_label} className="flex-1 flex flex-col items-center justify-end group/bar">
                                            <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150 mb-1 px-2 py-1 rounded-md bg-popover border border-border shadow-sm whitespace-nowrap">
                                                <div className="text-[10px] font-bold text-popover-foreground text-center">{b.count}</div>
                                                <div className="text-[9px] text-muted-foreground text-center">{sharePct}%</div>
                                            </div>
                                            <div
                                                className="w-full rounded-t-md transition-all duration-500 ease-out relative overflow-hidden group-hover/bar:brightness-110"
                                                style={{ height: barH, backgroundColor: color }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                                {histogram.map((b, i) => {
                                    const color = FRUSTRATION_COLORS[i] ?? FRUSTRATION_COLORS[FRUSTRATION_COLORS.length - 1];
                                    return (
                                        <div key={b.bucket_label} className="flex-1 text-center">
                                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                                <span className="text-[11px] font-medium text-foreground">{b.bucket_label}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">{b.count} convos</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* Story cards -- hidden for now, data still fetched */}
        </div>
    );
}
