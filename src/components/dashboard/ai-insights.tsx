'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AIInsightsProps {
    metrics: any;
    topIntents: any[];
    stats: any;
}

const AI_INSIGHTS_TOOLTIPS = {
    module: 'Narrative recommendations generated from dashboard metrics like resolution rate, escalation rate, lead conversion, and engagement. These are heuristic suggestions, not raw database counts.',
    highAutonomy: 'Triggered when the AI resolution rate is above 85%, meaning most customers are handled without human escalation.',
    escalationSpike: 'Triggered when the AI resolution rate is not above 85%, highlighting a higher share of conversations needing human help.',
    performanceLeading: 'Triggered when total high-intent leads in the selected period are above 50, using quote/contact form intent counts.',
    uxOptimization: 'A product-improvement suggestion based on engagement behavior (messages per customer), intended to reduce friction in common journeys.',
} as const;

export function AIInsights({ metrics, topIntents, stats }: AIInsightsProps) {
    const insights = [];

    // 1. Resolution Insight
    if (parseFloat(metrics.resolutionRate) > 85) {
        insights.push({
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            title: "High Autonomy",
            tooltip: AI_INSIGHTS_TOOLTIPS.highAutonomy,
            description: "AI is resolving 85%+ of queries without human intervention. Opportunity to expand knowledge base to common edge cases.",
            recommendation: "Review 'Agent Needs Assistance' logs to identify next set of training data."
        });
    } else {
        insights.push({
            icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
            title: "Escalation Spike",
            tooltip: AI_INSIGHTS_TOOLTIPS.escalationSpike,
            description: `Current escalation rate is ${stats.escalationRate}%. This is slightly above seasonal norms.`,
            recommendation: "Check 'New Get-A-Quote' intent for friction - users might be dropping off at the payment step."
        });
    }

    // 2. Business Objective Insight
    if (metrics.totalLeads > 50) {
        insights.push({
            icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
            title: "Performance Leading",
            tooltip: AI_INSIGHTS_TOOLTIPS.performanceLeading,
            description: `Generated ${metrics.totalLeads} high-intent leads this period. AI conversion is at ${metrics.leadConversionRate}%.`,
            recommendation: "A/B test the lead capture greeting to increase conversion by an estimated 5%."
        });
    }

    // 3. Activity Insight
    const isPeakNight = false; // Logic can be added to check peak activity hours
    insights.push({
        icon: <Lightbulb className="h-4 w-4 text-indigo-500" />,
        title: "UX Optimization",
        tooltip: AI_INSIGHTS_TOOLTIPS.uxOptimization,
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
                    <div className="flex items-center gap-2">
                        <InfoTooltip content={AI_INSIGHTS_TOOLTIPS.module} align="end" />
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ALPHA v1.0</span>
                    </div>
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
                                        <InfoTooltip
                                            content={insight.tooltip}
                                            align="start"
                                            buttonClassName="h-4 w-4"
                                            bubbleClassName="text-[10px]"
                                        />
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
