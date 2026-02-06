'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineProps {
    data: any[];
    dataKey: string;
    color?: string;
    className?: string; // Added className for flexibility
}

export function Sparkline({ data, dataKey, color = '#6366f1', className }: SparklineProps) {
    if (!data || data.length === 0) return <div className={cn("h-8 w-24", className)} />;

    return (
        <div className={cn("h-8 w-24", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
