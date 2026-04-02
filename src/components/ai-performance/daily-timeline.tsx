'use client';

import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { DailyTimelineResponse } from '@/lib/grades-types';
import { GRADE_COLORS, resColor } from './grade-colors';
import { SectionLabel } from './section-label';
import { MiniPerf } from './mini-perf';
import { ScoreDot } from './score-dot';
import { HourCellTooltip } from './hour-cell-tooltip';

const TOOLTIP_STYLE = {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
};

export function DailyTimeline({ data }: { data: DailyTimelineResponse }) {
    const hourly = data.hourly_buckets ?? [];
    const maxVol = Math.max(...hourly.map((h) => h.conversation_volume), 1);
    const scatter = data.scatter_points ?? [];
    const worst = data.worst_performers ?? [];

    const resolved = scatter.filter((p) => p.resolution && !p.loop_detected).map((p) => ({ x: p.satisfaction_score, y: p.frustration_score }));
    const unresolved = scatter.filter((p) => !p.resolution && !p.loop_detected).map((p) => ({ x: p.satisfaction_score, y: p.frustration_score }));
    const loops = scatter.filter((p) => p.loop_detected).map((p) => ({ x: p.satisfaction_score, y: p.frustration_score }));

    return (
        <div className="space-y-6">
            {/* Hourly resolution heatmap */}
            {hourly.length > 0 && (
                <div>
                    <SectionLabel>Hourly resolution heatmap -- {data.target_date}</SectionLabel>
                    <p className="text-xs text-muted-foreground mb-2">Color = resolution rate, circle size = conversation volume</p>
                    <div className="grid grid-cols-[repeat(24,1fr)] gap-0.5 min-w-[600px]">
                        {hourly.map((h) => {
                            const noData = h.conversation_volume === 0;
                            const sz = noData ? 0 : Math.max(6, Math.round((h.conversation_volume / maxVol) * 28));
                            return (
                                <div
                                    key={h.hour}
                                    className={`aspect-square rounded-sm relative group/cell ${noData ? 'bg-muted' : ''}`}
                                    style={noData ? undefined : { backgroundColor: resColor(h.resolution_rate_pct) }}
                                >
                                    {!noData && (
                                        <div
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/15 dark:bg-white/20"
                                            style={{ width: sz, height: sz }}
                                        />
                                    )}
                                    <HourCellTooltip hour={h.hour} volume={h.conversation_volume} resolutionPct={h.resolution_rate_pct} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-[repeat(24,1fr)] gap-0.5 mt-0.5 text-[9px] text-muted-foreground text-center">
                        {hourly.map((h) => {
                            if (h.hour % 3 !== 0) return <div key={h.hour} />;
                            const h12 = h.hour % 12 || 12;
                            const p = h.hour < 12 ? 'a' : 'p';
                            return <div key={h.hour}>{h12}{p}</div>;
                        })}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                        <span>Low</span>
                        {['#FCEBEB', '#FAC775', '#9FE1CB', '#5DCAA5', '#1D9E75'].map((c) => (
                            <div key={c} className="w-3.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                        ))}
                        <span>High</span>
                        <span className="ml-2 pl-2 border-l border-border">Circle size = volume</span>
                    </div>
                </div>
            )}

            {/* Best / worst hour */}
            <div className="grid grid-cols-2 gap-3">
                {data.worst_hour && (
                    <Card><CardContent className="p-4">
                        <div className="text-[11px] text-muted-foreground">Worst hour</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-medium text-red-700 dark:text-red-400">{data.worst_hour.hour}:00</span>
                            <span className="text-[11px] text-muted-foreground">{data.worst_hour.resolution_rate_pct.toFixed(0)}% resolution, {data.worst_hour.conversation_volume} convos</span>
                        </div>
                    </CardContent></Card>
                )}
                {data.best_hour && (
                    <Card><CardContent className="p-4">
                        <div className="text-[11px] text-muted-foreground">Best hour</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-medium text-emerald-700 dark:text-emerald-400">{data.best_hour.hour}:00</span>
                            <span className="text-[11px] text-muted-foreground">{data.best_hour.resolution_rate_pct.toFixed(0)}% resolution, {data.best_hour.conversation_volume} convos</span>
                        </div>
                    </CardContent></Card>
                )}
            </div>

            {/* Scatter plot */}
            {scatter.length > 0 && (
                <div>
                    <SectionLabel>Satisfaction vs frustration scatter</SectionLabel>
                    <div className="flex gap-4 mb-2 text-[11px] text-muted-foreground">
                        {[
                            { color: GRADE_COLORS.green, label: 'Resolved' },
                            { color: GRADE_COLORS.red, label: 'Unresolved' },
                            { color: GRADE_COLORS.amber, label: 'Loop detected' },
                        ].map((l) => (
                            <span key={l.label} className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                                {l.label}
                            </span>
                        ))}
                    </div>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                <XAxis
                                    type="number" dataKey="x" name="Satisfaction" domain={[0, 10]}
                                    stroke="currentColor" opacity={0.5} fontSize={11}
                                    tickLine={false} label={{ value: 'Satisfaction', position: 'bottom', fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                                />
                                <YAxis
                                    type="number" dataKey="y" name="Frustration" domain={[0, 10]}
                                    stroke="currentColor" opacity={0.5} fontSize={11}
                                    tickLine={false} label={{ value: 'Frustration', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                                />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    formatter={(value: number, name: string) => [value, name]}
                                />
                                {resolved.length > 0 && <Scatter name="Resolved" data={resolved} fill={`${GRADE_COLORS.green}80`} stroke={GRADE_COLORS.green} />}
                                {unresolved.length > 0 && <Scatter name="Unresolved" data={unresolved} fill={`${GRADE_COLORS.red}80`} stroke={GRADE_COLORS.red} />}
                                {loops.length > 0 && <Scatter name="Loop detected" data={loops} fill={`${GRADE_COLORS.amber}80`} stroke={GRADE_COLORS.amber} />}
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Worst performers table */}
            {worst.length > 0 && (
                <div>
                    <SectionLabel>Worst performers</SectionLabel>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-[11px]">Contact</TableHead>
                                <TableHead className="text-[11px]">Intent</TableHead>
                                <TableHead className="text-[11px]">Perf</TableHead>
                                <TableHead className="text-[11px]">Sat</TableHead>
                                <TableHead className="text-[11px]">Fru</TableHead>
                                <TableHead className="text-[11px]">Resolved</TableHead>
                                <TableHead className="text-[11px]">Handover</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {worst.map((row) => (
                                <TableRow key={row.grade_id}>
                                    <TableCell className="font-mono text-[11px]">{row.contact_label ?? row.conversation_key.slice(0, 12)}</TableCell>
                                    <TableCell className="text-xs">{row.intent_label ?? '--'}</TableCell>
                                    <TableCell>
                                        <MiniPerf scores={[row.relevancy_score, row.accuracy_score, row.completeness_score, row.clarity_score, row.tone_score]} />
                                    </TableCell>
                                    <TableCell><ScoreDot value={row.satisfaction_score} /></TableCell>
                                    <TableCell><ScoreDot value={row.frustration_score} inverted /></TableCell>
                                    <TableCell>
                                        <Badge variant={row.resolution ? 'default' : 'destructive'} className="text-[10px]">
                                            {row.resolution ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {row.escalation_type ? (
                                            <Badge variant={row.escalation_type === 'Failure' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                {row.escalation_type}
                                            </Badge>
                                        ) : '--'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
