'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AgentPulseResponse, CorrelationsResponse, DailyTimelineResponse } from '@/lib/grades-types';
import { AgentPulse } from './agent-pulse';
import { Correlations } from './correlations';
import { DailyTimeline } from './daily-timeline';

const TABS = ['Agent Pulse', 'Correlations', 'Daily Timeline'] as const;

interface Props {
    agentPulse: AgentPulseResponse;
    correlations: CorrelationsResponse;
    dailyTimeline: DailyTimelineResponse;
}

export function AiPerformanceDashboard({ agentPulse, correlations, dailyTimeline }: Props) {
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

            {activeTab === 0 && <AgentPulse data={agentPulse} />}
            {activeTab === 1 && <Correlations data={correlations} />}
            {activeTab === 2 && <DailyTimeline data={dailyTimeline} />}
        </div>
    );
}
