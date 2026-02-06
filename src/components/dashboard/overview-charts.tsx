'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
    PieChart,
    Pie
} from 'recharts';

interface OverviewChartsProps {
    volumeData?: any[];
    intentData?: any[];
    peakData?: any[];
    distributionData?: any[];
    type: 'volume' | 'intent' | 'peak' | 'distribution';
}

const INTENT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

export function OverviewCharts({ volumeData, intentData, peakData, distributionData, type }: OverviewChartsProps) {
    if (type === 'intent' && (!intentData || intentData.length === 0)) {
        return (
            <div className="h-[350px] w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                <p className="text-sm font-medium">No intent data available</p>
                <p className="text-xs">Incoming messages haven't been categorized yet.</p>
            </div>
        );
    }

    if (type === 'volume' && volumeData) {
        return (
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            stroke="currentColor"
                            opacity={0.5}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            stroke="currentColor"
                            opacity={0.5}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 'dataMax + 20']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (type === 'peak' && peakData) {
        return (
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={peakData} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                        <XAxis
                            dataKey="hour"
                            stroke="currentColor"
                            opacity={0.5}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}h`}
                        />
                        <YAxis
                            stroke="currentColor"
                            opacity={0.5}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 'dataMax + 10']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorCount)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (type === 'distribution' && distributionData) {
        return (
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {distributionData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'intent' && intentData) {
        return (
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={intentData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="intent"
                            type="category"
                            width={150}
                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                            {intentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={INTENT_COLORS[index % INTENT_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return null;
}
