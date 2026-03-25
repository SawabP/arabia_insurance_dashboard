'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { GRADE_COLORS } from './grade-colors';
import { SectionLabel } from './section-label';
import type { ScoreTrendResponse } from '@/lib/metrics-types';

const TOOLTIP_STYLE: React.CSSProperties = {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

interface LineDef {
    dataKey: string;
    label: string;
    color: string;
    dashed?: boolean;
}

const LINES: LineDef[] = [
    { dataKey: 'relevancy', label: 'Relevancy', color: GRADE_COLORS.green },
    { dataKey: 'accuracy', label: 'Accuracy', color: GRADE_COLORS.blue },
    { dataKey: 'completeness', label: 'Completeness', color: '#7C3AED' },
    { dataKey: 'clarity', label: 'Clarity', color: GRADE_COLORS.teal },
    { dataKey: 'tone', label: 'Tone', color: GRADE_COLORS.coral },
    { dataKey: 'satisfaction', label: 'Satisfaction', color: GRADE_COLORS.gray, dashed: true },
    { dataKey: 'frustration', label: 'Frustration', color: GRADE_COLORS.red, dashed: true },
];

export function ScoreTrendsChart({ data }: { data: ScoreTrendResponse }) {
    const [hidden, setHidden] = useState<Set<string>>(new Set());

    function toggle(key: string) {
        setHidden((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }

    if (!data.points || data.points.length === 0) return null;

    return (
        <div>
            <SectionLabel>Performance trend</SectionLabel>
            <p className="text-[11px] text-muted-foreground mb-3">
                Daily averages per dimension across selected window
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-[11px] text-muted-foreground">
                {LINES.map((l) => (
                    <button
                        key={l.dataKey}
                        type="button"
                        onClick={() => toggle(l.dataKey)}
                        className="flex items-center gap-1 transition-opacity"
                        style={{ opacity: hidden.has(l.dataKey) ? 0.35 : 1 }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{
                                backgroundColor: l.color,
                                border: l.dashed ? `1px dashed ${l.color}` : undefined,
                            }}
                        />
                        {l.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            stroke="currentColor"
                            opacity={0.5}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: string) =>
                                new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            }
                        />
                        <YAxis
                            domain={[0, 10]}
                            stroke="currentColor"
                            opacity={0.5}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        {LINES.map((l) => (
                            <Line
                                key={l.dataKey}
                                type="monotone"
                                dataKey={l.dataKey}
                                name={l.label}
                                stroke={l.color}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                hide={hidden.has(l.dataKey)}
                                {...(l.dashed ? { strokeDasharray: '6 4' } : {})}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
