import { GRADE_COLORS } from './grade-colors';

const DIMENSION_KEYS = ['REL', 'ACC', 'COM', 'CLR', 'TON'] as const;

function scoreColor(s: number): string {
    if (s <= 4) return '#E24B4A';
    if (s <= 6) return '#EF9F27';
    return '#1D9E75';
}

function scoreBg(s: number): string {
    if (s <= 4) return 'rgba(226,75,74,0.12)';
    if (s <= 6) return 'rgba(239,159,39,0.12)';
    return 'rgba(29,158,117,0.12)';
}

export function MiniPerf({ scores }: { scores: number[] }) {
    return (
        <div className="relative group/perf">
            <div className="flex gap-0.5 items-end h-6 cursor-default">
                {scores.map((s, i) => (
                    <div
                        key={i}
                        className="w-1 rounded-sm"
                        style={{ height: `${s * 10}%`, backgroundColor: GRADE_COLORS.blue }}
                    />
                ))}
            </div>

            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 scale-95 group-hover/perf:opacity-100 group-hover/perf:scale-100 transition-all duration-150 origin-bottom">
                <div className="rounded-lg border border-border bg-popover shadow-lg px-2 py-2 whitespace-nowrap">
                    <div className="flex gap-1.5">
                        {scores.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums"
                                    style={{ backgroundColor: scoreBg(s), color: scoreColor(s) }}
                                >
                                    {s}
                                </div>
                                <div className="text-[8px] font-semibold text-muted-foreground tracking-wider leading-none">
                                    {DIMENSION_KEYS[i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-1.5 h-1.5 bg-popover border-b border-r border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-[4px]" />
            </div>
        </div>
    );
}
