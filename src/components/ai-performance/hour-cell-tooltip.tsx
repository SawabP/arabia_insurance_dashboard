interface HourCellTooltipProps {
    hour: number;
    volume: number;
    resolutionPct: number;
}

function formatHour12(hour: number) {
    const h = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return { time: `${h}:00`, period };
}

export function HourCellTooltip({ hour, volume, resolutionPct }: HourCellTooltipProps) {
    const noData = volume === 0;
    const { time, period } = formatHour12(hour);

    return (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 opacity-0 scale-95 group-hover/cell:opacity-100 group-hover/cell:scale-100 transition-all duration-150 origin-bottom">
            <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg whitespace-nowrap">
                <div className="flex items-baseline gap-1.5 mb-1.5 pb-1.5 border-b border-border">
                    <span className="text-xs font-semibold text-popover-foreground leading-none" style={{ fontFamily: "DSEG7, 'Courier New', monospace" }}>{time}</span>
                    <span className="text-[9px] font-medium text-muted-foreground">{period}</span>
                </div>
                {noData ? (
                    <div className="text-[10px] text-muted-foreground py-0.5">No data</div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <div className="text-sm font-bold text-popover-foreground leading-none">{volume}</div>
                            <div className="text-[9px] text-muted-foreground mt-1">convos</div>
                        </div>
                        <div className="w-px h-6 bg-border" />
                        <div className="text-center">
                            <div className="text-sm font-bold text-popover-foreground leading-none">{resolutionPct.toFixed(0)}%</div>
                            <div className="text-[9px] text-muted-foreground mt-1">resolved</div>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-1.5 h-1.5 bg-popover border-b border-r border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-[4px]" />
        </div>
    );
}
