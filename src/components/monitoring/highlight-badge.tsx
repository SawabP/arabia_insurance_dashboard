import React from 'react';
import { cn } from '@/lib/utils';

interface HighlightBadgeProps {
    code: string;
    label: string;
}

const CODE_STYLES: Record<string, string> = {
    high_frustration:
        'bg-[#FEF2F2] text-[#E24B4A]',
    failure_escalation:
        'bg-[#FFF7ED] text-[#D85A30]',
    loop_detected:
        'bg-[#FFFBEB] text-[#EF9F27]',
    low_accuracy:
        'bg-[#FEF2F2] text-[#DC2626]',
    unresolved_low_satisfaction:
        'bg-[#F5F3FF] text-[#7C3AED]',
    non_genuine:
        'bg-[#F3F4F6] text-[#6B7280]',
};

export function HighlightBadge({ code, label }: HighlightBadgeProps) {
    const styles = CODE_STYLES[code] ?? 'bg-muted text-muted-foreground';

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-semibold leading-4',
                styles
            )}
        >
            {label}
        </span>
    );
}
