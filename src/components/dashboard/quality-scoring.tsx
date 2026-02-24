'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Target, BarChart3, Star, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QualityScoringProps {
    metrics: any;
    trends: any[];
}

const QUALITY_TOOLTIPS = {
    module: 'Outcome Scoring summarizes AI performance using a weighted mix of automated resolution and lead conversion metrics.',
    aiQualityIndex: 'A cumulative AI-as-a-judge score that averages multiple graded conversation metrics (for example relevancy, accuracy, completeness, clarity, tone, and conversation-health/user-signal checks) into one overall index.',
    resolutionRate: 'Share of unique customers handled by the AI without a human handoff (calculated here as 100 minus Handoff Rate).',
    outputConversion: 'Share of unique customers who submitted high-intent actions like quote or contact forms.',
    trend: 'Daily quality score trend over time. Each bar shows the calculated AI quality score for that date.',
} as const;

export function QualityScoring({ metrics, trends }: QualityScoringProps) {
    const score = parseInt(metrics.qualityScore);

    return (
        <Card className="col-span-full xl:col-span-4 overflow-hidden border">
            <CardHeader className="border-b bg-muted/50 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Outcome Scoring Module
                    <InfoTooltip content={QUALITY_TOOLTIPS.module} align="start" />
                </CardTitle>
                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    metrics.status === 'Optimal' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                )}>
                    {metrics.status}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <Star className="h-3 w-3" />
                            AI Quality Index
                            <InfoTooltip content={QUALITY_TOOLTIPS.aiQualityIndex} />
                        </p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-3xl font-black">{score}</h3>
                            <span className="text-xs font-bold text-muted-foreground">/100</span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${score}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <Percent className="h-3 w-3" />
                            Autonomous Handling Rate
                            <InfoTooltip content={QUALITY_TOOLTIPS.resolutionRate} />
                        </p>
                        <h3 className="text-3xl font-black">{metrics.resolutionRate}%</h3>
                        <p className="text-[10px] text-emerald-500 font-bold">+2.4% vs last period</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <BarChart3 className="h-3 w-3" />
                            Output conversion
                            <InfoTooltip content={QUALITY_TOOLTIPS.outputConversion} />
                        </p>
                        <h3 className="text-3xl font-black">{metrics.leadConversionRate}%</h3>
                        <p className="text-[10px] text-muted-foreground font-bold">{metrics.totalLeads} High-Value Leads</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quality Trend Analysis</h4>
                        <InfoTooltip content={QUALITY_TOOLTIPS.trend} align="start" />
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <XAxis
                                    dataKey="date"
                                    hide
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    hide
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '10px'
                                    }}
                                />
                                <Bar
                                    dataKey="score"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
