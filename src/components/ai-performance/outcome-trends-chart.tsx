'use client';

import {
    LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ComposedChart,
} from 'recharts';
import type { OutcomeTrendResponse } from '@/lib/metrics-types';
import { GRADE_COLORS } from './grade-colors';

const TOOLTIP_STYLE = {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const LINES = [
    { key: 'resolution_rate_pct', name: 'Resolution', color: GRADE_COLORS.green, hero: true },
    { key: 'escalation_rate_pct', name: 'Escalation', color: GRADE_COLORS.amber, hero: false },
    { key: 'escalation_failure_rate_pct', name: 'Failure Esc.', color: GRADE_COLORS.coral, hero: false },
    { key: 'loop_detected_rate_pct', name: 'Loop', color: GRADE_COLORS.red, hero: false },
    { key: 'non_genuine_rate_pct', name: 'Non-genuine', color: GRADE_COLORS.gray, hero: false },
] as const;

export function OutcomeTrendsChart({ data }: { data: OutcomeTrendResponse }) {
    if (!data.points || data.points.length === 0) {
        return <p className="text-sm text-muted-foreground">No outcome trend data available.</p>;
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-4 flex-wrap text-[11px]">
                {LINES.map((l) => (
                    <span key={l.key} className="flex items-center gap-1.5">
                        <span
                            className="rounded-sm"
                            style={{
                                backgroundColor: l.color,
                                width: l.hero ? 16 : 10,
                                height: l.hero ? 4 : 2,
                            }}
                        />
                        <span className={l.hero ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                            {l.name}
                        </span>
                    </span>
                ))}
            </div>
            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.08} />
                        <XAxis
                            dataKey="date"
                            stroke="currentColor" opacity={0.4} fontSize={11}
                            tickLine={false} axisLine={false}
                            tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            domain={[0, 100]}
                            stroke="currentColor" opacity={0.4}
                            fontSize={11} tickLine={false} axisLine={false}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                            labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="resolution_rate_pct"
                            name="Resolution"
                            stroke="none"
                            fill={GRADE_COLORS.green}
                            fillOpacity={0.08}
                        />
                        {LINES.map((l) => (
                            <Line
                                key={l.key}
                                type="monotone"
                                dataKey={l.key}
                                name={l.name}
                                stroke={l.color}
                                strokeWidth={l.hero ? 3 : 1.5}
                                strokeDasharray={l.key === 'non_genuine_rate_pct' ? '5 3' : undefined}
                                dot={l.hero ? { r: 3 } : false}
                                activeDot={{ r: 4 }}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
