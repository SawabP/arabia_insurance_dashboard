'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AgentPulseResponse, CorrelationsResponse, DailyTimelineResponse } from '@/lib/grades-types';
import type { ScoreTrendResponse, OutcomeTrendResponse, IntentDistributionResponse, IntentTrendResponse } from '@/lib/metrics-types';
import { AgentPulse } from './agent-pulse';
import { Correlations } from './correlations';
import { DailyTimeline } from './daily-timeline';
import { TrendsTab } from './trends-tab';

const TABS = ['Agent Pulse', 'Correlations', 'Daily Timeline', 'Trends'] as const;

interface Props {
    agentPulse: AgentPulseResponse;
    scoreTrends: ScoreTrendResponse;
    intentDistribution: IntentDistributionResponse;
    correlations: CorrelationsResponse;
    dailyTimeline: DailyTimelineResponse;
    outcomeTrends: OutcomeTrendResponse;
    outcomeTrendsPrev: OutcomeTrendResponse;
    intentDistributionPrev: IntentDistributionResponse;
    intentTrend: IntentTrendResponse;
}

export function AiPerformanceDashboard({
    agentPulse, scoreTrends, intentDistribution,
    correlations, dailyTimeline,
    outcomeTrends, outcomeTrendsPrev, intentDistributionPrev, intentTrend,
}: Props) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className="flex gap-0 border-b mb-6">
                {TABS.map((label, i) => (
                    <button
                        key={label}
                        onClick={() => setActiveTab(i)}
                        className={cn(
                            'px-4 py-2 text-sm font-medium transition-colors -mb-px',
                            activeTab === i
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 0 && <AgentPulse data={agentPulse} scoreTrends={scoreTrends} intentDistribution={intentDistribution} />}
            {activeTab === 1 && <Correlations data={correlations} />}
            {activeTab === 2 && <DailyTimeline data={dailyTimeline} />}
            {activeTab === 3 && (
                <TrendsTab
                    outcomeTrends={outcomeTrends}
                    outcomeTrendsPrev={outcomeTrendsPrev}
                    intentDistribution={intentDistribution}
                    intentDistributionPrev={intentDistributionPrev}
                    intentTrend={intentTrend}
                />
            )}
        </div>
    );
}
