import * as React from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom";
type TooltipAlign = "start" | "center" | "end";

interface InfoTooltipProps {
    content: React.ReactNode;
    label?: string;
    side?: TooltipSide;
    align?: TooltipAlign;
    className?: string;
    buttonClassName?: string;
    bubbleClassName?: string;
}

const sideClasses: Record<TooltipSide, string> = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
};

const alignClasses: Record<TooltipAlign, string> = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
};

export function InfoTooltip({
    content,
    label = "What does this metric mean?",
    side = "bottom",
    align = "center",
    className,
    buttonClassName,
    bubbleClassName,
}: InfoTooltipProps) {
    return (
        <span className={cn("relative inline-flex shrink-0", className)}>
            <button
                type="button"
                aria-label={label}
                className={cn(
                    "peer inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    buttonClassName
                )}
            >
                <Info className="h-3 w-3" />
            </button>
            <span
                role="tooltip"
                className={cn(
                    "pointer-events-none absolute z-50 w-56 max-w-[calc(100vw-3rem)] sm:w-64 rounded-lg border border-border bg-popover/95 px-3 py-2 text-left text-[11px] leading-relaxed text-popover-foreground shadow-xl backdrop-blur-sm opacity-0 invisible transition-all duration-150 peer-hover:visible peer-hover:opacity-100 peer-hover:translate-y-0 peer-focus-visible:visible peer-focus-visible:opacity-100 peer-focus-visible:translate-y-0",
                    side === "top" ? "translate-y-1" : "-translate-y-1",
                    sideClasses[side],
                    alignClasses[align],
                    bubbleClassName
                )}
            >
                {content}
            </span>
        </span>
    );
}
