'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { IntentTrendResponse } from '@/lib/metrics-types';

const TOOLTIP_STYLE = {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const INTENT_COLORS = [
    '#3b82f6', // blue
    '#7C3AED', // purple
    '#22c55e', // green
    '#f59e0b', // amber
    '#06b6d4', // cyan
];
const OTHER_COLOR = '#d1d5db';

interface MergedRow {
    date: string;
    [intentCode: string]: string | number;
}

export function IntentTrendsChart({ data }: { data: IntentTrendResponse }) {
    if (!data.series || data.series.length === 0) {
        return <p className="text-sm text-muted-foreground">No intent trend data available.</p>;
    }

    // Rank series by total volume, take top 5, group rest as "other"
    const ranked = [...data.series]
        .map((s) => ({ ...s, total: s.points.reduce((sum, p) => sum + p.count, 0) }))
        .sort((a, b) => b.total - a.total);

    const topSeries = ranked.slice(0, 5);
    const otherSeries = ranked.slice(5);
    const hasOther = otherSeries.length > 0;

    // Build a map: date -> { intent_code: count }
    const dateMap = new Map<string, MergedRow>();

    for (const s of topSeries) {
        for (const p of s.points) {
            if (!dateMap.has(p.date)) {
                dateMap.set(p.date, { date: p.date });
            }
            const row = dateMap.get(p.date)!;
            row[s.intent_code] = p.count;
        }
    }

    if (hasOther) {
        for (const s of otherSeries) {
            for (const p of s.points) {
                if (!dateMap.has(p.date)) {
                    dateMap.set(p.date, { date: p.date });
                }
                const row = dateMap.get(p.date)!;
                row._other = ((row._other as number) || 0) + p.count;
            }
        }
    }

    const chartData = Array.from(dateMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Fill missing values with 0
    const allKeys = topSeries.map((s) => s.intent_code);
    if (hasOther) allKeys.push('_other');
    for (const row of chartData) {
        for (const key of allKeys) {
            if (!(key in row)) row[key] = 0;
        }
    }

    const legendItems = topSeries.map((s, i) => ({
        code: s.intent_code,
        label: s.intent_label,
        color: INTENT_COLORS[i] ?? OTHER_COLOR,
    }));
    if (hasOther) {
        legendItems.push({ code: '_other', label: 'Other', color: OTHER_COLOR });
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-3 flex-wrap text-[11px]">
                {legendItems.map((l) => (
                    <span key={l.code} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
                        <span className="text-muted-foreground">{l.label}</span>
                    </span>
                ))}
            </div>
            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.08} />
                        <XAxis
                            dataKey="date"
                            stroke="currentColor" opacity={0.4} fontSize={11}
                            tickLine={false} axisLine={false}
                            tickFormatter={(v) => {
                                const d = new Date(v);
                                return d.getDate().toString();
                            }}
                        />
                        <YAxis
                            stroke="currentColor" opacity={0.4}
                            fontSize={11} tickLine={false} axisLine={false}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        {topSeries.map((s, i) => (
                            <Bar
                                key={s.intent_code}
                                dataKey={s.intent_code}
                                name={s.intent_label}
                                stackId="intents"
                                fill={INTENT_COLORS[i] ?? OTHER_COLOR}
                                radius={i === 0 ? [3, 3, 0, 0] : undefined}
                            />
                        ))}
                        {hasOther && (
                            <Bar
                                dataKey="_other"
                                name="Other"
                                stackId="intents"
                                fill={OTHER_COLOR}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
