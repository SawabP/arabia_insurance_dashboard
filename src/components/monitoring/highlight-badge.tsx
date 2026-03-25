import React from 'react';
import { cn } from '@/lib/utils';

interface HighlightBadgeProps {
    code: string;
    label: string;
}

const CODE_STYLES: Record<string, string> = {
    high_frustration:
        'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
    failure_escalation:
        'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
    loop_detected:
        'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
    low_accuracy:
        'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
    unresolved_low_satisfaction:
        'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
    non_genuine:
        'bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400',
};

export function HighlightBadge({ code, label }: HighlightBadgeProps) {
    const styles = CODE_STYLES[code] ?? 'bg-muted text-muted-foreground';

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
                styles
            )}
        >
            {label}
        </span>
    );
}
