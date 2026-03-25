'use client';

import { useMemo } from 'react';
import type { IntentDistributionResponse, IntentDistributionItem } from '@/lib/metrics-types';
import { SectionLabel } from './section-label';

interface ColumnDef {
    label: string;
    color: string;
    categories: string[];
}

const COLUMNS: ColumnDef[] = [
    {
        label: 'Policy Related',
        color: '#3b82f6',
        categories: ['Policy Related'],
    },
    {
        label: 'Claims & Billing',
        color: '#22c55e',
        categories: ['Claims Related', 'Billing & Payments'],
    },
    {
        label: 'Support & Admin',
        color: '#f97316',
        categories: ['Support & Complaints', 'Documents & Admin', 'Non-genuine'],
    },
];

export function IntentDistribution({ data }: { data: IntentDistributionResponse }) {
    const columns = useMemo(() => {
        const byCat = new Map<string, IntentDistributionItem[]>();
        for (const item of data.items) {
            const list = byCat.get(item.intent_category) ?? [];
            list.push(item);
            byCat.set(item.intent_category, list);
        }

        return COLUMNS.map((col) => {
            const items: IntentDistributionItem[] = [];
            for (const cat of col.categories) {
                const found = byCat.get(cat);
                if (found) items.push(...found);
            }
            // Sort descending by share
            items.sort((a, b) => b.share_pct - a.share_pct);
            return { ...col, items };
        }).filter((col) => col.items.length > 0);
    }, [data.items]);

    if (columns.length === 0) return null;

    return (
        <div>
            <SectionLabel>Intent distribution</SectionLabel>
            <p className="text-[11px] text-muted-foreground -mt-1 mb-3">
                Conversations by customer intent, grouped by category
            </p>

            <div className="flex gap-4">
                {columns.map((col) => (
                    <div key={col.label} className="flex-1 min-w-0">
                        {/* Category header */}
                        <div
                            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pb-1.5 mb-2"
                            style={{ borderBottom: `2px solid ${col.color}` }}
                        >
                            {col.label}
                        </div>

                        {/* Intent rows */}
                        <div className="space-y-1.5">
                            {col.items.map((item) => (
                                <div
                                    key={item.intent_code}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-[11px] text-foreground truncate flex-1 min-w-0">
                                        {item.intent_label}
                                    </span>

                                    {/* Mini progress bar */}
                                    <div className="w-[60px] h-1.5 rounded-full bg-muted flex-shrink-0">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.min(item.share_pct, 100)}%`,
                                                backgroundColor: col.color,
                                            }}
                                        />
                                    </div>

                                    <span className="text-[11px] tabular-nums text-muted-foreground w-[34px] text-right flex-shrink-0">
                                        {item.share_pct.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
