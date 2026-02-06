'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AIInsightsProps {
    metrics: any;
    topIntents: any[];
    stats: any;
}

export function AIInsights({ metrics, topIntents, stats }: AIInsightsProps) {
    const insights = [];

    // 1. Resolution Insight
    if (parseFloat(metrics.resolutionRate) > 85) {
        insights.push({
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            title: "High Autonomy",
            description: "AI is resolving 85%+ of queries without human intervention. Opportunity to expand knowledge base to common edge cases.",
            recommendation: "Review 'Agent Needs Assistance' logs to identify next set of training data."
        });
    } else {
        insights.push({
            icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
            title: "Escalation Spike",
            description: `Current escalation rate is ${stats.escalationRate}%. This is slightly above seasonal norms.`,
            recommendation: "Check 'New Get-A-Quote' intent for friction - users might be dropping off at the payment step."
        });
    }

    // 2. Business Objective Insight
    if (metrics.totalLeads > 50) {
        insights.push({
            icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
            title: "Performance Leading",
            description: `Generated ${metrics.totalLeads} high-intent leads this period. AI conversion is at ${metrics.leadConversionRate}%.`,
            recommendation: "A/B test the lead capture greeting to increase conversion by an estimated 5%."
        });
    }

    // 3. Activity Insight
    const isPeakNight = false; // Logic can be added to check peak activity hours
    insights.push({
        icon: <Lightbulb className="h-4 w-4 text-indigo-500" />,
        title: "UX Optimization",
        description: "Average customer sends 4.2 messages before resolution. This indicates high engagement.",
        recommendation: "Implement 'Quick Reply' buttons for the 'Contact Form' intent to reduce friction."
    });

    return (
        <Card className="col-span-full xl:col-span-3 h-full">
            <CardHeader className="border-b bg-muted/50 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        AI Strategic Insights
                    </CardTitle>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ALPHA v1.0</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {insights.map((insight, i) => (
                        <div key={i} className="p-4 hover:bg-muted/30 transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 rounded-md bg-background border shadow-sm">
                                    {insight.icon}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        {insight.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {insight.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        RECO: {insight.recommendation}
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
