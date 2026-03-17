import { cn } from '@/lib/utils';

export function ScoreDot({ value }: { value: number }) {
    const style =
        value <= 4
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : value <= 6
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';

    return (
        <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium', style)}>
            {value}
        </span>
    );
}
